from django.urls import path, include
from rest_framework.routers import DefaultRouter

# App namespace
app_name = 'followers'

router = DefaultRouter()
# Add viewsets here when they're created
# router.register(r'followers', FollowerViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Add specific URL patterns here if needed
]
