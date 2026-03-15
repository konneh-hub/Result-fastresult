from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.db import models
from django.db.models import Exists, OuterRef
# Endpoint to create administrator accounts (Exam Officer, Dean, HOD)
from django.contrib.auth import get_user_model
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_admin_account(request):
    """Create Exam Officer, Dean, or HOD account by University ICT Admin"""
    data = request.data
    required_fields = ['first_name', 'last_name', 'email', 'username', 'role', 'password']
    for field in required_fields:
        if not data.get(field):
            return Response({"detail": f"{field} is required."}, status=400)

    User = get_user_model()
    if User.objects.filter(username=data['username']).exists():
        return Response({"detail": "Username already exists."}, status=400)

    user = User.objects.create_user(
        username=data['username'],
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        password=data['password']
    )

    # Assign role and profile
    from .models import Role, UserProfile, Faculty, Department
    role_name = data['role'].strip().lower()
    role_map = {
        'exam_officer': 'Exam Officer',
        'dean': 'Dean',
        'hod': 'Head of Department',
        'head of department': 'Head of Department',
    }
    role_obj = Role.objects.filter(name__iexact=role_map.get(role_name, role_name)).first()
    if not role_obj:
        return Response({"detail": "Invalid role."}, status=400)

    university_admin = request.user.universityadmin_set.first()
    if not university_admin:
        return Response({"detail": "Only University ICT Admin can create admin accounts."}, status=403)
    university = university_admin.university

    # Department and faculty association are optional at creation time.
    # Assignments can be made later via the department/faculty management workflows.
    faculty = None
    department = None
    if data.get('faculty'):
        faculty = Faculty.objects.filter(name__iexact=data['faculty'], university=university).first()
    if data.get('department'):
        department = Department.objects.filter(name__iexact=data['department'], faculty__university=university).first()
    UserProfile.objects.create(
        user=user,
        university=university,
        role=role_obj,
        faculty=faculty,
        department=department
    )

    return Response({"success": True, "user": user.email})
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from django.contrib.auth import update_session_auth_hash
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

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ActivityLog.objects.filter(university__in=University.objects.filter(universityadmin__user=self.request.user))

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(university__in=University.objects.filter(universityadmin__user=self.request.user))

    def perform_create(self, serializer):
        university = University.objects.filter(universityadmin__user=self.request.user).first()
        serializer.save(sent_by=self.request.user, university=university)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Student.objects.filter(program__department__faculty__university__in=University.objects.filter(universityadmin__user=self.request.user))

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

