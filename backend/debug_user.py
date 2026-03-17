import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fastresult.settings')
django.setup()

from srms_app.models import User, UserProfile, UniversityAdmin
from django.contrib.auth import authenticate

print("=== CHECK FASTRESULT@ADMIN ACCOUNT ===\n")

# Check if user exists
try:
    user = User.objects.get(username='fastresult@admin')
    print(f"User found: {user.username}")
    print(f"  Email: {user.email}")
    print(f"  Is active: {user.is_active}")
    print(f"  Has usable password: {user.has_usable_password()}")
    print()
    
    # Try to authenticate
    auth_user = authenticate(username='fastresult@admin', password='admin123')
    if auth_user:
        print(f"Authentication SUCCESS with password 'admin123'")
    else:
        print(f"Authentication FAILED with password 'admin123'")
    print()
    
    # Check UserProfile
    profile = UserProfile.objects.filter(user=user).first()
    if profile:
        print(f"UserProfile found:")
        print(f"  Role: {profile.role}")
        print(f"  University: {profile.university.name if profile.university else 'None'}")
    else:
        print(f"No UserProfile found for this user")
    print()
    
    # Check UniversityAdmin
    admin = UniversityAdmin.objects.filter(user=user).first()
    if admin:
        print(f"UniversityAdmin found:")
        print(f"  University: {admin.university.name}")
        print(f"  Is active: {admin.is_active}")
    else:
        print(f"No UniversityAdmin record found")
        
except User.DoesNotExist:
    print("User 'fastresult@admin' not found!")

print("\n=== ALL USERS IN SYSTEM ===\n")
for u in User.objects.all():
    profile = UserProfile.objects.filter(user=u).first()
    role = profile.role if profile else 'N/A'
    print(f"- {u.username} (Role: {role}, Active: {u.is_active})")
