import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fastresult.settings')
django.setup()

from srms_app.models import User, UniversityAdmin
from django.contrib.auth import authenticate

print("FIXING ALL UNIVERSITY ADMIN ACCOUNTS")
print("=" * 60)
print()

admins = UniversityAdmin.objects.select_related('user', 'university').all()

if not admins.exists():
    print("No UniversityAdmin accounts found!")
else:
    print(f"Processing {admins.count()} admin accounts...\n")
    
    for admin in admins:
        user = admin.user
        print(f"Processing: {user.username}")
        print(f"  University: {admin.university.name}")
        
        # Set password
        user.set_password('admin123')
        user.save()
        print(f"  Password set to 'admin123'")
        
        # Verify
        auth_test = authenticate(username=user.username, password='admin123')
        if auth_test:
            print(f"  Verification: SUCCESS - Can now login!")
        else:
            print(f"  Verification: FAILED - Still cannot login")
        print()

print("=" * 60)
print("DONE! All admin accounts are now set with password 'admin123'")
