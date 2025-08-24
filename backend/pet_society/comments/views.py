from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Comment
from .serializers import (
    CommentSerializer, CommentCreateSerializer, 
    CommentUpdateSerializer, CommentReplySerializer
)

class CommentListCreateView(generics.ListCreateAPIView):
    """
    List all comments for a post or create a new comment.
    """
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        post_id = self.kwargs.get('post_id')
        return Comment.objects.filter(post_id=post_id, parent_comment__isnull=True)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CommentCreateSerializer
        return CommentSerializer

    def perform_create(self, serializer):
        post_id = self.kwargs.get('post_id')
        serializer.save(
            author=self.request.user,
            post_id=post_id
        )

class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a comment.
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CommentUpdateSerializer
        return CommentSerializer

    def perform_update(self, serializer):
        serializer.save(is_edited=True)

    def perform_destroy(self, instance):
        # Only allow deletion if user is the author or post author
        if instance.author == self.request.user or instance.post.author == self.request.user:
            instance.delete()
        else:
            raise permissions.PermissionDenied("You can only delete your own comments.")

class CommentReplyView(generics.ListCreateAPIView):
    """
    List replies to a comment or create a new reply.
    """
    serializer_class = CommentReplySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        comment_id = self.kwargs.get('comment_id')
        return Comment.objects.filter(parent_comment_id=comment_id)

    def perform_create(self, serializer):
        comment_id = self.kwargs.get('comment_id')
        parent_comment = get_object_or_404(Comment, id=comment_id)
        serializer.save(
            author=self.request.user,
            parent_comment=parent_comment,
            post=parent_comment.post
        )

class CommentToggleLikeView(generics.GenericAPIView):
    """
    Toggle like on a comment (if you want to add likes to comments too).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, comment_id):
        comment = get_object_or_404(Comment, id=comment_id)
        # This is a placeholder - you can implement comment likes if desired
        return Response({'message': 'Comment likes not implemented yet'}, status=status.HTTP_501_NOT_IMPLEMENTED)
