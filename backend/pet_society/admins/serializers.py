from rest_framework import serializers
from .models import Category
from users.models import User
from posts.models import Post

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at']

class CategoryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['name', 'description']

class UserSerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'is_blocked', 'is_admin', 'is_superuser', 'created_at',
            'image', 'bio', 'location', 'posts_count'
        ]
        read_only_fields = ['id', 'created_at', 'posts_count']

    def get_posts_count(self, obj):
        return obj.posts.count()

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['is_blocked', 'is_admin']

class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id', 'user', 'category', 'title', 'content', 
            'post_type', 'price', 'image', 'location', 'contact_info',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class PostListSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    category = serializers.StringRelatedField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'user', 'category', 'title', 'post_type', 
            'price', 'location', 'is_active', 'created_at'
        ] 