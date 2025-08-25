from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Comment
from .serializers import CommentSerializer, CommentDetailSerializer
from posts.models import Post

class CommentViewSet(viewsets.ModelViewSet):
    """ViewSet for Comment model"""
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Filter comments by post if post_id is provided"""
        queryset = Comment.objects.all()
        post_id = self.request.query_params.get('post_id', None)
        if post_id:
            # Return only top-level comments for the post; replies are nested in serializer
            queryset = queryset.filter(post_id=post_id, parent_comment__isnull=True)
        return queryset

    def get_serializer_class(self):
        """Use detailed serializer for retrieve actions"""
        if self.action in ['retrieve', 'list']:
            return CommentDetailSerializer
        return CommentSerializer

    def perform_create(self, serializer):
        """Set the author when creating a comment"""
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        """Only allow authors to update their comments"""
        comment = self.get_object()
        if comment.author != self.request.user:
            raise permissions.PermissionDenied("You can only edit your own comments")
        serializer.save()

    def perform_destroy(self, serializer):
        """Only allow authors or post authors to delete comments"""
        comment = self.get_object()
        post = comment.post
        if comment.author != self.request.user and post.author != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own comments or comments on your posts")
        comment.delete()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reply(self, request, pk=None):
        """Create a reply to a comment"""
        parent_comment = self.get_object()
        
        # Add the post to the data before validation
        data = request.data.copy()
        data['post'] = parent_comment.post.id
        
        serializer = self.get_serializer(data=data)
        
        if serializer.is_valid():
            serializer.save(
                author=request.user,
                post=parent_comment.post,
                parent_comment=parent_comment
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def post_comments(self, request):
        """Get all comments for a specific post"""
        post_id = request.query_params.get('post_id')
        if not post_id:
            return Response(
                {'error': 'post_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        post = get_object_or_404(Post, id=post_id)
        # Get only top-level comments (no parent)
        comments = post.comments.filter(parent_comment__isnull=True)
        serializer = CommentDetailSerializer(comments, many=True)
        return Response(serializer.data)
