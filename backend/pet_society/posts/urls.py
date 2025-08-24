from django.urls import path
from . import views

app_name = 'posts'

urlpatterns = [
    # List all posts (with optional category filtering)
    path('', views.PostListAPIView.as_view(), name='post-list'),
    
    # Get a specific post
    path('<int:pk>/', views.PostDetailAPIView.as_view(), name='post-detail'),
    
    # Toggle like on a post
    path('<int:post_id>/toggle-like/', views.LikeToggleView.as_view(), name='post-toggle-like'),
    
    # List all categories
    path('categories/', views.CategoryListAPIView.as_view(), name='category-list'),
]