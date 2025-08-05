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
    group = models.ForeignKey(ChatGroup, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    body = models.CharField(max_length=300)
    created = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.author.username}: {self.body}"
    class Meta:
        ordering = ['-created']  