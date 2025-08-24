from django.urls import path
from . import views

app_name = 'comments'

urlpatterns = [
    # List and create comments for a post
    path('posts/<int:post_id>/comments/', views.CommentListCreateView.as_view(), name='comment-list-create'),
    
    # Retrieve, update, delete a specific comment
    path('comments/<int:pk>/', views.CommentDetailView.as_view(), name='comment-detail'),
    
    # List and create replies to a comment
    path('comments/<int:comment_id>/replies/', views.CommentReplyView.as_view(), name='comment-replies'),
    
    # Toggle like on a comment (placeholder for future implementation)
    path('comments/<int:comment_id>/toggle-like/', views.CommentToggleLikeView.as_view(), name='comment-toggle-like'),
]
