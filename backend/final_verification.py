import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fastresult.settings')
django.setup()

from srms_app.models import UniversityAdmin, User
from django.contrib.auth import authenticate

print("=" * 70)
print("FINAL VERIFICATION: UNIVERSITY ADMIN LOGIN")
print("=" * 70)
print()

# Check all admin accounts
admins = UniversityAdmin.objects.select_related('user', 'university').all()
print(f"Found {admins.count()} University Admin accounts:")
print()

for admin in admins:
    user = admin.user
    print(f"Account: {user.username}")
    print(f"  Email: {user.email}")
    print(f"  University: {admin.university.name}")
    print(f"  Active: {user.is_active}")
    print(f"  Has Password: {user.has_usable_password()}")
    
    # Test local authentication
    auth_test = authenticate(username=user.username, password='admin123')
    print(f"  Local Auth Test: {'PASS' if auth_test else 'FAIL'}")
    
    # Test API login
    try:
        response = requests.post(
            'http://localhost:8000/api/auth/login/',
            json={'username': user.username, 'password': 'admin123'},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            user_data = data.get('user', {})
            role = user_data.get('role')
            print(f"  API Login Test: PASS")
            print(f"    - Role returned: {role}")
            print(f"    - Expected route: /admin/dashboard")
        else:
            print(f"  API Login Test: FAIL ({response.status_code})")
    except Exception as e:
        print(f"  API Login Test: ERROR ({str(e)[:50]})")
    
    print()

print("=" * 70)
print("Summary:")
print("- All admin accounts should have role='university_admin'")
print("- All admin accounts should have password='admin123'")
print("- Login redirects to /admin/dashboard")
print("- ProtectedRoute verifies role='university_admin'")
print("=" * 70)
