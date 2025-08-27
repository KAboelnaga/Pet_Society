from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.shortcuts import get_object_or_404
from .permissions import IsOwner

from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer, UserUpdateSerializer, UserPasswordChangeSerializer
from .models import User
from followers.models import Follow

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'message': 'User registered successfully',
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'message': 'User logged in successfully',
            'user': UserSerializer(user, context={'request': request}).data,
            'token': token.key
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    try:
        Token.objects.get(user=request.user).delete()
        logout(request)
        return Response({'message': 'User logged out successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Logout failed'}, status=status.HTTP_404_NOT_FOUND)

class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
class UserUpdateView(generics.UpdateAPIView):
    """
    Allow a logged-in user to update ONLY their own profile.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_object(self):
        username = self.kwargs.get("username")
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            raise PermissionDenied("User not found.")

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer
    
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])

def update(self, request, *args, **kwargs):
        """Override update to return full user data after update"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        # Return full user data using UserSerializer
        return Response(UserSerializer(instance, context={'request': request}).data)
    
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def profile_view(request, username):
    try:
        user = User.objects.get(username=username)
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # adding UserListView
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def follow_user(request, username):
    """Follow a user"""
    try:
        user_to_follow = User.objects.get(username=username)

        # Check if user is trying to follow themselves
        if request.user == user_to_follow:
            return Response({'error': 'You cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already following
        follow_obj, created = Follow.objects.get_or_create(
            follower=request.user,
            followed=user_to_follow
        )

        if created:
            return Response({
                'message': f'You are now following {user_to_follow.username}',
                'is_following': True,
                'followers_count': user_to_follow.followers_count
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'message': f'You are already following {user_to_follow.username}',
                'is_following': True,
                'followers_count': user_to_follow.followers_count
            }, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def unfollow_user(request, username):
    """Unfollow a user"""
    try:
        user_to_unfollow = User.objects.get(username=username)

        # Check if user is trying to unfollow themselves
        if request.user == user_to_unfollow:
            return Response({'error': 'You cannot unfollow yourself'}, status=status.HTTP_400_BAD_REQUEST)

        # Try to find and delete the follow relationship
        try:
            follow_obj = Follow.objects.get(
                follower=request.user,
                followed=user_to_unfollow
            )
            follow_obj.delete()

            return Response({
                'message': f'You have unfollowed {user_to_unfollow.username}',
                'is_following': False,
                'followers_count': user_to_unfollow.followers_count
            }, status=status.HTTP_200_OK)

        except Follow.DoesNotExist:
            return Response({
                'message': f'You are not following {user_to_unfollow.username}',
                'is_following': False,
                'followers_count': user_to_unfollow.followers_count
            }, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
