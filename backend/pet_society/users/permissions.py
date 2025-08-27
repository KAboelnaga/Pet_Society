from rest_framework.permissions import BasePermission

class IsOwner(BasePermission):
    """
    Custom permission: only the user themself can edit their profile.
    """
    def has_object_permission(self, request, view, obj):
        return obj == request.user
