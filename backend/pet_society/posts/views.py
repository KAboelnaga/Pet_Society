from rest_framework import generics, filters, permissions, viewsets
from rest_framework.pagination import PageNumberPagination
from .models import Post, Category
from .serializers import PostSerializer, CategorySerializer
from .permissions import IsOwnerOrReadOnly


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


class CategoryListAPIView(generics.ListAPIView):
    """
    API endpoint to list all categories.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class PostCreateAPIView(generics.CreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        print(self.request.data)  # DEBUG
        serializer.save(author=self.request.user)


class PostDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint to retrieve, update, or delete a single post.
    Only the post author can update or delete it.
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)