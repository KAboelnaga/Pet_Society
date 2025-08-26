from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import ChatGroup, GroupMessage, MessageRead
from .serializers import (
    ChatGroupSerializer,
    ChatGroupListSerializer,
    GroupMessageSerializer,
    UserSerializer
)
from .notification_consumer import notify_new_chat_created, notify_user_invited
from .encryption import encrypt_message

User = get_user_model()


@method_decorator(csrf_exempt, name='dispatch')
class ChatGroupViewSet(viewsets.ModelViewSet):
    serializer_class = ChatGroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatGroup.objects.filter(members=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return ChatGroupListSerializer
        return ChatGroupSerializer

    def get_serializer_context(self):
        """Pass request context to serializer for unread count calculation"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def create(self, request):
        """Create a new chat group"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Check for existing private chat before creating
            invite_user = request.data.get('invite_user')
            is_private = request.data.get('is_private', False)

            if invite_user and is_private:
                # Validate if the user exists before proceeding
                if not User.objects.filter(username=invite_user).exists():
                    return Response(
                        {'error': f'User {invite_user} not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                try:
                    user_to_invite = User.objects.get(username=invite_user)

                    # Check if private chat already exists between these two users
                    existing_chat = ChatGroup.objects.filter(
                        is_private=True,
                        members=request.user
                    ).filter(
                        members=user_to_invite
                    ).first()

                    if existing_chat:
                        # Return existing chat instead of creating new one
                        return Response(
                            ChatGroupSerializer(existing_chat).data,
                            status=status.HTTP_200_OK
                        )

                except User.DoesNotExist:
                    pass  # Continue with creation if user not found

            chat_group = serializer.save()
            chat_group.members.add(request.user)

            # Handle single user invitation
            if invite_user:
                try:
                    user_to_invite = User.objects.get(username=invite_user)
                    chat_group.members.add(user_to_invite)
                except User.DoesNotExist:
                    chat_group.delete()  # Clean up the created chat group
                    return Response(
                        {'error': f'User "{invite_user}" does not exist'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Handle multiple users invitation (for group chats)
            invite_users = request.data.get('invite_users')
            if invite_users and isinstance(invite_users, list):
                non_existent_users = []
                for username in invite_users:
                    try:
                        user_to_invite = User.objects.get(username=username.strip())
                        chat_group.members.add(user_to_invite)
                    except User.DoesNotExist:
                        non_existent_users.append(username.strip())
                
                if non_existent_users:
                    chat_group.delete()  # Clean up the created chat group
                    if len(non_existent_users) == 1:
                        return Response(
                            {'error': f'User "{non_existent_users[0]}" does not exist'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    else:
                        return Response(
                            {'error': f'Users {', '.join([f'"{u}"' for u in non_existent_users])} do not exist'},
                            status=status.HTTP_400_BAD_REQUEST
                        )

            # Send real-time notifications to all members
            channel_layer = get_channel_layer()
            member_ids = list(chat_group.members.values_list('id', flat=True))

            if channel_layer:
                async_to_sync(notify_new_chat_created)(
                    channel_layer,
                    chat_group.id,
                    chat_group.name,
                    chat_group.is_private,
                    request.user.id,
                    member_ids
                )

            return Response(
                ChatGroupSerializer(chat_group).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join a chat group"""
        chat_group = self.get_object()
        chat_group.members.add(request.user)
        return Response({'status': 'joined'})

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Leave a chat group"""
        chat_group = self.get_object()
        chat_group.members.remove(request.user)
        chat_group.users_online.remove(request.user)
        return Response({'status': 'left'})

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark all messages in this chat as read for the current user"""
        chat_group = self.get_object()

        # Get all messages in this chat that the user hasn't read yet
        unread_messages = chat_group.messages.exclude(author=request.user).exclude(
            read_by__user=request.user
        )

        # Mark all unread messages as read
        read_records = []
        for message in unread_messages:
            read_record, created = MessageRead.objects.get_or_create(
                message=message,
                user=request.user
            )
            if created:
                read_records.append(read_record)

        return Response({
            'status': 'marked_as_read',
            'chat_id': chat_group.id,
            'user_id': request.user.id,
            'messages_marked': len(read_records)
        })

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get messages for a chat group with pagination support"""
        chat_group = self.get_object()
        
        # Get pagination parameters
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 50))
        before_message_id = request.query_params.get('before_message_id')
        
        # Start with all messages, ordered by creation date (newest first)
        messages_queryset = chat_group.messages.all().order_by('-created')
        
        # If before_message_id is provided, get messages before that message
        if before_message_id:
            try:
                before_message = chat_group.messages.get(id=before_message_id)
                messages_queryset = messages_queryset.filter(created__lt=before_message.created)
            except GroupMessage.DoesNotExist:
                pass
        
        # Apply pagination
        start = (page - 1) * page_size
        end = start + page_size
        messages = messages_queryset[start:end]
        
        # Check if there are more messages
        has_more = messages_queryset.count() > end
        
        serializer = GroupMessageSerializer(messages, many=True)
        return Response({
            'messages': serializer.data,
            'has_more': has_more,
            'page': page,
            'page_size': page_size
        })

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send a message to a chat group"""
        chat_group = self.get_object()
        serializer = GroupMessageSerializer(data=request.data)
        if serializer.is_valid():
            # Create the message - encryption is handled in serializer
            message = serializer.save(
                author=request.user,
                group=chat_group
            )
            return Response(
                GroupMessageSerializer(message).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get total unread message count for the current user across all chats"""
        user_chat_groups = ChatGroup.objects.filter(members=request.user)
        total_unread = 0
        
        for chat_group in user_chat_groups:
            # Count unread messages for this chat (messages not authored by user and not read by user)
            unread_count = chat_group.messages.exclude(author=request.user).exclude(
                read_by__user=request.user
            ).count()
            total_unread += unread_count
        
        return Response({
            'total_unread_count': total_unread
        })

    @action(detail=True, methods=['post'])
    def invite_user(self, request, pk=None):
        """Invite a user to the chat group"""
        chat_group = self.get_object()
        username = request.data.get('username')

        if not username:
            return Response(
                {'error': 'Username is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_to_invite = User.objects.get(username=username)
            chat_group.members.add(user_to_invite)
            return Response({
                'message': f'User {username} invited to {chat_group.name}',
                'user': UserSerializer(user_to_invite).data
            })
        except User.DoesNotExist:
            return Response(
                {'error': f'User {username} not found'},
                status=status.HTTP_404_NOT_FOUND
            )





