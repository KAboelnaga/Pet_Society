from django.urls import path
from . import views

app_name = 'chats'

urlpatterns = [
    # Traditional Django views (for templates if needed)
    path('', views.chat_index, name='index'),
    path('<str:room_name>/', views.chat_room, name='room'),
]
