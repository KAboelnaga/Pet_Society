from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PostListAPIView,
    CategoryListAPIView,
    PostCreateAPIView,
    PostDetailAPIView,
    PostViewSet,
    CategoryViewSet,

    CategoryCreateAPIView,
)

# App namespace
app_name = 'posts'

# Router for ViewSets
router = DefaultRouter()
router.register(r'posts', PostViewSet)
router.register(r'categories', CategoryViewSet)

urlpatterns = [
    # Legacy API endpoints (keeping for backward compatibility)
    path('posts/', PostListAPIView.as_view(), name='post-list'),
    path('posts/create/', PostCreateAPIView.as_view(), name='post-create'),
    path('posts/<int:pk>/', PostDetailAPIView.as_view(), name='post-detail'),  # supports GET, PUT, DELETE
    path('categories/', CategoryListAPIView.as_view(), name='category-list'),
    path('categories/create/', CategoryCreateAPIView.as_view(), name='category-create'),

    # Include router URLs for ViewSets (includes like actions)
    path('', include(router.urls)),
]
