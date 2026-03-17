from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import *

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