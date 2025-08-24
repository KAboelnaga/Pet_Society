from rest_framework import serializers
from .models import Comment
from users.models import User

class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for Comment model.
    """
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    reply_count = serializers.IntegerField(read_only=True)
    is_reply = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Comment
        fields = [
            'id', 'post', 'author', 'author_username', 'author_id',
            'content', 'parent_comment', 'created_at', 'updated_at',
            'is_edited', 'reply_count', 'is_reply'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at', 'is_edited']

class CommentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new comments.
    """
    class Meta:
        model = Comment
        fields = ['post', 'content', 'parent_comment']

class CommentUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating existing comments.
    """
    class Meta:
        model = Comment
        fields = ['content']
        read_only_fields = ['post', 'author', 'parent_comment']

class CommentReplySerializer(serializers.ModelSerializer):
    """
    Serializer for comment replies.
    """
    author_username = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = Comment
        fields = [
            'id', 'author', 'author_username', 'content',
            'parent_comment', 'created_at', 'is_edited'
        ]
        read_only_fields = ['author', 'parent_comment', 'created_at', 'is_edited']