class LecturerViewSet(viewsets.ModelViewSet):
    queryset = Lecturer.objects.all()
    serializer_class = LecturerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Lecturer.objects.filter(department__faculty__university__in=University.objects.filter(universityadmin__user=self.request.user))

    @action(detail=True, methods=['get'])
    def courses(self, request, pk=None):
        lecturer = self.get_object()
        assignments = CourseAssignment.objects.filter(lecturer=lecturer)
        serializer = CourseAssignmentSerializer(assignments, many=True)
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
@permission_classes([IsAuthenticated])
def bulk_upload_students(request):
    """Upload multiple students via CSV"""
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=400)

    file = request.FILES['file']
    university = University.objects.filter(universityadmin__user=request.user).first()

    if not university:
        return Response({'error': 'University not found'}, status=400)

    try:
        import csv
        import io

        # Read CSV file
        file_data = file.read().decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(file_data))

        successful_uploads = 0
        duplicates = 0
        errors = []

        for row in csv_reader:
            try:
                # Check if student already exists
                if User.objects.filter(email=row['email']).exists() or Student.objects.filter(matric_number=row['matric_number']).exists():
                    duplicates += 1
                    continue

                # Create user
                user = User.objects.create_user(
                    username=row['email'],
                    email=row['email'],
                    password='defaultpassword123',  # Should be changed later
                    first_name=row['first_name'],
                    last_name=row['last_name']
                )

                # Get program
                program = Program.objects.get(id=int(row['program_id']))

                # Create student profile
                student = Student.objects.create(
                    user=user,
                    matric_number=row['matric_number'],
                    program=program,
                    level=int(row['level'])
                )

                successful_uploads += 1

            except Exception as e:
                errors.append(f"Error processing row {row}: {str(e)}")

        return Response({
            'successful_uploads': successful_uploads,
            'duplicates': duplicates,
            'errors': errors
        })

    except Exception as e:
        return Response({'error': f'File processing error: {str(e)}'}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_upload_lecturers(request):
    """Upload multiple lecturers via CSV"""
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=400)

    file = request.FILES['file']
    university = University.objects.filter(universityadmin__user=request.user).first()

    if not university:
        return Response({'error': 'University not found'}, status=400)

    try:
        import csv
        import io

        # Read CSV file
        file_data = file.read().decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(file_data))

        successful_uploads = 0
        duplicates = 0
        errors = []

        for row in csv_reader:
            try:
                # Check if lecturer already exists
                if User.objects.filter(email=row['email']).exists() or Lecturer.objects.filter(staff_id=row['staff_id']).exists():
                    duplicates += 1
                    continue

                # Create user
                user = User.objects.create_user(
                    username=row['email'],
                    email=row['email'],
                    password='defaultpassword123',  # Should be changed later
                    first_name=row['first_name'],
                    last_name=row['last_name']
                )

                # Get department
                department = Department.objects.get(id=int(row['department_id']))

                # Create lecturer profile
                lecturer = Lecturer.objects.create(
                    user=user,
                    staff_id=row['staff_id'],
                    department=department,
                    rank=row['rank']
                )

                successful_uploads += 1

            except Exception as e:
                errors.append(f"Error processing row {row}: {str(e)}")

        return Response({
            'successful_uploads': successful_uploads,
            'duplicates': duplicates,
            'errors': errors
        })

    except Exception as e:
        return Response({'error': f'File processing error: {str(e)}'}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_user_role(request):
    """Assign role to a user"""
    user_id = request.data.get('user_id')
    role = request.data.get('role')
    department_id = request.data.get('department_id')
    faculty_id = request.data.get('faculty_id')

    try:
        user = User.objects.get(id=user_id)
        university = University.objects.filter(universityadmin__user=request.user).first()

        if not university:
            return Response({'error': 'University not found'}, status=400)

        # Create or update user profile
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={'university': university, 'role': role}
        )

        if not created:
            profile.role = role
            if department_id:
                profile.department_id = department_id
            if faculty_id:
                profile.faculty_id = faculty_id
            profile.save()

        return Response({'message': f'Role {role} assigned to user successfully'})

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_management_list(request):
    """Get list of all users for management"""
    university = University.objects.filter(universityadmin__user=request.user).first()
    profiles = UserProfile.objects.filter(university=university).select_related('user', 'role')
    
    data = []
    for profile in profiles:
        data.append({
            'id': profile.user.id,
            'username': profile.user.username,
            'email': profile.user.email,
            'first_name': profile.user.first_name,
            'last_name': profile.user.last_name,
            'role': profile.role.name,
            'is_active': profile.user.is_active,
            'date_joined': profile.user.date_joined
        })
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reports_analytics(request):
    """Get reports and analytics data"""
    university = University.objects.filter(universityadmin__user=request.user).first()
    
    # Get basic statistics
    total_students = Student.objects.filter(university=university).count()
    total_lecturers = Lecturer.objects.filter(university=university).count()
    total_courses = Course.objects.filter(department__faculty__university=university).count()
    total_departments = Department.objects.filter(faculty__university=university).count()
    
    # Pass rate calculation
    results = Result.objects.filter(
        course_registration__course_assignment__course__department__faculty__university=university
    )
    total_results = results.count()
    passed_results = results.filter(grade__in=['A', 'B', 'C', 'D']).count()
    pass_rate = (passed_results / total_results * 100) if total_results > 0 else 0
    
    return Response({
        'total_students': total_students,
        'total_lecturers': total_lecturers,
        'total_courses': total_courses,
        'total_departments': total_departments,
        'pass_rate': round(pass_rate, 2),
        'total_results': total_results
    })

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

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    elif request.method == 'PUT':
        from .serializers import ProfileUpdateSerializer
        serializer = ProfileUpdateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.update(request.user, serializer.validated_data)
            return Response({'success': True, 'user': UserSerializer(request.user).data})
        return Response(serializer.errors, status=400)


