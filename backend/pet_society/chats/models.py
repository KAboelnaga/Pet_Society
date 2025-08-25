from django.db import models
from django.contrib.auth import get_user_model
import shortuuid

User = get_user_model()

# Create your models here.
class ChatGroup(models.Model):
    name = models.CharField(max_length=100, unique=True , default=shortuuid.uuid)
    users_online = models.ManyToManyField(User, related_name='chat_groups', blank=True)
    members = models.ManyToManyField(User, related_name='chat_group_members', blank=True)
    is_private = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
class GroupMessage(models.Model):
    MESSAGE_TYPES = (
        ('text', 'Text'),
        ('image', 'Image'),
    )
    
    group = models.ForeignKey(ChatGroup, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    encrypted_body = models.TextField(blank=True, null=True)  # Store encrypted content for text messages
    image = models.ImageField(upload_to='chat_images/', blank=True, null=True)  # Store images
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    is_encrypted = models.BooleanField(default=True)  # Text messages are encrypted by default
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.message_type == 'image':
            return f"Image from {self.author.username} at {self.created}"
        return f"Message from {self.author.username} at {self.created}"

    class Meta:
        ordering = ['-created']


class MessageRead(models.Model):
    """Track which messages have been read by which users"""
    message = models.ForeignKey(GroupMessage, related_name='read_by', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('message', 'user')
        ordering = ['-read_at']

    def __str__(self):
        return f'{self.user.username} read {self.message.id} at {self.read_at}'