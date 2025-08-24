from rest_framework import serializers
from .models import Post, Category, Like

class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for Category model.
    Used to output category data via the API.
    """
    class Meta:
        model = Category
        fields = ['id', 'name']

class LikeSerializer(serializers.ModelSerializer):
    """
    Serializer for Like model.
    """
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Like
        fields = ['id', 'user', 'user_username', 'post', 'is_liked', 'created_at']
        read_only_fields = ['user', 'created_at']

class PostSerializer(serializers.ModelSerializer):
    """
    Serializer for Post model.
    Used to output post data for the homepage and post lists.
    Includes category name and author username for display.
    """
    category = serializers.StringRelatedField()
    author = serializers.StringRelatedField()
    like_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    is_liked_by_user = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'image', 'content', 'category', 'author', 
            'created_at', 'like_count', 'comment_count', 'is_liked_by_user'
        ]

    def get_is_liked_by_user(self, obj):
        """Check if the current user has liked this post."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user, is_liked=True).exists()
        return False