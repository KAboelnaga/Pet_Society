from django.db import models
from users.models import User
from django.core.exceptions import ValidationError

class Follow(models.Model):
    """Model to handle user following relationships"""
    follower = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='following'
    )
    followed = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='followers'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'followed')
        indexes = [
            models.Index(fields=['follower']),
            models.Index(fields=['followed']),
        ]

    def __str__(self):
        return f"{self.follower.username} follows {self.followed.username}"

    def clean(self):
        if self.follower == self.followed:
            raise ValidationError("Users cannot follow themselves")
