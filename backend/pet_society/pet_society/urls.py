"""
URL configuration for pet_society project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Chat functionality (core feature)
    path('api/chats/', include('chats.api_urls')),
    
    # Main API routes (includes posts and comments)
    path('api/', include('pet_society.api_urls')),
    
    # User authentication routes
    path('users/', include('users.urls', namespace='users')),
    path('api/auth/', include('users.api_urls')),  # Different endpoint for API auth
    path('api/admins/', include('admins.urls', namespace='admins')),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Placeholder for followers (when implemented)
    path('followers/', include('followers.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
