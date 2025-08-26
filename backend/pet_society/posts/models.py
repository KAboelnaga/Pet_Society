from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.


User = get_user_model()

# Category model represents a post category (e.g., Dogs, Cats, Birds)
class Category(models.Model):
    # Name of the category (e.g., "Dogs")
    name = models.CharField(max_length=100)
    # description = models.TextField(null=True, blank=True)
    # status = models.CharField(max_length=20, choices=[('active', 'Active'), ('inactive', 'Inactive')], default='active')

    def __str__(self):
        return self.name

# Post model represents a user post (like an Instagram post)
class Post(models.Model):
    # Title of the post
    title = models.CharField(max_length=255)
    # Image associated with the post (optional)
    image = models.ImageField(upload_to='post_images/', null=True, blank=True)
    # Main content/body of the post
    content = models.TextField()
    # Author of the post (linked to custom User model)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    # Category to which the post belongs
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='posts')
    # Timestamp when the post was created
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    @property
    def likes_count(self):
        """Get the total number of likes for this post"""
        return self.likes.filter(is_liked=True).count()

    @property
    def comments_count(self):
        """Get the total number of comments for this post"""
        return self.comments.count()

class Like(models.Model):
    """Like model for posts - composite relation between User and Post"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='post_likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    is_liked = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'post')
        indexes = [
            models.Index(fields=['post', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        status = "liked" if self.is_liked else "unliked"
        return f"{self.user.username} {status} {self.post.title}"

    def toggle_like(self):
        """Toggle the like status"""
        self.is_liked = not self.is_liked
        self.save()
        return self.is_liked
