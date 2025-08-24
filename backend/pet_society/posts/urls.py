from django.urls import path
from .views import (
    PostListAPIView,
    CategoryListAPIView,
    PostCreateAPIView,
    PostDetailAPIView,
)


urlpatterns = [
    path('posts/', PostListAPIView.as_view(), name='post-list'),
    path('posts/create/', PostCreateAPIView.as_view(), name='post-create'),
    path('posts/<int:pk>/', PostDetailAPIView.as_view(), name='post-detail'),
    path('categories/', CategoryListAPIView.as_view(), name='category-list'),
]
