from rest_framework import serializers
from .models import Post, Category, Like
from comments.serializers import CommentSerializer

class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for Category model.
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
    # Add likes and comments count
    likes_count = serializers.ReadOnlyField()
    comments_count = serializers.ReadOnlyField()

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
            'likes_count',
            'comments_count',
        ]


class PostDetailSerializer(PostSerializer):
    """
    Detailed serializer for Post with comments
    """
    comments = serializers.SerializerMethodField()

    class Meta(PostSerializer.Meta):
        fields = PostSerializer.Meta.fields + ['comments']

    def get_comments(self, obj):
        """Get top-level comments for this post"""
        top_level_comments = obj.comments.filter(parent_comment__isnull=True)
        return CommentSerializer(top_level_comments, many=True).data


class LikeSerializer(serializers.ModelSerializer):
    """Serializer for Like model"""
    user = serializers.StringRelatedField(read_only=True)
    post = serializers.PrimaryKeyRelatedField(queryset=Post.objects.all())

    class Meta:
        model = Like
        fields = ['id', 'user', 'post', 'is_liked', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def create(self, validated_data):
        # Set the user from the request user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
