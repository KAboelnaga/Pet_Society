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
    body = serializers.CharField(write_only=True, required=False, allow_blank=True)  # For accepting text messages
    image = serializers.ImageField(required=False)  # For accepting image uploads
    message = serializers.SerializerMethodField()  # For displaying the message content
    image_url = serializers.SerializerMethodField()  # For displaying image URL
    
    class Meta:
        model = GroupMessage
        fields = ['id', 'author', 'body', 'image', 'message', 'image_url', 'message_type', 'created']
        read_only_fields = ['id', 'author', 'message', 'image_url', 'created']
    
    def get_message(self, obj):
        """Return decrypted message content for text messages"""
        if obj.message_type == 'image':
            return None  # No text content for image messages
        
        if obj.is_encrypted and obj.encrypted_body:
            from .encryption import decrypt_message
            decrypted = decrypt_message(obj.encrypted_body)
            return decrypted if decrypted else '[Encrypted Message]'
        return obj.encrypted_body
    
    def get_image_url(self, obj):
        """Return image URL for image messages"""
        if obj.message_type == 'image' and obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def create(self, validated_data):
        from .encryption import encrypt_message
        
        # Determine message type based on provided data
        has_image = 'image' in validated_data and validated_data['image']
        has_text = 'body' in validated_data and validated_data['body']
        
        if has_image:
            # Image message
            message_type = 'image'
            encrypted_body = None
            is_encrypted = False
            validated_data.pop('body', None)  # Remove text body if present
        else:
            # Text message
            message_type = 'text'
            message = validated_data.pop('body', '')
            encrypted_body = encrypt_message(message)
            
            if not encrypted_body:
                encrypted_body = message
                is_encrypted = False
            else:
                is_encrypted = True
            
            validated_data.pop('image', None)  # Remove image if present
            
        # Create the message
        return GroupMessage.objects.create(
            encrypted_body=encrypted_body,
            message_type=message_type,
            is_encrypted=is_encrypted,
            **validated_data
        )


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
    unread_count = serializers.SerializerMethodField()
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = ChatGroup
        fields = [
            'id', 'name', 'is_private', 'online_count',
            'member_count', 'last_message', 'unread_count', 'members'
        ]
    
    def get_online_count(self, obj):
        return obj.users_online.count()
    
    def get_member_count(self, obj):
        return obj.members.count()
    
    def get_last_message(self, obj):
        last_message = obj.messages.first()  # Since ordering is ['-created']
        if last_message:
            if last_message.message_type == 'image':
                return {
                    'id': last_message.id,
                    'body': '📷 Image',  # Display indicator for image messages
                    'author': last_message.author.username,
                    'created': last_message.created
                }
            else:
                from .encryption import decrypt_message
                message_content = decrypt_message(last_message.encrypted_body) if last_message.is_encrypted else last_message.encrypted_body
                return {
                    'id': last_message.id,
                    'body': message_content if message_content else '[Encrypted Message]',
                    'author': last_message.author.username,
                    'created': last_message.created
                }
        return None

    def get_unread_count(self, obj):
        """Get count of unread messages for the current user"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0

        # Count messages in this chat that the user hasn't read
        # Exclude messages authored by the user and messages they have read
        unread_count = obj.messages.exclude(author=request.user).exclude(
            read_by__user=request.user
        ).count()

        return unread_count
