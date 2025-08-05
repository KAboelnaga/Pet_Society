from django.shortcuts import render, get_object_or_404, redirect
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import ChatGroup, GroupMessage
from .serializers import (
    ChatGroupSerializer,
    ChatGroupListSerializer,
    GroupMessageSerializer,
    UserSerializer
)
from .notification_consumer import notify_new_chat_created, notify_user_invited

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

    def create(self, request):
        """Create a new chat group"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            chat_group = serializer.save()
            chat_group.members.add(request.user)

            # Handle single user invitation
            invite_user = request.data.get('invite_user')
            if invite_user:
                try:
                    user_to_invite = User.objects.get(username=invite_user)
                    chat_group.members.add(user_to_invite)
                except User.DoesNotExist:
                    pass  # Continue without error if user not found

            # Handle multiple users invitation (for group chats)
            invite_users = request.data.get('invite_users')
            if invite_users and isinstance(invite_users, list):
                for username in invite_users:
                    try:
                        user_to_invite = User.objects.get(username=username.strip())
                        chat_group.members.add(user_to_invite)
                    except User.DoesNotExist:
                        pass  # Continue without error if user not found

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

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get messages for a chat group"""
        chat_group = self.get_object()
        messages = chat_group.messages.all()[:50]  # Last 50 messages
        serializer = GroupMessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send a message to a chat group"""
        chat_group = self.get_object()
        serializer = GroupMessageSerializer(data=request.data)
        if serializer.is_valid():
            message = serializer.save(
                author=request.user,
                group=chat_group
            )
            return Response(
                GroupMessageSerializer(message).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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


class GroupMessageViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = GroupMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GroupMessage.objects.filter(
            group__members=self.request.user
        ).select_related('author', 'group')


# Traditional Django views for templates (if needed)
def chat_room(request, room_name):
    """Render chat room template"""
    if not request.user.is_authenticated:
        return redirect('users:login')

    chat_group, created = ChatGroup.objects.get_or_create(name=room_name)
    if not chat_group.members.filter(id=request.user.id).exists():
        chat_group.members.add(request.user)

    context = {
        'room_name': room_name,
        'chat_group': chat_group,
        'user': request.user,
    }
    return render(request, 'chats/room.html', context)


def chat_index(request):
    """List all available chat rooms"""
    if not request.user.is_authenticated:
        return redirect('users:login')

    chat_groups = ChatGroup.objects.filter(members=request.user)
    context = {
        'chat_groups': chat_groups,
    }
    return render(request, 'chats/index.html', context)
