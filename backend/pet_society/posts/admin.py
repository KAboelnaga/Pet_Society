from django.contrib import admin
from .models import Post, Category, Like

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'post_count']
    search_fields = ['name']
    
    def post_count(self, obj):
        return obj.posts.count()
    post_count.short_description = 'Number of Posts'

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'author', 'category', 'created_at', 'like_count', 'comment_count']
    list_filter = ['category', 'created_at', 'author']
    search_fields = ['title', 'content', 'author__username']
    readonly_fields = ['created_at', 'like_count', 'comment_count']
    date_hierarchy = 'created_at'
    
    def like_count(self, obj):
        return obj.like_count
    like_count.short_description = 'Likes'
    
    def comment_count(self, obj):
        return obj.comment_count
    comment_count.short_description = 'Comments'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('author', 'category')

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'post', 'is_liked', 'created_at']
    list_filter = ['is_liked', 'created_at', 'post__category']
    search_fields = ['user__username', 'post__title']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'post')
