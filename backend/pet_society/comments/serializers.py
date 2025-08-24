from rest_framework import serializers
from .models import Comment
from users.serializers import UserSerializer

class CommentSerializer(serializers.ModelSerializer):
    """Serializer for Comment model"""
    author = UserSerializer(read_only=True)
    author_username = serializers.CharField(write_only=True, required=False)
    replies_count = serializers.ReadOnlyField()
    is_reply = serializers.ReadOnlyField()

    class Meta:
        model = Comment
        fields = [
            'id', 'content', 'author', 'author_username', 'post', 
            'parent_comment', 'created_at', 'updated_at', 
            'replies_count', 'is_reply'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'replies_count', 'is_reply']

    def create(self, validated_data):
        # Set the author from the request user
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class CommentDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Comment with nested replies"""
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    replies_count = serializers.ReadOnlyField()
    is_reply = serializers.ReadOnlyField()

    class Meta:
        model = Comment
        fields = [
            'id', 'content', 'author', 'post', 'parent_comment',
            'created_at', 'updated_at', 'replies', 'replies_count', 'is_reply'
        ]

    def get_replies(self, obj):
        """Get nested replies for this comment"""
        replies = obj.replies.all()
        return CommentSerializer(replies, many=True).data
