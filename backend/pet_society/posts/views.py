from rest_framework import generics, filters, permissions, viewsets, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Post, Category, Like
from .serializers import PostSerializer, CategorySerializer, PostDetailSerializer, LikeSerializer
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
    permission_classes = [IsOwnerOrReadOnly]


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class CategoryCreateAPIView(generics.CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    search_fields = ['title']

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_serializer_class(self):
        """Use detailed serializer for retrieve actions"""
        if self.action in ['retrieve']:
            return PostDetailSerializer
        return PostSerializer

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        """Like or unlike a post"""
        post = self.get_object()
        user = request.user
        
        # Check if user already liked this post
        like_obj, created = Like.objects.get_or_create(
            user=user, 
            post=post,
            defaults={'is_liked': True}
        )
        
        if not created:
            # Toggle like status
            like_obj.toggle_like()
        
        return Response({
            'is_liked': like_obj.is_liked,
            'likes_count': post.likes_count
        })

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def likes(self, request, pk=None):
        """Get all likes for a post"""
        post = self.get_object()
        likes = post.likes.filter(is_liked=True)
        serializer = LikeSerializer(likes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def user_like_status(self, request, pk=None):
        """Get current user's like status for a post"""
        post = self.get_object()
        if request.user.is_authenticated:
            try:
                like_obj = Like.objects.get(user=request.user, post=post)
                return Response({'is_liked': like_obj.is_liked})
            except Like.DoesNotExist:
                return Response({'is_liked': False})
        return Response({'is_liked': False})