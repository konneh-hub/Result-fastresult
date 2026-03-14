from rest_framework import serializers
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
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'date_joined')
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
    class Meta:
        model = Faculty
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
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

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = UserProfile
        fields = '__all__'

