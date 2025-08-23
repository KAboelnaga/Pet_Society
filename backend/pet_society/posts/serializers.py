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
    Handles both reading and writing of posts.
    - On read: show category name and author username
    - On write: accept category ID, author is set automatically
    """
    # Accept category id when writing
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    # Show category name when reading
    category_name = serializers.CharField(source='category.name', read_only=True)
    # Show author username when reading
    author = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Post
        fields = [
            'id',
            'title',
            'image',
            'content',
            'category',       # for sending id when creating/updating
            'category_name',  # for displaying readable name in responses
            'author',
            'created_at',
        ]
