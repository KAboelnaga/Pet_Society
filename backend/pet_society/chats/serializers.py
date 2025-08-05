from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ChatGroup, GroupMessage

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'image']


class GroupMessageSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = GroupMessage
        fields = ['id', 'author', 'body', 'created']
        read_only_fields = ['id', 'author', 'created']


class ChatGroupSerializer(serializers.ModelSerializer):
    messages = GroupMessageSerializer(many=True, read_only=True)
    users_online = UserSerializer(many=True, read_only=True)
    members = UserSerializer(many=True, read_only=True)
    online_count = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatGroup
        fields = [
            'id', 'name', 'is_private', 'messages', 'users_online', 
            'members', 'online_count', 'member_count'
        ]
        read_only_fields = ['id', 'users_online']
    
    def get_online_count(self, obj):
        return obj.users_online.count()
    
    def get_member_count(self, obj):
        return obj.members.count()


class ChatGroupListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing chat groups without messages"""
    online_count = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = ChatGroup
        fields = [
            'id', 'name', 'is_private', 'online_count',
            'member_count', 'last_message', 'members'
        ]
    
    def get_online_count(self, obj):
        return obj.users_online.count()
    
    def get_member_count(self, obj):
        return obj.members.count()
    
    def get_last_message(self, obj):
        last_message = obj.messages.first()  # Since ordering is ['-created']
        if last_message:
            return {
                'id': last_message.id,
                'body': last_message.body,
                'author': last_message.author.username,
                'created': last_message.created
            }
        return None
