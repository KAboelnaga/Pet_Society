from django.db import models
from django.contrib.auth import get_user_model
from posts.models import Post

User = get_user_model()

class Comment(models.Model):
    """
    Comment model for posts with support for nested replies.
    """
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    parent_comment = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_edited = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Comment by {self.author.username} on {self.post.title}'

    @property
    def is_reply(self):
        """Check if this comment is a reply to another comment."""
        return self.parent_comment is not None

    @property
    def reply_count(self):
        """Get the number of replies to this comment."""
        return self.replies.count()
