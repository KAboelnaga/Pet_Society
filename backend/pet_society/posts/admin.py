from django.contrib import admin
from .models import Post, Category, Like

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'created_at', 'likes_count', 'comments_count']
    list_filter = ['created_at', 'category', 'author']
    search_fields = ['title', 'content', 'author__username']
    readonly_fields = ['created_at', 'likes_count', 'comments_count']
    date_hierarchy = 'created_at'

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'is_liked', 'created_at']
    list_filter = ['is_liked', 'created_at', 'user', 'post']
    search_fields = ['user__username', 'post__title']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
