from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    University, UniversityAdmin, ActivityLog, Notification, SupportTicket,
    SystemBackup, APIIntegration, UserProfile, PlatformReport, SecuritySetting,
    SystemSetting, Branding
)
from academic.models import (
    Semester, AcademicSession, Course, Result, GPARecord, CGPARecord, Student
)


User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    university = serializers.SerializerMethodField()
    university_name = serializers.SerializerMethodField()
    faculty = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()

    def get_role(self, obj):
        try:
            profile = UserProfile.objects.get(user=obj)
            return profile.role
        except UserProfile.DoesNotExist:
            return None

    def get_university(self, obj):
        try:
            profile = UserProfile.objects.get(user=obj)
            return profile.university.id
        except UserProfile.DoesNotExist:
            return None

    def get_university_name(self, obj):
        try:
            profile = UserProfile.objects.get(user=obj)
            return profile.university.name
        except UserProfile.DoesNotExist:
            return None

    def get_faculty(self, obj):
        try:
            profile = UserProfile.objects.get(user=obj)
            return profile.faculty.name if profile.faculty else None
        except UserProfile.DoesNotExist:
            return None

    def get_department(self, obj):
        try:
            profile = UserProfile.objects.get(user=obj)
            return profile.department.name if profile.department else None
        except UserProfile.DoesNotExist:
            return None

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'role', 'university', 'university_name', 'faculty', 'department']

class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = '__all__'

class UniversityAdminSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    university = UniversitySerializer()

    class Meta:
        model = UniversityAdmin
        fields = '__all__'

class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    university = UniversitySerializer()

    class Meta:
        model = ActivityLog
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    sent_by = UserSerializer()
    recipient_university = UniversitySerializer()

    class Meta:
        model = Notification
        fields = '__all__'

class SupportTicketSerializer(serializers.ModelSerializer):
    university = UniversitySerializer()
    created_by = UserSerializer()
    assigned_to = UserSerializer()

    class Meta:
        model = SupportTicket
        fields = '__all__'

class SystemBackupSerializer(serializers.ModelSerializer):
    created_by = UserSerializer()

    class Meta:
        model = SystemBackup
        fields = '__all__'

class APIIntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIIntegration
        fields = '__all__'

class PlatformReportSerializer(serializers.ModelSerializer):
    generated_by = UserSerializer()

    class Meta:
        model = PlatformReport
        fields = '__all__'

class SecuritySettingSerializer(serializers.ModelSerializer):
    updated_by = UserSerializer()

    class Meta:
        model = SecuritySetting
        fields = '__all__'

class SystemSettingSerializer(serializers.ModelSerializer):
    updated_by = UserSerializer()

    class Meta:
        model = SystemSetting
        fields = '__all__'

class BrandingSerializer(serializers.ModelSerializer):
    created_by = UserSerializer()

    class Meta:
        model = Branding
        fields = '__all__'


# Student Dashboard Serializers
class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = ['id', 'name', 'start_date', 'end_date']

class AcademicSessionSerializer(serializers.ModelSerializer):
    semesters = SemesterSerializer(many=True, read_only=True)
    class Meta:
        model = AcademicSession
        fields = ['id', 'name', 'start_date', 'end_date', 'semesters']

class CourseSerializer(serializers.ModelSerializer):
    lecturer_name = serializers.SerializerMethodField()
    def get_lecturer_name(self, obj):
        return f"{obj.lecturer.first_name} {obj.lecturer.last_name}" if hasattr(obj, 'lecturer') and obj.lecturer else None
    class Meta:
        model = Course
        fields = ['id', 'code', 'name', 'credits', 'lecturer_name']

class ResultSerializer(serializers.ModelSerializer):
    course = CourseSerializer()
    class Meta:
        model = Result
        fields = ['id', 'course', 'score', 'grade']

class GPARecordSerializer(serializers.ModelSerializer):
    semester_name = serializers.SerializerMethodField()
    def get_semester_name(self, obj):
        return obj.semester.name
    class Meta:
        model = GPARecord
        fields = ['semester', 'semester_name', 'gpa']

class CGPARecordSerializer(serializers.ModelSerializer):
    session_name = serializers.SerializerMethodField()
    def get_session_name(self, obj):
        return obj.academic_session.name
    class Meta:
        model = CGPARecord
        fields = ['academic_session', 'session_name', 'cgpa']

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    faculty_name = serializers.CharField(source='faculty.name')
    department_name = serializers.CharField(source='department.name')
    program_name = serializers.CharField(source='program.name')
    class Meta:
        model = Student
        fields = ['id', 'user', 'student_id', 'faculty_name', 'department_name', 'program_name', 'level', 'enrollment_date']

class StudentDashboardSerializer(serializers.Serializer):
    current_gpa = serializers.DecimalField(max_digits=4, decimal_places=2, required=False)
    notifications_count = serializers.IntegerField(required=False)
    registered_courses_count = serializers.IntegerField(required=False)
    completed_credits = serializers.IntegerField(required=False)
    gpa_history = GPARecordSerializer(many=True)
    recent_notifications = NotificationSerializer(many=True)
