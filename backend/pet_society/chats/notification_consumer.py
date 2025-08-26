import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatGroup

User = get_user_model()

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.user_group_name = f'user_{self.user_id}'
        self.user = self.scope['user']

        # Check if user is authenticated
        if not self.user.is_authenticated:
            await self.close(code=4001)
            return

        # Join user's personal notification group
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )

        await self.accept()
        print(f"User {self.user.username} connected to notifications")

    async def disconnect(self, close_code):
        # Leave user's personal notification group
        await self.channel_layer.group_discard(
            self.user_group_name,
            self.channel_name
        )
        print(f"User {self.user.username} disconnected from notifications")

    async def receive(self, text_data):
        # Handle any incoming messages if needed
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': data.get('timestamp')
                }))
        except json.JSONDecodeError:
            pass

    # Handle new chat creation notification
    async def new_chat_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_chat_created',
            'chat_id': event['chat_id'],
            'chat_name': event['chat_name'],
            'is_private': event['is_private'],
            'created_by': event['created_by'],
            'members': event['members']
        }))

    # Handle user invitation notification
    async def user_invited(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_invited',
            'chat_id': event['chat_id'],
            'chat_name': event['chat_name'],
            'is_private': event['is_private'],
            'invited_by': event['invited_by']
        }))

    # Handle new message notification (for chats user is not currently viewing)
    async def chat_message_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message_notification',
            'chat_id': event['chat_id'],
            'chat_name': event['chat_name'],
            'is_private': event['is_private'],
            'message': event['message'],
            'author': event['author'],
            'timestamp': event['timestamp']
        }))


# Utility functions to send notifications
@database_sync_to_async
def get_chat_members(chat_id):
    try:
        chat = ChatGroup.objects.get(id=chat_id)
        return list(chat.members.values_list('id', flat=True))
    except ChatGroup.DoesNotExist:
        return []

@database_sync_to_async
def get_user_info(user_id):
    try:
        user = User.objects.get(id=user_id)
        return {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name
        }
    except User.DoesNotExist:
        return None

async def notify_new_chat_created(channel_layer, chat_id, chat_name, is_private, created_by_id, member_ids):
    """Notify all members about a new chat being created"""
    created_by = await get_user_info(created_by_id)
    
    for member_id in member_ids:
        if member_id != created_by_id:  # Don't notify the creator
            await channel_layer.group_send(
                f'user_{member_id}',
                {
                    'type': 'new_chat_created',
                    'chat_id': chat_id,
                    'chat_name': chat_name,
                    'is_private': is_private,
                    'created_by': created_by,
                    'members': member_ids
                }
            )

async def notify_user_invited(channel_layer, chat_id, chat_name, is_private, invited_by_id, invited_user_id):
    """Notify a user when they're invited to a chat"""
    invited_by = await get_user_info(invited_by_id)
    
    await channel_layer.group_send(
        f'user_{invited_user_id}',
        {
            'type': 'user_invited',
            'chat_id': chat_id,
            'chat_name': chat_name,
            'is_private': is_private,
            'invited_by': invited_by
        }
    )
