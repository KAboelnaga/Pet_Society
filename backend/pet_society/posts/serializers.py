# serializers.py
from rest_framework import serializers
from .models import Post, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]

class PostSerializer(serializers.ModelSerializer):
    # Show author username
    username = serializers.CharField(source="author.username", read_only=True)
    # Return full category object when reading
    category = CategorySerializer(read_only=True)
    # Accept category id when writing
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True
    )

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "image",
            "content",
            "category",      # read → {id, name}
            "category_id",   # write → category id
            "username",      # read → author.username
            "created_at",
        ]
