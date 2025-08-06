from rest_framework import serializers
from .models import Post, Category

class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for Category model.
    Used to output category data via the API.
    """
    class Meta:
        model = Category
        fields = ['id', 'name']

class PostSerializer(serializers.ModelSerializer):
    """
    Serializer for Post model.
    Used to output post data for the homepage and post lists.
    Includes category name and author username for display.
    """
    category = serializers.StringRelatedField()
    author = serializers.StringRelatedField()

    class Meta:
        model = Post
        fields = ['id', 'title', 'image', 'content', 'category', 'author', 'created_at']