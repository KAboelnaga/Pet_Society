from django.urls import path
from . import views

app_name = 'users'
urlpatterns = [

    path('', views.users_list, name='users_list'),
    path('create/', views.create_user_view, name='create_user'),
    path('<int:pk>/edit/', views.user_edit, name='user_edit'),
    path('<int:pk>/delete/', views.user_delete, name='user_delete'),
    path('<int:user_id>/promote/', views.promote_user_view, name='promote_user'),
    path('register/', views.user_register, name='register'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    path('blocked/', views.blocked_page, name='blocked_page'),
    path("manage-users/", views.manage_users, name="manage_users"),
    path("toggle-admin/<int:user_id>/", views.toggle_admin, name="toggle_admin"),
    path("toggle-block/<int:user_id>/", views.toggle_block, name="toggle_block"),

]