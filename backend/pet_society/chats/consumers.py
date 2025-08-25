import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from .models import ChatGroup, GroupMessage
from .encryption import encrypt_message

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        self.user = self.scope['user']

        # Check if user is authenticated
        if not self.user.is_authenticated:
            await self.close(code=4001)  # Custom close code for authentication error
            return

        try:
            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            # Add user to online users
            await self.add_user_to_room()

            await self.accept()

            # Send user list to all users in the room
            await self.send_user_list()
        except Exception as e:
            print(f"WebSocket connection error: {e}")
            await self.close(code=4000)  # Custom close code for general error

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name') and self.user.is_authenticated:
            # Remove user from online users
            await self.remove_user_from_room()

            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

            # Send updated user list
            await self.send_user_list()

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type', 'chat_message')

            if message_type == 'chat_message':
                message = text_data_json['message']
                
                # Save message to database
                group_message, original_message = await self.save_message(message)
                
                # Send message to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': original_message,  # Send the original (decrypted) message
                        'username': self.user.username,
                        'user_id': self.user.id,
                        'timestamp': group_message.created.isoformat(),
                        'message_id': group_message.id,
                    }
                )

                # Send global notifications to all chat members
                await self.send_message_notifications(group_message, message)
            elif message_type == 'typing':
                # Handle typing indicator
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'typing_indicator',
                        'username': self.user.username,
                        'user_id': self.user.id,
                        'is_typing': text_data_json.get('is_typing', False),
                    }
                )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON format'
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'error': f'Error processing message: {str(e)}'
            }))

    async def chat_message(self, event):
        # Send message to WebSocket (including back to sender for confirmation)
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'username': event['username'],
            'user_id': event['user_id'],
            'timestamp': event['timestamp'],
            'message_id': event['message_id'],
        }))

    async def typing_indicator(self, event):
        # Don't send typing indicator to the user who is typing
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing_indicator',
                'username': event['username'],
                'user_id': event['user_id'],
                'is_typing': event['is_typing'],
            }))

    async def user_list_update(self, event):
        # Send updated user list to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'user_list_update',
            'users': event['users'],
        }))

    @database_sync_to_async
    def save_message(self, message):
        chat_group, _ = ChatGroup.objects.get_or_create(name=self.room_name)
        
        # Encrypt the message
        encrypted_body = encrypt_message(message)
        if not encrypted_body:
            # If encryption fails, store the original message
            encrypted_body = message
            is_encrypted = False
        else:
            is_encrypted = True
        
        group_message = GroupMessage.objects.create(
            group=chat_group,
            author=self.user,
            encrypted_body=encrypted_body,
            is_encrypted=is_encrypted
        )
        return group_message, message  # Return both the message object and original message

    async def send_message_notifications(self, group_message, message):
        """Send message notifications to all chat members who are not currently in this room"""
        try:
            # Get chat group and all its members
            chat_group = await self.get_chat_group()
            if not chat_group:
                return

            member_ids = await self.get_chat_members(chat_group.id)

            # Send notification to each member (except the sender)
            for member_id in member_ids:
                if member_id != self.user.id:
                    # Check if this user has already read this message
                    # (This is a new message, so it won't be read yet, but we keep this for future use)
                    await self.channel_layer.group_send(
                        f'user_{member_id}',
                        {
                            'type': 'chat_message_notification',
                            'chat_id': chat_group.id,
                            'chat_name': chat_group.name,
                            'is_private': chat_group.is_private,
                            'message': message,
                            'message_id': group_message.id,
                            'author': {
                                'id': self.user.id,
                                'username': self.user.username,
                                'first_name': self.user.first_name,
                                'last_name': self.user.last_name,
                            },
                            'timestamp': group_message.created.isoformat(),
                        }
                    )
        except Exception as e:
            print(f"Error sending message notifications: {e}")

    @database_sync_to_async
    def get_chat_group(self):
        try:
            return ChatGroup.objects.get(name=self.room_name)
        except ChatGroup.DoesNotExist:
            return None

    @database_sync_to_async
    def get_chat_members(self, chat_id):
        try:
            chat = ChatGroup.objects.get(id=chat_id)
            return list(chat.members.values_list('id', flat=True))
        except ChatGroup.DoesNotExist:
            return []

    @database_sync_to_async
    def add_user_to_room(self):
        chat_group, _ = ChatGroup.objects.get_or_create(name=self.room_name)
        chat_group.users_online.add(self.user)
        if not chat_group.members.filter(id=self.user.id).exists():
            chat_group.members.add(self.user)

    @database_sync_to_async
    def remove_user_from_room(self):
        try:
            if self.user.is_authenticated:
                chat_group = ChatGroup.objects.get(name=self.room_name)
                chat_group.users_online.remove(self.user)
        except ChatGroup.DoesNotExist:
            pass

    @database_sync_to_async
    def get_online_users(self):
        try:
            chat_group = ChatGroup.objects.get(name=self.room_name)
            return list(chat_group.users_online.values('id', 'username'))
        except ChatGroup.DoesNotExist:
            return []

    async def send_user_list(self):
        users = await self.get_online_users()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_list_update',
                'users': users,
            }
        )
