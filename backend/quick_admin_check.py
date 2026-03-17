import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fastresult.settings')
django.setup()

from srms_app.models import User, UniversityAdmin
from django.contrib.auth import authenticate

print("CHECKING ADMIN ACCOUNTS...\n")

admins = UniversityAdmin.objects.select_related('user', 'university').all()

if not admins.exists():
    print("No UniversityAdmin accounts found!")
else:
    print(f"Found {admins.count()} UniversityAdmin records:\n")
    for admin in admins:
        user = admin.user
        auth_test = authenticate(username=user.username, password='admin123')
        status = "CAN LOGIN" if auth_test else "CANNOT LOGIN"
        print(f"  {user.username:20} | {admin.university.name:25} | {status}")

print("\nDone!")
