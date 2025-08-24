from django.shortcuts import render
from rest_framework import generics, filters, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Post, Category, Like
from .serializers import PostSerializer, CategorySerializer, LikeSerializer

# Create your views here.

class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination settings: 10 posts per page by default.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50

class PostListAPIView(generics.ListAPIView):
    """
    API endpoint to list posts, optionally filtered by category.
    Sorted by created_at (latest first), paginated.
    """
    serializer_class = PostSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.OrderingFilter]
    ordering = ['-created_at']
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Post.objects.all().order_by('-created_at')
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__id=category)
        return queryset

class PostDetailAPIView(generics.RetrieveAPIView):
    """
    API endpoint to retrieve a single post with full details.
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

class CategoryListAPIView(generics.ListAPIView):
    """
    API endpoint to list all categories.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class LikeToggleView(generics.GenericAPIView):
    """
    Toggle like on a post.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LikeSerializer

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        user = request.user
        
        # Check if user already liked this post
        like, created = Like.objects.get_or_create(
            user=user,
            post=post,
            defaults={'is_liked': True}
        )
        
        if not created:
            # Toggle the like status
            like.is_liked = not like.is_liked
            like.save()
        
        # Return updated like status and counts
        return Response({
            'is_liked': like.is_liked,
            'like_count': post.like_count,
            'message': f'Post {"liked" if like.is_liked else "unliked"} successfully'
        }, status=status.HTTP_200_OK)
