from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UniversityViewSet, FacultyViewSet, DepartmentViewSet, ProgramViewSet, 
    CourseViewSet, StudentViewSet, LecturerViewSet, UserViewSet,
    AcademicSessionViewSet, SemesterViewSet, CourseAssignmentViewSet, ResultViewSet,
    ActivityLogViewSet, NotificationViewSet,
    login, profile, change_password, register_student, register_lecturer, universities,
    get_faculties, get_departments, get_programs, get_courses,
    get_submitted_results, assign_course, get_department_results,
    bulk_upload_students, bulk_upload_lecturers, assign_user_role, user_management_list, reports_analytics,
    dashboard_stats, student_enrollment_chart, recent_activities,
    pending_approvals, department_overview, upcoming_events,
    deactivate_user, activate_user, create_admin_account,
    student_notifications, student_academic_progress,
    dean_overview, dean_departments, dean_course_assignments,
    dean_lecturer_activities, dean_review_results, dean_approve_results,
    dean_approve_submission, dean_return_submission, dean_reports
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
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-log')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('auth/login/', login, name='login'),
    path('auth/profile/', profile, name='profile'),
    path('auth/change-password/', change_password, name='change_password'),
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
    # Management endpoints
    path('management/create-admin/', create_admin_account, name='create_admin_account'),
    path('management/students/upload/', bulk_upload_students, name='bulk_upload_students'),
    path('management/lecturers/upload/', bulk_upload_lecturers, name='bulk_upload_lecturers'),
    path('management/users/assign-role/', assign_user_role, name='assign_user_role'),
    path('management/users/', user_management_list, name='user_management_list'),
    path('management/deactivate-user/<int:user_id>/', deactivate_user, name='deactivate_user'),
    path('management/activate-user/<int:user_id>/', activate_user, name='activate_user'),
    path('reports/analytics/', reports_analytics, name='reports_analytics'),
    # Dashboard endpoints
    path('dashboard/stats/', dashboard_stats, name='dashboard_stats'),
    path('dashboard/student-enrollment-chart/', student_enrollment_chart, name='student_enrollment_chart'),
    path('dashboard/recent-activities/', recent_activities, name='recent_activities'),
    path('dashboard/pending-approvals/', pending_approvals, name='pending_approvals'),
    path('dashboard/department-overview/', department_overview, name='department_overview'),
    path('dashboard/upcoming-events/', upcoming_events, name='upcoming_events'),
    # Student endpoints
    path('auth/notifications/', student_notifications, name='student_notifications'),
    path('auth/academic-progress/', student_academic_progress, name='student_academic_progress'),
    # Dean endpoints
    path('dean/overview/', dean_overview, name='dean_overview'),
    path('dean/departments/', dean_departments, name='dean_departments'),
    path('dean/course-assignments/', dean_course_assignments, name='dean_course_assignments'),
    path('dean/lecturer-activities/', dean_lecturer_activities, name='dean_lecturer_activities'),
    path('dean/results/review/', dean_review_results, name='dean_review_results'),
    path('dean/results/approve/', dean_approve_results, name='dean_approve_results'),
    path('dean/results/<int:submission_id>/approve/', dean_approve_submission, name='dean_approve_submission'),
    path('dean/results/<int:submission_id>/return/', dean_return_submission, name='dean_return_submission'),
    path('api/', include(router.urls)),
]
