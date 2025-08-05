from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# API Router
router = DefaultRouter()
router.register(r'groups', views.ChatGroupViewSet, basename='chatgroup')
router.register(r'messages', views.GroupMessageViewSet, basename='groupmessage')

urlpatterns = [
    path('', include(router.urls)),
]
