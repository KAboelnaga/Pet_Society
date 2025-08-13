from django.urls import path, include

urlpatterns = [
    # Include posts app API endpoints
    path('', include('posts.urls')),
]
