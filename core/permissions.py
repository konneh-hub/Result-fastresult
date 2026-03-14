from rest_framework.permissions import BasePermission
from .models import UserProfile, Role

class IsRole(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            profile = UserProfile.objects.get(user=request.user)
            return profile.role.name in view.allowed_roles
        except UserProfile.DoesNotExist:
            return False
