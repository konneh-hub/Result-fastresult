from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
class ProfileUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False)

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        return instance

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value
from django.contrib.auth import authenticate, get_user_model
from .models import (
    User, University, UniversityAdmin, PlatformSetting, SystemLog, Role, UserProfile,
    Faculty, Department, Program, AcademicSession, Semester, Lecturer, Student,
    Course, CourseAssignment, CourseRegistration, Result, ResultSubmission,
    ResultVerification, ResultApproval, ResultPublication, GPARecord, CGPARecord,
    ActivityLog, Notification, SystemBackup
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
            return profile.role.name
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
            return profile.faculty.id if profile.faculty else None
        except UserProfile.DoesNotExist:
            return None

    def get_department(self, obj):
        try:
            profile = UserProfile.objects.get(user=obj)
            return profile.department.id if profile.department else None
        except UserProfile.DoesNotExist:
            return None

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'date_joined',
            'role', 'university', 'university_name', 'faculty', 'department'
        )
        read_only_fields = ('id', 'date_joined')

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class RegisterStudentSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    university = serializers.PrimaryKeyRelatedField(queryset=University.objects.all())

    class Meta:
        model = Student
        fields = ('first_name', 'last_name', 'email', 'student_id', 'university', 'password', 'faculty', 'department', 'program')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        user.set_password(validated_data['password'])
        user.save()
        profile = UserProfile.objects.create(
            user=user,
            university=validated_data['university'],
            role_id=Role.objects.get(name='Student').id
        )
        return Student.objects.create(user=user, **validated_data)

class RegisterLecturerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    university = serializers.PrimaryKeyRelatedField(queryset=University.objects.all())

    class Meta:
        model = Lecturer
        fields = ('first_name', 'last_name', 'email', 'employee_id', 'university', 'password', 'faculty', 'department')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        user.set_password(validated_data['password'])
        user.save()
        profile = UserProfile.objects.create(
            user=user,
            university=validated_data['university'],
            role_id=Role.objects.get(name='Lecturer').id
        )
        return Lecturer.objects.create(user=user, **validated_data)

class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = '__all__'

class FacultySerializer(serializers.ModelSerializer):
    dean_name = serializers.SerializerMethodField()
    
    def get_dean_name(self, obj):
        return f"{obj.dean.first_name} {obj.dean.last_name}" if obj.dean else None
    
    class Meta:
        model = Faculty
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    head_name = serializers.SerializerMethodField()
    faculty_name = serializers.SerializerMethodField()
    
    def get_head_name(self, obj):
        return f"{obj.head.first_name} {obj.head.last_name}" if obj.head else None
    
    def get_faculty_name(self, obj):
        return obj.faculty.name
    
    class Meta:
        model = Department
        fields = '__all__'

class ProgramSerializer(serializers.ModelSerializer):
    department_name = serializers.SerializerMethodField()
    
    def get_department_name(self, obj):
        return obj.department.name
    
    class Meta:
        model = Program
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    program_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    
    def get_program_name(self, obj):
        return obj.program.name if obj.program else None
    
    def get_department_name(self, obj):
        return obj.department.name
    
    class Meta:
        model = Course
        fields = '__all__'

class CourseAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseAssignment
        fields = '__all__'

class CourseRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseRegistration
        fields = '__all__'

class LecturerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Lecturer
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Student
        fields = '__all__'

class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = '__all__'

class GPARecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = GPARecord
        fields = '__all__'

# Add more serializers as needed for other models
class AcademicSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicSession
        fields = '__all__'

class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    sent_by_name = serializers.SerializerMethodField()
    
    def get_sent_by_name(self, obj):
        return obj.sent_by.get_full_name() if obj.sent_by else None
    
    class Meta:
        model = Notification
        fields = '__all__'

class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() if obj.user else None
    
    class Meta:
        model = ActivityLog
        fields = '__all__'

