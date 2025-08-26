from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
class User(AbstractUser):
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    is_blocked = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='users/', null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    location = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.email

    def clean(self):
        super().clean()
        if not self.email:
            raise ValidationError("Email is required")
        if not self.username:
            raise ValidationError("Username is required")
        if not self.first_name:
            raise ValidationError("First name is required")
        if not self.last_name:
            raise ValidationError("Last name is required")
        if self.bio and len(self.bio) > 500:
            raise ValueError("Bio cannot exceed 500 characters")
        if self.location and len(self.location) > 100:
            raise ValueError("Location cannot exceed 100 characters")
        
    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.lower()
        if self.username:
            self.username = self.username.lower()
        self.clean()
        super().save(*args, **kwargs)

    @property
    def followers_count(self):
        return self.followers.count()

    @property
    def following_count(self):
        return self.following.count()

    @property
    def posts_count(self):
        return self.posts.count()
    
    @property
    def is_following(self):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return self.followers.filter(id=request.user.id).exists()
        return False
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    def get_absolute_url(self):
        return f"/users/{self.username}/"
