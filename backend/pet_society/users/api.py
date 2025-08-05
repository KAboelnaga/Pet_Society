from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from .models import User
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user info"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def login_api(request):
    """API endpoint for user login"""
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'message': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(request, username=username, password=password)

    if user:
        if not user.is_active:
            return Response(
                {'message': 'Account is blocked. Contact administrator.'},
                status=status.HTTP_403_FORBIDDEN
            )

        login(request, user)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    else:
        return Response(
            {'message': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_api(request):
    """API endpoint for user logout"""
    logout(request)
    return Response({'message': 'Logout successful'})


@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_token(request):
    """Get CSRF token"""
    return Response({'csrfToken': get_token(request)})
