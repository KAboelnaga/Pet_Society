from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .serializers import (
    CategorySerializer, CategoryCreateSerializer,
    UserSerializer, UserUpdateSerializer,
    PostSerializer, PostListSerializer
)
from users.models import User
from posts.models import Post
from posts.models import Category

# Custom permission for superuser only
class IsSuperUser(IsAdminUser):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)

# Category Views
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CategoryCreateSerializer
        return CategorySerializer

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

# User Management Views
class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        queryset = User.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        return queryset

class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class UserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True 

        user = self.get_object()
        current_user = request.user
        
        # Check if trying to modify another admin
        if user.is_admin and not current_user.is_superuser and user != current_user:
            return Response(
                {'error': 'Only superuser can modify other admins'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if trying to delete another admin
        if 'is_admin' in request.data and not request.data['is_admin']:
            if user.is_admin and not current_user.is_superuser and user != current_user:
                return Response(
                    {'error': 'Only superuser can demote other admins'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return super().update(request, *args, **kwargs)




# Post Management Views
class PostListView(generics.ListAPIView):
    serializer_class = PostListSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        queryset = Post.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
            )
        return queryset

class PostDetailView(generics.RetrieveAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class PostDeleteView(generics.DestroyAPIView):
    queryset = Post.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def destroy(self, request, *args, **kwargs):
        post = self.get_object()
        post.delete()
        return Response(
            {'message': 'Post deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )

# Dashboard Statistics
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def dashboard_stats(request):
    total_users = User.objects.count()
    total_posts = Post.objects.count()
    total_categories = Category.objects.count()

    
    return Response({
        'total_users': total_users,
        'total_posts': total_posts,
        'total_categories': total_categories,
        'blocked_users': User.objects.filter(is_blocked=True).count()
    })


@api_view(['POST'])
@permission_classes([IsAdminUser])
def block_multiple_users(request):
    user_ids = request.data.get('user_ids', [])
    User.objects.filter(id__in=user_ids).update(is_blocked=True)
    return Response({'success': True})
