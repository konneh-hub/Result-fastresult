import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fastresult.settings')
django.setup()

from srms_app.models import University, UniversityAdmin, User, UserProfile

# List all university admins
print('=== EXISTING UNIVERSITY ADMINS ===')
for admin in UniversityAdmin.objects.select_related('user', 'university').all():
    print(f'Username: {admin.user.username}, Email: {admin.user.email}, University: {admin.university.name}')
    profile = UserProfile.objects.filter(user=admin.user).first()
    if profile:
        print(f'  Profile Role: {profile.role}')
    print()

# List all users with university_admin role
print('=== USERS WITH UNIVERSITY_ADMIN ROLE ===')
for profile in UserProfile.objects.filter(role='university_admin').select_related('user', 'university'):
    print(f'Username: {profile.user.username}, Email: {profile.user.email}, University: {profile.university.name}')
    print()

# List all universities
print('=== AVAILABLE UNIVERSITIES ===')
for univ in University.objects.all():
    print(f'ID: {univ.id}, Name: {univ.name}, Approved: {univ.is_approved}')
