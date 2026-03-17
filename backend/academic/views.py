from rest_framework import viewsets
from .models import *
from .serializers import *

class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer

class AcademicSessionViewSet(viewsets.ModelViewSet):
    queryset = AcademicSession.objects.all()
    serializer_class = AcademicSessionSerializer

class SemesterViewSet(viewsets.ModelViewSet):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer

class LecturerViewSet(viewsets.ModelViewSet):
    queryset = Lecturer.objects.all()
    serializer_class = LecturerSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class CourseAssignmentViewSet(viewsets.ModelViewSet):
    queryset = CourseAssignment.objects.all()
    serializer_class = CourseAssignmentSerializer

class CourseRegistrationViewSet(viewsets.ModelViewSet):
    queryset = CourseRegistration.objects.all()
    serializer_class = CourseRegistrationSerializer

class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer

class ResultSubmissionViewSet(viewsets.ModelViewSet):
    queryset = ResultSubmission.objects.all()
    serializer_class = ResultSubmissionSerializer

class ResultVerificationViewSet(viewsets.ModelViewSet):
    queryset = ResultVerification.objects.all()
    serializer_class = ResultVerificationSerializer

class ResultApprovalViewSet(viewsets.ModelViewSet):
    queryset = ResultApproval.objects.all()
    serializer_class = ResultApprovalSerializer

class ResultPublicationViewSet(viewsets.ModelViewSet):
    queryset = ResultPublication.objects.all()
    serializer_class = ResultPublicationSerializer

class GPARecordViewSet(viewsets.ModelViewSet):
    queryset = GPARecord.objects.all()
    serializer_class = GPARecordSerializer

class CGPARecordViewSet(viewsets.ModelViewSet):
    queryset = CGPARecord.objects.all()
    serializer_class = CGPARecordSerializer
