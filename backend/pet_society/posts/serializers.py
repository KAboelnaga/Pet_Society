# serializers.py
from rest_framework import serializers
from .models import Post, Category, Like
from comments.serializers import CommentSerializer

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    class Meta:
        model = Category
        fields = ["id", "name",]


class PostSerializer(serializers.ModelSerializer):
    # Show username instead of email
    username = serializers.CharField(source="author.username", read_only=True)
    # Show category name
    category_name = serializers.CharField(source="category.name", read_only=True)
    # Accept category id when writing
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True
    )
    # Keep likes and comments counts
    likes_count = serializers.ReadOnlyField()
    comments_count = serializers.ReadOnlyField()

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "image",
            "content",
            "category_id",     # write
            "category_name",   # read
            "username",        # read
            "created_at",
            "likes_count",
            "post_type",
            "comments_count",
        ]


class PostDetailSerializer(PostSerializer):
    """Detailed serializer for Post with comments"""
    comments = serializers.SerializerMethodField()

    class Meta(PostSerializer.Meta):
        fields = PostSerializer.Meta.fields + ["comments"]

    def get_comments(self, obj):
        top_level_comments = obj.comments.filter(parent_comment__isnull=True)
        return CommentSerializer(top_level_comments, many=True).data


class LikeSerializer(serializers.ModelSerializer):
    """Serializer for Like model"""
    user = serializers.StringRelatedField(read_only=True)
    post = serializers.PrimaryKeyRelatedField(queryset=Post.objects.all())

    class Meta:
        model = Like
        fields = ["id", "user", "post", "is_liked", "created_at"]
        read_only_fields = ["id", "user", "created_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
