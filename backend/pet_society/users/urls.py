from django.urls import path
from . import views

app_name = 'users'
urlpatterns = [
    path('', views.UserListView.as_view(), name='user_list'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.UserDetailView.as_view(), name='user_detail'),
    path('profile/<str:username>/', views.profile_view, name='profile'),
    path('profile/<str:username>/update/', views.UserDetailView.as_view(), name='update_profile'),
    # path('profile/<str:username>/follow/', views.follow_view, name='follow'),
    # path('profile/<str:username>/unfollow/', views.unfollow_view, name='unfollow'),
    # path('profile/<str:username>/followers/', views.followers_view, name='followers'),
    # path('profile/<str:username>/following/', views.following_view, name='following'),
    # path('profile/<str:username>/posts/', views.user_posts_view, name='user_posts'),
]