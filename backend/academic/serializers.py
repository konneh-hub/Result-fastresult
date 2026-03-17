from rest_framework import serializers
from .models import *

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

class AcademicSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicSession
        fields = '__all__'

class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = '__all__'

class LecturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecturer
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
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

class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = '__all__'

class ResultSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResultSubmission
        fields = '__all__'

class ResultVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResultVerification
        fields = '__all__'

class ResultApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResultApproval
        fields = '__all__'

class ResultPublicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResultPublication
        fields = '__all__'

class GPARecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = GPARecord
        fields = '__all__'

class CGPARecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = CGPARecord
        fields = '__all__'