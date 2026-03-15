from core.models import User, UniversityAdmin

# Create Dean
if not User.objects.filter(username='dean_demo').exists():
    dean = User.objects.create_user(
        username='dean_demo',
        email='dean@example.com',
        password='deanpass123',
        first_name='Dean',
        last_name='Demo',
        is_active=True
    )
    UniversityAdmin.objects.create(user=dean, role='dean')
    print('Dean created')
else:
    print('Dean already exists')

# Create HOD
if not User.objects.filter(username='hod_demo').exists():
    hod = User.objects.create_user(
        username='hod_demo',
        email='hod@example.com',
        password='hodpass123',
        first_name='HOD',
        last_name='Demo',
        is_active=True
    )
    UniversityAdmin.objects.create(user=hod, role='hod')
    print('HOD created')
else:
    print('HOD already exists')

# Create Exam Officer
if not User.objects.filter(username='exam_demo').exists():
    exam_officer = User.objects.create_user(
        username='exam_demo',
        email='exam@example.com',
        password='exampass123',
        first_name='Exam',
        last_name='Officer',
        is_active=True
    )
    UniversityAdmin.objects.create(user=exam_officer, role='exam_officer')
    print('Exam Officer created')
else:
    print('Exam Officer already exists')

print('Demo accounts ready:')
print('Dean: dean_demo / deanpass123')
print('HOD: hod_demo / hodpass123')
print('Exam Officer: exam_demo / exampass123')
