from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from .models import *
from .serializers import *
from .permissions import IsRole
from rest_framework.permissions import AllowAny, IsAuthenticated

class UniversityViewSet(viewsets.ModelViewSet):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [AllowAny]

class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Faculty.objects.filter(university__in=University.objects.filter(universityadmin__user=self.request.user))

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Department.objects.filter(faculty__university__in=University.objects.filter(universityadmin__user=self.request.user))

class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Program.objects.filter(department__faculty__university__in=University.objects.filter(universityadmin__user=self.request.user))

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Course.objects.filter(department__faculty__university__in=University.objects.filter(universityadmin__user=self.request.user))

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated | IsRole(['University ICT Admin', 'Student'])]

class LecturerViewSet(viewsets.ModelViewSet):
    queryset = Lecturer.objects.all()
    serializer_class = LecturerSerializer
    permission_classes = [IsAuthenticated | IsRole(['University ICT Admin', 'Lecturer'])]

    @action(detail=True, methods=['get'])
    def courses(self, request, pk=None):
        lecturer = self.get_object()
        assignments = CourseAssignment.objects.filter(lecturer=lecturer)
        serializer = CourseAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated | IsRole(['University ICT Admin', 'Student'])]

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        student = self.get_object()
        registrations = CourseRegistration.objects.filter(student=student)
        results = Result.objects.filter(course_registration__in=registrations)
        serializer = ResultSerializer(results, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def gpa(self, request, pk=None):
        student = self.get_object()
        gpa_records = GPARecord.objects.filter(student=student)
        serializer = GPARecordSerializer(gpa_records, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        student = self.get_object()
        registrations = CourseRegistration.objects.filter(student=student)
        results = Result.objects.filter(course_registration__in=registrations)
        serializer = ResultSerializer(results, many=True)
        return Response(serializer.data)

class AcademicSessionViewSet(viewsets.ModelViewSet):
    queryset = AcademicSession.objects.all()
    serializer_class = AcademicSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AcademicSession.objects.filter(university__in=University.objects.filter(universityadmin__user=self.request.user))

class SemesterViewSet(viewsets.ModelViewSet):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Semester.objects.filter(academic_session__university__in=University.objects.filter(universityadmin__user=self.request.user))

class CourseAssignmentViewSet(viewsets.ModelViewSet):
    queryset = CourseAssignment.objects.all()
    serializer_class = CourseAssignmentSerializer
    permission_classes = [IsAuthenticated]

class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['patch'])
    def verify(self, request, pk=None):
        result = self.get_object()
        # Add verification logic
        return Response({'status': 'verified'})

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        result = self.get_object()
        # Add download logic
        return Response({'download_url': 'url'})
    
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'token': str(refresh.access_token),
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_student(request):
    serializer = RegisterStudentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_lecturer(request):
    serializer = RegisterLecturerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Additional endpoints
@api_view(['GET'])
def universities(request):
    universities = UniversitySerializer(University.objects.filter(is_approved=True), many=True)
    return Response(universities.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_faculties(request, university_id):
    faculties = Faculty.objects.filter(university_id=university_id)
    serializer = FacultySerializer(faculties, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_departments(request, faculty_id):
    departments = Department.objects.filter(faculty_id=faculty_id)
    serializer = DepartmentSerializer(departments, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_programs(request, department_id):
    programs = Program.objects.filter(department_id=department_id)
    serializer = ProgramSerializer(programs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_courses(request, department_id):
    courses = Course.objects.filter(department_id=department_id)
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_submitted_results(request, university_id):
    # Get results that are submitted but not yet verified
    results = Result.objects.filter(
        course_registration__course_assignment__course__department__faculty__university_id=university_id,
        course_registration__result__isnull=False
    ).exclude(
        result__resultverification__isnull=False
    )
    serializer = ResultSerializer(results, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_course(request, course_id):
    # Logic to assign course to lecturer
    return Response({'status': 'assigned'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_department_results(request, department_id):
    results = Result.objects.filter(
        course_registration__course_assignment__course__department_id=department_id
    )
    serializer = ResultSerializer(results, many=True)
    return Response(serializer.data)
