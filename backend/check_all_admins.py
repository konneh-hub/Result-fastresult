import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fastresult.settings')
django.setup()

from srms_app.models import User, UserProfile, UniversityAdmin
from django.contrib.auth import authenticate

print("=" * 70)
print("CHECKING ALL UNIVERSITY ADMIN ACCOUNTS")
print("=" * 70)
print()

# List all UniversityAdmin records
print("UNIVERSITY ADMINS (from UniversityAdmin table):")
print("-" * 70)
for admin in UniversityAdmin.objects.select_related('user', 'university'):
    user = admin.user
    print(f"\nUsername: {user.username}")
    print(f"  Email: {user.email}")
    print(f"  Is Active: {user.is_active}")
    print(f"  Has Usable Password: {user.has_usable_password()}")
    print(f"  University: {admin.university.name}")
    
    # Try authentication
    auth_test = authenticate(username=user.username, password='admin123')
    print(f"  Auth with 'admin123': {'SUCCESS' if auth_test else 'FAILED'}")
    
    # Check UserProfile
    profile = UserProfile.objects.filter(user=user).first()
    if profile:
        print(f"  UserProfile Role: {profile.role}")
    else:
        print(f"  UserProfile: NOT FOUND!")

print("\n" + "=" * 70)
print("ALL USERS WITH UNIVERSITY_ADMIN ROLE (from UserProfile):")
print("-" * 70)
for profile in UserProfile.objects.filter(role='university_admin').select_related('user', 'university'):
    user = profile.user
    print(f"\nUsername: {user.username}")
    print(f"  Email: {user.email}")
    print(f"  Is Active: {user.is_active}")
    print(f"  Has Usable Password: {user.has_usable_password()}")
    print(f"  University: {profile.university.name}")
    
    # Try authentication
    auth_test = authenticate(username=user.username, password='admin123')
    print(f"  Auth with 'admin123': {'SUCCESS' if auth_test else 'FAILED'}")

print("\n" + "=" * 70)
print("ALL USERS IN SYSTEM:")
print("-" * 70)
for user in User.objects.all():
    profile = UserProfile.objects.filter(user=user).first()
    role = profile.role if profile else 'N/A'
    print(f"  {user.username:20} | Role: {role:20} | Active: {user.is_active} | HasPassword: {user.has_usable_password()}")

print("\n" + "=" * 70)
