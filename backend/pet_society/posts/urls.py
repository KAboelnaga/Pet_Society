from django.urls import path
from .views import PostListAPIView, CategoryListAPIView

urlpatterns = [
    # List posts (with optional category filter and pagination)
    path('posts/', PostListAPIView.as_view(), name='post-list'),
    # List all categories
    path('categories/', CategoryListAPIView.as_view(), name='category-list'),
]