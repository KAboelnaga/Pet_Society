from django.urls import re_path
from . import consumers
from .notification_consumer import NotificationConsumer

websocket_urlpatterns = [
    re_path(r'^ws/chat/(?P<room_name>[\w-]+)/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/notifications/(?P<user_id>\w+)/$', NotificationConsumer.as_asgi()),
]
