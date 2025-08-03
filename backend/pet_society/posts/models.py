from django.db import models
from users.models import User
from admins.models import Category

class Post(models.Model):
    POST_TYPES = [
        ('adoption', 'Adoption'),
        ('sale', 'Sale'),
        ('mating', 'Mating'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    description = models.TextField()
    post_type = models.CharField(max_length=10, choices=POST_TYPES)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    image = models.ImageField(upload_to='posts/', null=True, blank=True)
    location = models.CharField(max_length=100)
    contact_info = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.username}"
