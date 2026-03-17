import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fastresult.settings')
django.setup()

from srms_app.models import User
from django.contrib.auth import authenticate

print("=== SETTING PASSWORD FOR fastresult@admin ===\n")

try:
    user = User.objects.get(username='fastresult@admin')
    user.set_password('admin123')
    user.save()
    print(f"Password set successfully for fastresult@admin\n")
    
    # Verify
    auth_user = authenticate(username='fastresult@admin', password='admin123')
    if auth_user:
        print(f"[OK] Authentication test PASSED!")
        print(f"    Username: {auth_user.username}")
        print(f"    Email: {auth_user.email}")
    else:
        print(f"[ERROR] Authentication test FAILED")
        
except User.DoesNotExist:
    print("User 'fastresult@admin' not found!")