# Password change endpoint for all authenticated users (admin roles included)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    from .serializers import PasswordChangeSerializer
    serializer = PasswordChangeSerializer(data=request.data)
    user = request.user
    if serializer.is_valid():
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'old_password': ['Wrong password.']}, status=400)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        update_session_auth_hash(request, user)
        return Response({'success': True})
    return Response(serializer.errors, status=400)

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

# Dashboard Stats Endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics for university admin"""
    try:
        # Get university from user
        university_admin = UniversityAdmin.objects.get(user=request.user)
        university = university_admin.university

        # Total counts
        total_students = Student.objects.filter(university=university, is_active=True).count()
        total_lecturers = Lecturer.objects.filter(university=university, is_active=True).count()
        total_courses = Course.objects.filter(department__faculty__university=university).count()
        total_departments = Department.objects.filter(faculty__university=university).count()

        # Result submission progress
        total_results = Result.objects.filter(
            course_registration__course_assignment__course__department__faculty__university=university
        ).count()

        submitted_results = ResultSubmission.objects.filter(
            course_assignment__course__department__faculty__university=university
        ).count()

        verified_results = ResultVerification.objects.filter(
            result_submission__course_assignment__course__department__faculty__university=university
        ).count()

        approved_results = ResultApproval.objects.filter(
            result_verification__result_submission__course_assignment__course__department__faculty__university=university
        ).count()

        # Pending approvals (submitted but not approved)
        pending_approvals = submitted_results - approved_results

        return Response({
            'totals': {
                'students': total_students,
                'lecturers': total_lecturers,
                'courses': total_courses,
                'departments': total_departments
            },
            'result_progress': {
                'total': total_results,
                'submitted': submitted_results,
                'verified': verified_results,
                'approved': approved_results,
                'pending_approvals': pending_approvals
            }
        })

    except UniversityAdmin.DoesNotExist:
        return Response({'error': 'University admin not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_enrollment_chart(request):
    """Get student enrollment data over time"""
    try:
        university_admin = UniversityAdmin.objects.get(user=request.user)
        university = university_admin.university

        # Group students by enrollment year
        from django.db.models import Count
        from django.db.models.functions import ExtractYear

        enrollment_data = Student.objects.filter(
            university=university, is_active=True
        ).annotate(
            year=ExtractYear('enrollment_date')
        ).values('year').annotate(
            count=Count('id')
        ).order_by('year')

        return Response(list(enrollment_data))

    except UniversityAdmin.DoesNotExist:
        return Response({'error': 'University admin not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_activities(request):
    """Get recent system activities"""
    try:
        university_admin = UniversityAdmin.objects.get(user=request.user)
        university = university_admin.university

        # Get recent system logs for this university
        activities = SystemLog.objects.filter(
            user__userprofile__university=university
        ).order_by('-timestamp')[:10]

        activity_data = []
        for activity in activities:
            activity_data.append({
                'id': activity.id,
                'timestamp': activity.timestamp,
                'user': activity.user.username if activity.user else 'System',
                'action': activity.action,
                'details': activity.details[:100] + '...' if len(activity.details) > 100 else activity.details
            })

        return Response(activity_data)

    except UniversityAdmin.DoesNotExist:
        return Response({'error': 'University admin not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_approvals(request):
    """Get pending result approvals"""
    try:
        university_admin = UniversityAdmin.objects.get(user=request.user)
        university = university_admin.university

        # Get results that are submitted but not approved
        pending_results = ResultSubmission.objects.filter(
            course_assignment__course__department__faculty__university=university
        ).filter(
            resultverification__isnull=False
        ).exclude(
            Exists(ResultApproval.objects.filter(result_verification=OuterRef('resultverification')))
        ).select_related(
            'course_assignment__course',
            'submitted_by__user'
        )[:10]

        pending_data = []
        for submission in pending_results:
            pending_data.append({
                'id': submission.id,
                'course': f"{submission.course_assignment.course.code} - {submission.course_assignment.course.name}",
                'lecturer': f"{submission.submitted_by.user.first_name} {submission.submitted_by.user.last_name}",
                'submitted_at': submission.submitted_at,
                'department': submission.course_assignment.course.department.name
            })

        return Response(pending_data)

    except UniversityAdmin.DoesNotExist:
        return Response({'error': 'University admin not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_overview(request):
    """Get department overview with statistics"""
    try:
        university_admin = UniversityAdmin.objects.get(user=request.user)
        university = university_admin.university

        departments = Department.objects.filter(
            faculty__university=university
        ).select_related('faculty')

        department_data = []
        for dept in departments:
            student_count = Student.objects.filter(department=dept, is_active=True).count()
            lecturer_count = Lecturer.objects.filter(department=dept, is_active=True).count()
            course_count = Course.objects.filter(department=dept).count()
            result_count = Result.objects.filter(
                course_registration__course_assignment__course__department=dept
            ).count()

            department_data.append({
                'id': dept.id,
                'name': dept.name,
                'faculty': dept.faculty.name,
                'students': student_count,
                'lecturers': lecturer_count,
                'courses': course_count,
                'results': result_count
            })

        return Response(department_data)

    except UniversityAdmin.DoesNotExist:
        return Response({'error': 'University admin not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deactivate_user(request, user_id):
    """Deactivate a user"""
    try:
        user = User.objects.get(id=user_id)
        user.is_active = False
        user.save()
        return Response({'message': 'User deactivated successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activate_user(request, user_id):
    """Activate a user"""
    try:
        user = User.objects.get(id=user_id)
        user.is_active = True
        user.save()
        return Response({'message': 'User activated successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def upcoming_events(request):
    """Get upcoming academic events"""
    try:
        university_admin = UniversityAdmin.objects.get(user=request.user)
        university = university_admin.university

        from django.utils import timezone

        # Get upcoming semesters
        upcoming_semesters = Semester.objects.filter(
            academic_session__university=university,
            end_date__gte=timezone.now().date()
        ).select_related('academic_session').order_by('start_date')[:5]

        events_data = []
        for semester in upcoming_semesters:
            events_data.append({
                'id': semester.id,
                'title': f"{semester.name} - {semester.academic_session.name}",
                'type': 'Semester',
                'start_date': semester.start_date,
                'end_date': semester.end_date,
                'description': f"Academic semester period"
            })

        # Get upcoming academic sessions
        upcoming_sessions = AcademicSession.objects.filter(
            university=university,
            end_date__gte=timezone.now().date()
        ).order_by('start_date')[:3]

        for session in upcoming_sessions:
            # Avoid duplicates
            if not any(event['title'] == f"{session.name}" for event in events_data):
                events_data.append({
                    'id': session.id,
                    'title': session.name,
                    'type': 'Academic Session',
                    'start_date': session.start_date,
                    'end_date': session.end_date,
                    'description': f"Academic session period"
                })

        # Sort by start date
        events_data.sort(key=lambda x: x['start_date'])

        return Response(events_data[:8])  # Return top 8 events

    except UniversityAdmin.DoesNotExist:
        return Response({'error': 'University admin not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
# Student-specific endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_notifications(request):
    """Get notifications for the current student"""
    try:
        # Get student profile
        student = Student.objects.get(user=request.user)
        
        # Get notifications for this student
        notifications = Notification.objects.filter(
            university=student.university
        ).filter(
            models.Q(recipient_type='all') |
            models.Q(recipient_type='students') |
            models.Q(recipient_user=request.user) |
            models.Q(recipient_department=student.department) |
            models.Q(recipient_faculty=student.faculty)
        ).order_by('-created_at')
        
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    
    except Student.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dean_overview(request):
    """Get academic overview for the dean's faculty"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        faculty = profile.faculty
        if not faculty:
            return Response({'error': 'Faculty not found for user profile'}, status=404)

        departments = Department.objects.filter(faculty=faculty)
        courses = Course.objects.filter(department__faculty=faculty)
        lecturers = Lecturer.objects.filter(faculty=faculty, is_active=True)
        students = Student.objects.filter(faculty=faculty, is_active=True)

        # Pending result submissions (not yet verified)
        pending_submissions = ResultSubmission.objects.filter(
            course_assignment__course__department__faculty=faculty
        ).exclude(
            resultverification__isnull=False
        ).count()

        # Pending approvals (verified but not approved)
        pending_approvals = ResultVerification.objects.filter(
            result_submission__course_assignment__course__department__faculty=faculty
        ).exclude(
            result_approval__isnull=False
        ).count()

        return Response({
            'faculty': {
                'id': faculty.id,
                'name': faculty.name,
            },
            'stats': {
                'departments': departments.count(),
                'courses': courses.count(),
                'lecturers': lecturers.count(),
                'students': students.count(),
                'pending_submissions': pending_submissions,
                'pending_approvals': pending_approvals,
            }
        })

    except UserProfile.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dean_departments(request):
    """List departments for the dean's faculty"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        faculty = profile.faculty
        if not faculty:
            return Response({'error': 'Faculty not found for user profile'}, status=404)

        departments = Department.objects.filter(faculty=faculty)
        department_data = []
        for dept in departments:
            department_data.append({
                'id': dept.id,
                'name': dept.name,
                'courses': Course.objects.filter(department=dept).count(),
                'lecturers': Lecturer.objects.filter(department=dept, is_active=True).count(),
                'students': Student.objects.filter(department=dept, is_active=True).count(),
            })

        return Response(department_data)

    except UserProfile.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dean_course_assignments(request):
    """List course assignments for the dean's faculty"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        faculty = profile.faculty
        if not faculty:
            return Response({'error': 'Faculty not found for user profile'}, status=404)

        assignments = CourseAssignment.objects.filter(
            course__department__faculty=faculty
        ).select_related('course', 'lecturer', 'semester')

        data = []
        for assignment in assignments:
            data.append({
                'id': assignment.id,
                'course_code': assignment.course.code,
                'course_name': assignment.course.name,
                'credits': assignment.course.credits,
                'lecturer': f"{assignment.lecturer.first_name} {assignment.lecturer.last_name}",
                'semester': assignment.semester.name if assignment.semester else None,
            })

        return Response(data)

    except UserProfile.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dean_lecturer_activities(request):
    """Get recent activity logs for lecturers in the dean's faculty"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        faculty = profile.faculty
        if not faculty:
            return Response({'error': 'Faculty not found for user profile'}, status=404)

        activities = ActivityLog.objects.filter(
            university=faculty.university,
            user__userprofile__faculty=faculty
        ).order_by('-timestamp')[:20]

        data = []
        for act in activities:
            data.append({
                'id': act.id,
                'timestamp': act.timestamp,
                'user': act.user.username if act.user else 'System',
                'activity': act.activity,
                'details': act.details
            })

        return Response(data)

    except UserProfile.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dean_review_results(request):
    """List result submissions pending verification"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        faculty = profile.faculty
        if not faculty:
            return Response({'error': 'Faculty not found for user profile'}, status=404)

        submissions = ResultSubmission.objects.filter(
            course_assignment__course__department__faculty=faculty
        ).exclude(
            resultverification__isnull=False
        ).select_related('course_assignment__course', 'submitted_by')

        data = []
        for submission in submissions:
            data.append({
                'id': submission.id,
                'course': f"{submission.course_assignment.course.code} - {submission.course_assignment.course.name}",
                'submitted_by': f"{submission.submitted_by.first_name} {submission.submitted_by.last_name}",
                'submitted_at': submission.submitted_at,
            })

        return Response(data)

    except UserProfile.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dean_approve_results(request):
    """List verified results pending approval"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        faculty = profile.faculty
        if not faculty:
            return Response({'error': 'Faculty not found for user profile'}, status=404)

        verifications = ResultVerification.objects.filter(
            result_submission__course_assignment__course__department__faculty=faculty
        ).exclude(
            result_approval__isnull=False
        ).select_related('result_submission__course_assignment__course', 'verified_by')

        data = []
        for verification in verifications:
            submission = verification.result_submission
            course = submission.course_assignment.course
            data.append({
                'id': verification.id,
                'course': f"{course.code} - {course.name}",
                'verified_by': f"{verification.verified_by.user.first_name} {verification.verified_by.user.last_name}",
                'verified_at': verification.verified_at,
                'submission_id': submission.id
            })

        return Response(data)

    except UserProfile.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def dean_approve_submission(request, submission_id):
    """Approve a verified submission"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        verification = ResultVerification.objects.get(result_submission__id=submission_id)

        # Ensure this verification is for the dean's faculty
        if verification.result_submission.course_assignment.course.department.faculty != profile.faculty:
            return Response({'error': 'Not authorized to approve this submission'}, status=403)

        ResultApproval.objects.create(
            result_verification=verification,
            approved_by=profile
        )

        return Response({'success': True})

    except ResultVerification.DoesNotExist:
        return Response({'error': 'Verification not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def dean_return_submission(request, submission_id):
    """Mark a submission as returned for correction"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        submission = ResultSubmission.objects.get(id=submission_id)

        if submission.course_assignment.course.department.faculty != profile.faculty:
            return Response({'error': 'Not authorized to return this submission'}, status=403)

        # In absence of a dedicated return model, we log it and return success.
        ActivityLog.objects.create(
            user=request.user,
            activity='Returned result submission',
            details=f'Returned submission {submission.id} for correction',
            university=profile.university
        )

        return Response({'success': True})

    except ResultSubmission.DoesNotExist:
        return Response({'error': 'Submission not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dean_reports(request):
    """Get faculty reports and analytics for the dean"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        faculty = profile.faculty
        if not faculty:
            return Response({'error': 'Faculty not found for user profile'}, status=404)

        # Faculty statistics
        departments = Department.objects.filter(faculty=faculty)
        courses = Course.objects.filter(department__faculty=faculty)
        lecturers = Lecturer.objects.filter(faculty=faculty, is_active=True)
        students = Student.objects.filter(faculty=faculty, is_active=True)

        # Result statistics
        results = Result.objects.filter(
            course_registration__course_assignment__course__department__faculty=faculty
        )
        total_results = results.count()
        passed_results = results.filter(grade__in=['A', 'B', 'C', 'D']).count()
        pass_rate = (passed_results / total_results * 100) if total_results > 0 else 0

        # Submission statistics
        submissions = ResultSubmission.objects.filter(
            course_assignment__course__department__faculty=faculty
        )
        total_submissions = submissions.count()
        verified_submissions = submissions.filter(resultverification__isnull=False).count()
        approved_submissions = submissions.filter(
            resultverification__result_approval__isnull=False
        ).count()

        # Department performance
        department_performance = []
        for dept in departments:
            dept_results = Result.objects.filter(
                course_registration__course_assignment__course__department=dept
            )
            dept_total = dept_results.count()
            dept_passed = dept_results.filter(grade__in=['A', 'B', 'C', 'D']).count()
            dept_pass_rate = (dept_passed / dept_total * 100) if dept_total > 0 else 0

            department_performance.append({
                'name': dept.name,
                'students': Student.objects.filter(department=dept, is_active=True).count(),
                'courses': Course.objects.filter(department=dept).count(),
                'results': dept_total,
                'pass_rate': round(dept_pass_rate, 2)
            })

        return Response({
            'faculty_overview': {
                'name': faculty.name,
                'departments': departments.count(),
                'courses': courses.count(),
                'lecturers': lecturers.count(),
                'students': students.count(),
            },
            'result_statistics': {
                'total_results': total_results,
                'passed_results': passed_results,
                'pass_rate': round(pass_rate, 2),
            },
            'submission_statistics': {
                'total_submissions': total_submissions,
                'verified_submissions': verified_submissions,
                'approved_submissions': approved_submissions,
            },
            'department_performance': department_performance,
        })

    except UserProfile.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_academic_progress(request):
    """Get academic progress for the current student"""
    try:
        student = Student.objects.get(user=request.user)
        
        # Calculate completed credits
        completed_results = Result.objects.filter(
            course_registration__student=student,
            grade__isnull=False
        ).exclude(grade='')
        
        completed_credits = 0
        for result in completed_results:
            course = result.course_registration.course_assignment.course
            if result.grade and result.grade not in ['F', 'FF']:
                completed_credits += course.credits
        
        # Get program total credits (assuming 120 for now)
        total_credits = student.program.duration_years * 30  # Rough estimate
        
        # Current level
        current_level = student.level
        
        progress_data = {
            'completedCredits': completed_credits,
            'totalCredits': total_credits,
            'currentLevel': current_level,
            'progressPercentage': (completed_credits / total_credits) * 100 if total_credits > 0 else 0
        }
        
        return Response(progress_data)
    
    except Student.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)