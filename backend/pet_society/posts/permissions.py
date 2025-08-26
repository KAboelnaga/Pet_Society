from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission: Only the post author can edit or delete.
    Read is open for everyone.
    """
    def has_object_permission(self, request, view, obj):
        # SAFE_METHODS = GET, HEAD, OPTIONS
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user
