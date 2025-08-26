from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from posts.models import Post, Category
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Seed the database with dummy posts and categories'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        user, _ = User.objects.get_or_create(username='demo', defaults={'email': 'demo@example.com', 'password': 'demo'})
        
        # Create categories
        categories = []
        for name in ['Dogs', 'Cats', 'Birds', 'Reptiles']:
            cat, _ = Category.objects.get_or_create(name=name)
            categories.append(cat)

        # Create posts
        for i in range(20):
            Post.objects.create(
                title=f'Dummy Post {i+1}',
                content='This is a sample post for testing the homepage feed.',
                author=user,
                category=random.choice(categories),
                created_at=timezone.now()
            )
        self.stdout.write(self.style.SUCCESS('Dummy data created!'))