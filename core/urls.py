from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UniversityViewSet, FacultyViewSet, DepartmentViewSet, ProgramViewSet, 
    CourseViewSet, StudentViewSet, LecturerViewSet, UserViewSet
)

router = DefaultRouter()
router.register(r'universities', UniversityViewSet)
router.register(r'universities/(?P<university_id>\\d+)/faculties', FacultyViewSet)
router.register(r'faculties/(?P<faculty_id>\\d+)/departments', DepartmentViewSet)
router.register(r'departments/(?P<department_id>\\d+)/programs', ProgramViewSet)
router.register(r'departments/(?P<department_id>\\d+)/courses', CourseViewSet)
router.register(r'students', StudentViewSet)
router.register(r'lecturers', LecturerViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('auth/login/', login, name='login'),
    path('auth/profile/', profile, name='profile'),
    path('auth/register/student/', register_student, name='register_student'),
    path('auth/register/lecturer/', register_lecturer, name='register_lecturer'),
    path('universities/', universities, name='universities'),
    path('api/', include(router.urls)),
]
