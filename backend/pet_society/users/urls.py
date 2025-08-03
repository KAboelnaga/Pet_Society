from django.urls import path
from . import api

app_name = 'users'
urlpatterns = [
    path('login/', api.AdminLoginView.as_view(), name='admin-login'),
    path('profile/', api.AdminProfileView.as_view(), name='admin-profile'),
    path('logout/', api.admin_logout, name='admin-logout'),
]