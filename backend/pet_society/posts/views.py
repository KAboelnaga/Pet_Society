from django.shortcuts import render
from rest_framework import generics, filters
from rest_framework.pagination import PageNumberPagination
from .models import Post, Category
from .serializers import PostSerializer, CategorySerializer

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

    def get_queryset(self):
        queryset = Post.objects.all().order_by('-created_at')
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__id=category)
        return queryset

class CategoryListAPIView(generics.ListAPIView):
    """
    API endpoint to list all categories.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
