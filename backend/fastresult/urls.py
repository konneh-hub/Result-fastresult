from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from srms_app.views import *
from academic.views import *

# Combined router to avoid conflicts
router = DefaultRouter()

# SRMS App routers
router.register(r'universities', UniversityViewSet, basename='university')
router.register(r'university-admins', UniversityAdminViewSet, basename='university-admin')
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-log')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'support-tickets', SupportTicketViewSet, basename='support-ticket')
router.register(r'system-backups', SystemBackupViewSet, basename='system-backup')
router.register(r'api-integrations', APIIntegrationViewSet, basename='api-integration')
router.register(r'platform-reports', PlatformReportViewSet, basename='platform-report')
router.register(r'security-settings', SecuritySettingViewSet, basename='security-setting')
router.register(r'system-settings', SystemSettingViewSet, basename='system-setting')
router.register(r'branding', BrandingViewSet, basename='branding')

# Academic App routers
router.register(r'academic-faculties', FacultyViewSet, basename='academic-faculty')
router.register(r'academic-departments', DepartmentViewSet, basename='academic-department')
router.register(r'academic-programs', ProgramViewSet, basename='academic-program')
router.register(r'academic-sessions', AcademicSessionViewSet, basename='academic-session')
router.register(r'academic-semesters', SemesterViewSet, basename='academic-semester')
router.register(r'academic-lecturers', LecturerViewSet, basename='academic-lecturer')
router.register(r'academic-students', StudentViewSet, basename='academic-student')
router.register(r'academic-courses', CourseViewSet, basename='academic-course')
router.register(r'academic-assignments', CourseAssignmentViewSet, basename='academic-assignment')
router.register(r'academic-registrations', CourseRegistrationViewSet, basename='academic-registration')
router.register(r'academic-results', ResultViewSet, basename='academic-result')
router.register(r'academic-submissions', ResultSubmissionViewSet, basename='academic-submission')
router.register(r'academic-verifications', ResultVerificationViewSet, basename='academic-verification')
router.register(r'academic-approvals', ResultApprovalViewSet, basename='academic-approval')
router.register(r'academic-publications', ResultPublicationViewSet, basename='academic-publication')
router.register(r'academic-gpa', GPARecordViewSet, basename='academic-gpa')
router.register(r'academic-cgpa', CGPARecordViewSet, basename='academic-cgpa')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', login, name='login'),
    path('api/auth/profile/', profile, name='profile'),
    path('api/auth/register/student/', register_student, name='register-student'),
    path('api/auth/register/lecturer/', register_lecturer, name='register-lecturer'),
    path('api/management/create-admin/', create_admin_account, name='create-admin'),
    path('api/universities/', universities, name='universities'),
    path('api/dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('api/dashboard/activities/', recent_activities, name='recent-activities'),
    path('api/', include('srms_app.urls')),
    path('api/', include(router.urls)),
]
