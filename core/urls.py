from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UniversityViewSet, FacultyViewSet, DepartmentViewSet, ProgramViewSet, 
    CourseViewSet, StudentViewSet, LecturerViewSet, UserViewSet,
    AcademicSessionViewSet, SemesterViewSet, CourseAssignmentViewSet, ResultViewSet,
    login, profile, register_student, register_lecturer, universities,
    get_faculties, get_departments, get_programs, get_courses,
    get_submitted_results, assign_course, get_department_results
)

router = DefaultRouter()
router.register(r'universities', UniversityViewSet, basename='university')
router.register(r'faculties', FacultyViewSet, basename='faculty')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'programs', ProgramViewSet, basename='program')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'lecturers', LecturerViewSet, basename='lecturer')
router.register(r'users', UserViewSet, basename='user')
router.register(r'academic-sessions', AcademicSessionViewSet, basename='academic-session')
router.register(r'semesters', SemesterViewSet, basename='semester')
router.register(r'course-assignments', CourseAssignmentViewSet, basename='course-assignment')
router.register(r'results', ResultViewSet, basename='result')

urlpatterns = [
    path('auth/login/', login, name='login'),
    path('auth/profile/', profile, name='profile'),
    path('auth/register/student/', register_student, name='register_student'),
    path('auth/register/lecturer/', register_lecturer, name='register_lecturer'),
    path('universities/', universities, name='universities'),
    path('universities/<int:university_id>/faculties/', get_faculties, name='get_faculties'),
    path('faculties/<int:faculty_id>/departments/', get_departments, name='get_departments'),
    path('departments/<int:department_id>/programs/', get_programs, name='get_programs'),
    path('departments/<int:department_id>/courses/', get_courses, name='get_courses'),
    path('universities/<int:university_id>/results/submitted/', get_submitted_results, name='get_submitted_results'),
    path('courses/<int:course_id>/assign/', assign_course, name='assign_course'),
    path('departments/<int:department_id>/results/', get_department_results, name='get_department_results'),
    path('api/', include(router.urls)),
]
