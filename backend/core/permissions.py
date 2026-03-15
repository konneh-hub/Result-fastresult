from rest_framework.permissions import BasePermission
from .models import UserProfile, Role

class IsRole(BasePermission):
    def __init__(self, allowed_roles):
        self.allowed_roles = allowed_roles

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            profile = UserProfile.objects.get(user=request.user)
            return profile.role.name in self.allowed_roles
        except UserProfile.DoesNotExist:
            return False
