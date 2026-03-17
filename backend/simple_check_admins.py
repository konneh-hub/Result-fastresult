import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fastresult.settings')
django.setup()

from srms_app.models import User, UserProfile, UniversityAdmin
from django.contrib.auth import authenticate

# Silence warnings
import warnings
warnings.filterwarnings('ignore')

print("UNIVERSITY ADMIN ACCOUNTS AUDIT")
print("=" * 60)

# Check UniversityAdmin table
admins = UniversityAdmin.objects.select_related('user', 'university').all()
print(f"Found {admins.count()} UniversityAdmin records\n")

for admin in admins:
    user = admin.user
    print(f"Username: {user.username}")
    print(f"  Email: {user.email}")
    print(f"  Active: {user.is_active}")
    print(f"  Has Password: {user.has_usable_password()}")
    print(f"  University: {admin.university.name}")
    
    # Test auth with 'admin123'
    result = authenticate(username=user.username, password='admin123')
    print(f"  Can login with 'admin123': {'YES' if result else 'NO'}")
    print()
