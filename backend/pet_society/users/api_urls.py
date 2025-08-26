from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api

# API Router
router = DefaultRouter()
router.register(r'', api.UserViewSet, basename='user')

urlpatterns = [
    # Authentication endpoints
    path('login/', api.login_api, name='login_api'),
    path('logout/', api.logout_api, name='logout_api'),
    path('csrf/', api.csrf_token, name='csrf_token'),

    # User management endpoints
    path('', include(router.urls)),
]
