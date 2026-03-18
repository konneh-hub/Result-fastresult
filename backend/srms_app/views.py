from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Avg, Q, Count
from django.db.models.functions import ExtractYear
from django.db import transaction
import csv
import io
import datetime
from .models import *
from .serializers import *
from academic.models import *

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

# Registration endpoints
@api_view(['POST'])
@permission_classes([AllowAny])
def register_student(request):
    data = request.data
    try:
        university_id = data.get('university_id') or data.get('university')

        # Check if student record exists (uploaded by university admin)
        try:
            if university_id:
                student = Student.objects.get(student_id=data['student_id'], university_id=university_id)
            else:
                student = Student.objects.get(student_id=data['student_id'])
        except Student.DoesNotExist:
            return Response({'error': 'Student ID not found. Please contact your university admin to upload your information first.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if student already has a user account
        if student.user:
            return Response({'error': 'Account already exists for this student ID'}, status=status.HTTP_400_BAD_REQUEST)

        # Determine email
        email = data.get('email') or student.email

        # Validate email if provided
        if data.get('email') and student.email != data['email']:
            return Response({'error': 'Email does not match university records'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if username or email already exists
        if User.objects.filter(username=data['student_id']).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Create User
        user = User.objects.create_user(
            username=data['student_id'],
            email=email,
            password=data['password'],
            first_name=student.first_name,
            last_name=student.last_name
        )

        # Update student record with user reference
        student.user = user
        student.save()

        # Create UserProfile
        UserProfile.objects.create(
            user=user,
            university=student.university,
            faculty=student.faculty,
            department=student.department,
            program=student.program,
            role='student'
        )

        return Response({'message': 'Student account created successfully'}, status=status.HTTP_201_CREATED)
    except KeyError as e:
        return Response({'error': f'Missing required field: {e.args[0]}'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_lecturer(request):
    data = request.data
    try:
        university_id = data.get('university_id') or data.get('university')

        # Check if lecturer record exists with the provided employee_id
        try:
            if university_id:
                lecturer = Lecturer.objects.get(employee_id=data['employee_id'], university_id=university_id)
            else:
                lecturer = Lecturer.objects.get(employee_id=data['employee_id'])
        except Lecturer.DoesNotExist:
            return Response({'error': 'Employee ID not found. Please contact your university admin to upload your information first.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if lecturer already has a user account
        if lecturer.user is not None:
            return Response({'error': 'Account already exists for this employee ID'}, status=status.HTTP_400_BAD_REQUEST)

        # Determine email
        email = data.get('email') or lecturer.email

        # Validate email if provided
        if data.get('email') and lecturer.email != data['email']:
            return Response({'error': 'Email does not match university records'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if username already exists
        if User.objects.filter(username=data['employee_id']).exists():
            return Response({'error': 'Employee ID already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Create User
        user = User.objects.create_user(
            username=data['employee_id'],
            email=email,
            password=data['password'],
            first_name=lecturer.first_name,
            last_name=lecturer.last_name
        )

        # Link user to existing lecturer record
        lecturer.user = user
        lecturer.save()

        # Create UserProfile
        UserProfile.objects.create(
            user=user,
            university=lecturer.university,
            faculty=lecturer.faculty,
            department=lecturer.department,
            role='lecturer'
        )

        return Response({'message': 'Lecturer account created successfully'}, status=status.HTTP_201_CREATED)
    except KeyError as e:
        return Response({'error': f'Missing required field: {e.args[0]}'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Admin account creation endpoint
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_admin_account(request):
    data = request.data
    print(f"DEBUG create_admin: data={data}")  # Temporary debug logging
    
    try:
        # Check if user is university admin
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Only university admins can create admin accounts'}, status=status.HTTP_403_FORBIDDEN)

        role = data.get('role')
        if not role or role not in ['exam_officer', 'dean', 'hod']:
            return Response({'error': 'Invalid or missing role. Must be one of: exam_officer, dean, hod'}, status=status.HTTP_400_BAD_REQUEST)

        # Common required fields validation
        required_common = ['username', 'email', 'password', 'first_name', 'last_name']
        for field in required_common:
            if not data.get(field, '').strip():
                return Response({'error': f'Missing required field: {field}'}, status=status.HTTP_400_BAD_REQUEST)

        # Username/Email uniqueness check
        if User.objects.filter(username=data['username']).exists():
            return Response({'error': f'Username "{data["username"]}" already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=data['email']).exists():
            return Response({'error': f'Email "{data["email"]}" already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Role-specific validation (faculty/department optional)
        faculty = None
        department = None

        if role == 'dean':
            faculty_id_str = data.get('faculty_id', '')
            if faculty_id_str:
                try:
                    faculty_id = int(faculty_id_str)
                    faculty = Faculty.objects.get(id=faculty_id, university=user_profile.university)
                except (ValueError, Faculty.DoesNotExist):
                    return Response({'error': f'Invalid faculty_id "{faculty_id_str}". Must be a valid faculty ID for your university.'}, status=status.HTTP_400_BAD_REQUEST)

        elif role == 'hod':
            faculty_id_str = data.get('faculty_id', '')
            dept_id_str = data.get('department_id', '')
            if faculty_id_str or dept_id_str:
                if not faculty_id_str or not dept_id_str:
                    return Response({'error': 'To set HOD faculty/department, both faculty_id and department_id are required.'}, status=status.HTTP_400_BAD_REQUEST)
                try:
                    faculty_id = int(faculty_id_str)
                    dept_id = int(dept_id_str)
                    faculty = Faculty.objects.get(id=faculty_id, university=user_profile.university)
                    department = Department.objects.get(id=dept_id, faculty=faculty)
                except (ValueError, Faculty.DoesNotExist, Department.DoesNotExist):
                    return Response({'error': f'Invalid faculty_id "{faculty_id_str}" or department_id "{dept_id_str}". Department must belong to selected faculty.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create User
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            first_name=data['first_name'],
            last_name=data['last_name']
        )

        # Prepare profile data
        profile_data = {
            'user': user,
            'university': user_profile.university,
            'role': role
        }

        # Role-specific profile fields
        if faculty is not None:
            profile_data['faculty'] = faculty
        if department is not None:
            profile_data['department'] = department

        # Create UserProfile
        profile = UserProfile.objects.create(**profile_data)

        # Create Lecturer record for dean/hod
        if role in ['dean', 'hod']:
            lecturer_data = {
                'user': user,
                'university': user_profile.university,
                'first_name': data['first_name'],
                'last_name': data['last_name'],
                'email': data['email'],
                'employee_id': data.get('staff_id', data['username']),
            }
            if faculty is not None:
                lecturer_data['faculty'] = faculty
            if department is not None:
                lecturer_data['department'] = department

            Lecturer.objects.create(**lecturer_data)

        return Response({
            'message': f'{role.replace("_", " ").title()} account created successfully!',
            'user_id': user.id,
            'profile_id': profile.id
        }, status=status.HTTP_201_CREATED)

    except UserProfile.DoesNotExist:
        return Response({'error': 'User profile not found. Please contact support.'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"ERROR create_admin_account: {str(e)}")  # Debug logging
        # Cleanup on failure
        if 'user' in locals() and user:
            user.delete()
        return Response({'error': f'Failed to create account: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

# Universities endpoint
@api_view(['GET'])
@permission_classes([AllowAny])
def universities(request):
    universities = UniversitySerializer(University.objects.filter(is_approved=True), many=True)
    return Response(universities.data)

# ViewSets for admin
class UniversityViewSet(viewsets.ModelViewSet):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [IsAuthenticated]  # Only system admin

class UniversityAdminViewSet(viewsets.ModelViewSet):
    queryset = UniversityAdmin.objects.all()
    serializer_class = UniversityAdminSerializer
    permission_classes = [IsAuthenticated]

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

class SupportTicketViewSet(viewsets.ModelViewSet):
    queryset = SupportTicket.objects.all()
    serializer_class = SupportTicketSerializer
    permission_classes = [IsAuthenticated]

class SystemBackupViewSet(viewsets.ModelViewSet):
    queryset = SystemBackup.objects.all()
    serializer_class = SystemBackupSerializer
    permission_classes = [IsAuthenticated]

class APIIntegrationViewSet(viewsets.ModelViewSet):
    queryset = APIIntegration.objects.all()
    serializer_class = APIIntegrationSerializer
    permission_classes = [IsAuthenticated]

# Bulk upload endpoints for university admins
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_students(request):
    try:
        # Check if user is university admin
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        if 'file' not in request.FILES:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        csv_file = request.FILES['file']
        if not csv_file.name.endswith('.csv'):
            return Response({'error': 'File must be a CSV'}, status=status.HTTP_400_BAD_REQUEST)

        # Read CSV file
        file_data = csv_file.read().decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(file_data))

        created_count = 0
        errors = []

        with transaction.atomic():
            for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 because row 1 is header
                try:
                    # Validate required fields
                    required_fields = ['student_id', 'first_name', 'last_name', 'email', 'program']
                    for field in required_fields:
                        if not row.get(field):
                            errors.append(f"Row {row_num}: Missing {field}")
                            continue

                    # Check if student already exists
                    if Student.objects.filter(student_id=row['student_id']).exists():
                        errors.append(f"Row {row_num}: Student ID {row['student_id']} already exists")
                        continue

                    # Get or create relationships
                    university = user_profile.university
                    faculty_name = row.get('faculty', '')
                    department_name = row.get('department', '')
                    program_name = row['program']

                    faculty = None
                    department = None
                    program = None

                    if faculty_name:
                        faculty, _ = Faculty.objects.get_or_create(
                            name=faculty_name,
                            university=university
                        )

                    if department_name and faculty:
                        department, _ = Department.objects.get_or_create(
                            name=department_name,
                            faculty=faculty
                        )

                    if program_name and department:
                        program, _ = Program.objects.get_or_create(
                            name=program_name,
                            department=department
                        )

                    # Create student record
                    Student.objects.create(
                        student_id=row['student_id'],
                        first_name=row['first_name'],
                        last_name=row['last_name'],
                        email=row['email'],
                        university=university,
                        faculty=faculty,
                        department=department,
                        program=program
                    )
                    created_count += 1

                except Exception as e:
                    errors.append(f"Row {row_num}: {str(e)}")

        return Response({
            'message': f'Successfully uploaded {created_count} students',
            'errors': errors
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_lecturers(request):
    try:
        # Check if user is university admin
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        if 'file' not in request.FILES:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        csv_file = request.FILES['file']
        if not csv_file.name.endswith('.csv'):
            return Response({'error': 'File must be a CSV'}, status=status.HTTP_400_BAD_REQUEST)

        # Read CSV file
        file_data = csv_file.read().decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(file_data))

        created_count = 0
        errors = []

        with transaction.atomic():
            for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 because row 1 is header
                try:
                    # Validate required fields
                    required_fields = ['employee_id', 'first_name', 'last_name', 'email', 'department']
                    for field in required_fields:
                        if not row.get(field):
                            errors.append(f"Row {row_num}: Missing {field}")
                            continue

                    # Check if lecturer already exists
                    if Lecturer.objects.filter(employee_id=row['employee_id']).exists():
                        errors.append(f"Row {row_num}: Employee ID {row['employee_id']} already exists")
                        continue

                    # Get or create relationships
                    university = user_profile.university
                    faculty_name = row.get('faculty', '')
                    department_name = row['department']

                    faculty = None
                    department = None

                    if faculty_name:
                        faculty, _ = Faculty.objects.get_or_create(
                            name=faculty_name,
                            university=university
                        )

                    if department_name:
                        if faculty:
                            department, _ = Department.objects.get_or_create(
                                name=department_name,
                                faculty=faculty
                            )
                        else:
                            # If no faculty specified, create department under a default faculty
                            default_faculty, _ = Faculty.objects.get_or_create(
                                name='General',
                                university=university
                            )
                            department, _ = Department.objects.get_or_create(
                                name=department_name,
                                faculty=default_faculty
                            )

                    # Create lecturer record
                    Lecturer.objects.create(
                        employee_id=row['employee_id'],
                        first_name=row['first_name'],
                        last_name=row['last_name'],
                        email=row['email'],
                        university=university,
                        faculty=faculty or default_faculty,
                        department=department,
                        rank=row.get('rank', 'Lecturer')
                    )
                    created_count += 1

                except Exception as e:
                    errors.append(f"Row {row_num}: {str(e)}")

        return Response({
            'message': f'Successfully uploaded {created_count} lecturers',
            'errors': errors
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PlatformReportViewSet(viewsets.ModelViewSet):
    queryset = PlatformReport.objects.all()
    serializer_class = PlatformReportSerializer
    permission_classes = [IsAuthenticated]

class SecuritySettingViewSet(viewsets.ModelViewSet):
    queryset = SecuritySetting.objects.all()
    serializer_class = SecuritySettingSerializer
    permission_classes = [IsAuthenticated]

class SystemSettingViewSet(viewsets.ModelViewSet):
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
    permission_classes = [IsAuthenticated]

class BrandingViewSet(viewsets.ModelViewSet):
    queryset = Branding.objects.all()
    serializer_class = BrandingSerializer
    permission_classes = [IsAuthenticated]

# Dashboard endpoints for user pages
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    profile = UserProfile.objects.get(user=user)
    role = profile.role

    stats = {}
    if role == 'university_admin':
        # Stats for University Admin dashboard
        university = profile.university
        stats = {
            'total_students': Student.objects.filter(university=university).count(),
            'total_lecturers': Lecturer.objects.filter(university=university).count(),
            # Departments are linked to faculties, so filter via Faculty->University
            'total_departments': Department.objects.filter(faculty__university=university).count(),
            'total_faculties': Faculty.objects.filter(university=university).count(),
            'pending_approvals': University.objects.filter(is_approved=False).count(),  # Assuming system admin approvals
        }
    elif role == 'dean':
        # Stats for Dean dashboard
        faculty = profile.faculty
        if not faculty:
            stats = {'error': 'Faculty not assigned'}
        else:
            stats = {
                'total_departments': Department.objects.filter(faculty=faculty).count(),
                'total_lecturers': Lecturer.objects.filter(faculty=faculty).count(),
                'total_students': Student.objects.filter(faculty=faculty).count(),
                'pending_results': ResultSubmission.objects.filter(status='pending', course__department__faculty=faculty).count(),
            }
    elif role == 'hod':
        # Stats for HOD dashboard
        department = profile.department
        if not department:
            stats = {'error': 'Department not assigned'}
        else:
            stats = {
                'total_lecturers': Lecturer.objects.filter(department=department).count(),
                'total_students': Student.objects.filter(department=department).count(),
                'total_courses': Course.objects.filter(department=department).count(),
                'pending_results': ResultSubmission.objects.filter(status='pending', course__department=department).count(),
            }
    elif role == 'exam_officer':
        # Stats for Exam Officer dashboard
        university = profile.university
        stats = {
            'total_results_submitted': ResultSubmission.objects.filter(course__department__faculty__university=university).count(),
            'pending_verifications': ResultVerification.objects.filter(status='pending', result__course__department__faculty__university=university).count(),
            'pending_approvals': ResultApproval.objects.filter(status='pending', result__course__department__faculty__university=university).count(),
            'published_results': ResultPublication.objects.filter(result__course__department__faculty__university=university).count(),
        }
    elif role == 'lecturer':
        # Stats for Lecturer dashboard
        lecturer = Lecturer.objects.get(user=user)
        stats = {
            'assigned_courses': CourseAssignment.objects.filter(lecturer=lecturer).count(),
            'total_students': CourseRegistration.objects.filter(course__courseassignment__lecturer=lecturer).count(),
            'submitted_results': ResultSubmission.objects.filter(course__courseassignment__lecturer=lecturer).count(),
        }
    elif role == 'student':
        # Stats for Student dashboard
        student = Student.objects.get(user=user)
        stats = {
            'registered_courses': CourseRegistration.objects.filter(student=student).count(),
            'completed_courses': Result.objects.filter(student=student, grade__isnull=False).count(),
            'gpa': GPARecord.objects.filter(student=student).aggregate(avg_gpa=Avg('gpa'))['avg_gpa'] or 0,
            'cgpa': CGPARecord.objects.filter(student=student).last().cgpa if CGPARecord.objects.filter(student=student).exists() else 0,
        }

    return Response(stats)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_activities(request):
    user = request.user
    profile = UserProfile.objects.get(user=user)
    role = profile.role

    activities = []
    if role == 'university_admin':
        # Recent activities for University Admin
        activities = ActivityLog.objects.filter(university=profile.university).order_by('-timestamp')[:10]
    elif role == 'dean':
        activities = ActivityLog.objects.filter(faculty=profile.faculty).order_by('-timestamp')[:10]
    elif role == 'hod':
        activities = ActivityLog.objects.filter(department=profile.department).order_by('-timestamp')[:10]
    elif role == 'exam_officer':
        activities = ActivityLog.objects.filter(university=profile.university, action__in=['result_submitted', 'result_verified', 'result_approved', 'result_published']).order_by('-timestamp')[:10]
    elif role == 'lecturer':
        lecturer = Lecturer.objects.get(user=user)
        activities = ActivityLog.objects.filter(lecturer=lecturer).order_by('-timestamp')[:10]
    elif role == 'student':
        student = Student.objects.get(user=user)
        activities = ActivityLog.objects.filter(student=student).order_by('-timestamp')[:10]

    serializer = ActivityLogSerializer(activities, many=True)
    return Response(serializer.data)

# ============================================================================
# UNIVERSITY ADMIN ENDPOINTS
# ============================================================================

# Academic Session Management
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def academic_sessions(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        university = user_profile.university

        if request.method == 'GET':
            sessions = AcademicSession.objects.filter(university=university)
            data = [{
                'id': session.id,
                'name': session.name,
                'start_date': session.start_date,
                'end_date': session.end_date,
                'is_active': session.is_active if hasattr(session, 'is_active') else False
            } for session in sessions]
            return Response(data)

        elif request.method == 'POST':
            data = request.data
            session = AcademicSession.objects.create(
                university=university,
                name=data['name'],
                start_date=data['start_date'],
                end_date=data['end_date']
            )
            return Response({
                'id': session.id,
                'name': session.name,
                'start_date': session.start_date,
                'end_date': session.end_date
            }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def activate_session(request, session_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        session = AcademicSession.objects.get(id=session_id, university=user_profile.university)
        # Deactivate all other sessions
        AcademicSession.objects.filter(university=user_profile.university).update(is_active=False)
        session.is_active = True
        session.save()

        return Response({'message': 'Session activated successfully'})

    except AcademicSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Semester Management
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def semesters(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        university = user_profile.university

        if request.method == 'GET':
            semesters = Semester.objects.filter(academic_session__university=university).select_related('academic_session')
            data = [{
                'id': semester.id,
                'name': semester.name,
                'academic_session': semester.academic_session.name,
                'start_date': semester.start_date,
                'end_date': semester.end_date,
                'is_current': semester.is_current if hasattr(semester, 'is_current') else False
            } for semester in semesters]
            return Response(data)

        elif request.method == 'POST':
            data = request.data
            academic_session = AcademicSession.objects.get(id=data['academic_session_id'], university=university)
            semester = Semester.objects.create(
                academic_session=academic_session,
                name=data['name'],
                start_date=data['start_date'],
                end_date=data['end_date']
            )
            return Response({
                'id': semester.id,
                'name': semester.name,
                'academic_session': semester.academic_session.name,
                'start_date': semester.start_date,
                'end_date': semester.end_date
            }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def activate_semester(request, semester_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        semester = Semester.objects.get(id=semester_id, academic_session__university=user_profile.university)
        # Deactivate all other semesters
        Semester.objects.filter(academic_session__university=user_profile.university).update(is_current=False)
        semester.is_current = True
        semester.save()

        return Response({'message': 'Semester activated successfully'})

    except Semester.DoesNotExist:
        return Response({'error': 'Semester not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Faculty Management
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def faculties(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        university = user_profile.university

        if request.method == 'GET':
            faculties = Faculty.objects.filter(university=university).select_related('dean')
            data = [{
                'id': faculty.id,
                'name': faculty.name,
                'code': faculty.code,
                'dean': f"{faculty.dean.first_name} {faculty.dean.last_name}" if faculty.dean else None,
                'description': faculty.description
            } for faculty in faculties]
            return Response(data)

        elif request.method == 'POST':
            data = request.data
            faculty = Faculty.objects.create(
                university=university,
                name=data['name'],
                code=data.get('code'),
                description=data.get('description', '')
            )
            return Response({
                'id': faculty.id,
                'name': faculty.name,
                'code': faculty.code,
                'description': faculty.description
            }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def faculty_detail(request, faculty_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        faculty = Faculty.objects.get(id=faculty_id, university=user_profile.university)

        if request.method == 'PUT':
            data = request.data
            faculty.name = data.get('name', faculty.name)
            faculty.code = data.get('code', faculty.code)
            faculty.description = data.get('description', faculty.description)
            if 'dean_id' in data:
                dean = Lecturer.objects.get(id=data['dean_id'], university=user_profile.university)
                faculty.dean = dean
            faculty.save()
            return Response({'message': 'Faculty updated successfully'})

        elif request.method == 'DELETE':
            faculty.delete()
            return Response({'message': 'Faculty deleted successfully'})

    except Faculty.DoesNotExist:
        return Response({'error': 'Faculty not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Department Management
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def departments(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        university = user_profile.university

        if request.method == 'GET':
            departments = Department.objects.filter(faculty__university=university).select_related('faculty', 'head')
            data = [{
                'id': dept.id,
                'name': dept.name,
                'code': dept.code,
                'faculty': dept.faculty.name,
                'head': f"{dept.head.first_name} {dept.head.last_name}" if dept.head else None,
                'description': dept.description
            } for dept in departments]
            return Response(data)

        elif request.method == 'POST':
            data = request.data
            faculty = Faculty.objects.get(id=data['faculty_id'], university=university)
            department = Department.objects.create(
                faculty=faculty,
                name=data['name'],
                code=data.get('code'),
                description=data.get('description', '')
            )
            return Response({
                'id': department.id,
                'name': department.name,
                'code': department.code,
                'faculty': department.faculty.name,
                'description': department.description
            }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def department_detail(request, department_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        department = Department.objects.get(id=department_id, faculty__university=user_profile.university)

        if request.method == 'PUT':
            data = request.data
            department.name = data.get('name', department.name)
            department.code = data.get('code', department.code)
            department.description = data.get('description', department.description)
            if 'head_id' in data:
                head = Lecturer.objects.get(id=data['head_id'], university=user_profile.university)
                department.head = head
            department.save()
            return Response({'message': 'Department updated successfully'})

        elif request.method == 'DELETE':
            department.delete()
            return Response({'message': 'Department deleted successfully'})

    except Department.DoesNotExist:
        return Response({'error': 'Department not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_overview(request, department_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        allowed_roles = ['hod', 'dean', 'university_admin']
        if user_profile.role not in allowed_roles:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        department = Department.objects.get(id=department_id)

        # Enforce access control
        if user_profile.role == 'hod' and user_profile.department != department:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        if user_profile.role == 'dean' and department.faculty != user_profile.faculty:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        if user_profile.role == 'university_admin' and department.faculty.university != user_profile.university:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        data = {
            'id': department.id,
            'name': department.name,
            'student_count': Student.objects.filter(department=department).count(),
            'lecturer_count': Lecturer.objects.filter(department=department).count(),
            'course_count': Course.objects.filter(department=department).count(),
            'result_count': Result.objects.filter(course_registration__course_assignment__course__department=department).count(),
            'program_count': Program.objects.filter(department=department).count(),
        }
        return Response(data)

    except Department.DoesNotExist:
        return Response({'error': 'Department not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Program Management
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def programs(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        university = user_profile.university

        if request.method == 'GET':
            programs = Program.objects.filter(department__faculty__university=university).select_related('department')
            data = [{
                'id': program.id,
                'name': program.name,
                'code': program.code,
                'department': program.department.name,
                'degree_type': program.degree_type,
                'duration_years': program.duration_years
            } for program in programs]
            return Response(data)

        elif request.method == 'POST':
            data = request.data
            department = Department.objects.get(id=data['department_id'], faculty__university=university)
            program = Program.objects.create(
                department=department,
                name=data['name'],
                code=data.get('code'),
                degree_type=data.get('degree_type', 'BSc'),
                duration_years=data.get('duration_years', 4)
            )
            return Response({
                'id': program.id,
                'name': program.name,
                'code': program.code,
                'department': program.department.name,
                'degree_type': program.degree_type,
                'duration_years': program.duration_years
            }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Course Management
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def courses(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        university = user_profile.university

        if request.method == 'GET':
            courses = Course.objects.filter(department__faculty__university=university).select_related('department', 'program')
            data = [{
                'id': course.id,
                'code': course.code,
                'name': course.name,
                'department': course.department.name,
                'program': course.program.name if course.program else None,
                'credits': course.credits
            } for course in courses]
            return Response(data)

        elif request.method == 'POST':
            data = request.data
            department = Department.objects.get(id=data['department_id'], faculty__university=university)
            program = None
            if 'program_id' in data:
                program = Program.objects.get(id=data['program_id'], department=department)

            course = Course.objects.create(
                department=department,
                program=program,
                code=data['code'],
                name=data['name'],
                credits=data['credits']
            )
            return Response({
                'id': course.id,
                'code': course.code,
                'name': course.name,
                'department': course.department.name,
                'program': course.program.name if course.program else None,
                'credits': course.credits
            }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# User Management
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_management(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        university = user_profile.university

        # Get all users in the university
        profiles = UserProfile.objects.filter(university=university).select_related('user', 'faculty', 'department')
        data = [{
            'id': profile.user.id,
            'username': profile.user.username,
            'first_name': profile.user.first_name,
            'last_name': profile.user.last_name,
            'email': profile.user.email,
            'role': profile.role,
            'faculty': profile.faculty.name if profile.faculty else None,
            'department': profile.department.name if profile.department else None,
            'is_active': profile.user.is_active
        } for profile in profiles]
        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def toggle_user_status(request, user_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        target_user = User.objects.get(id=user_id)
        target_profile = UserProfile.objects.get(user=target_user, university=user_profile.university)

        target_user.is_active = not target_user.is_active
        target_user.save()

        return Response({
            'message': f'User {"activated" if target_user.is_active else "deactivated"} successfully',
            'is_active': target_user.is_active
        })

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def assign_role(request, user_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        target_user = User.objects.get(id=user_id)
        target_profile = UserProfile.objects.get(user=target_user, university=user_profile.university)

        data = request.data
        target_profile.role = data['role']
        if 'faculty_id' in data:
            faculty = Faculty.objects.get(id=data['faculty_id'], university=user_profile.university)
            target_profile.faculty = faculty
        if 'department_id' in data:
            department = Department.objects.get(id=data['department_id'], faculty__university=user_profile.university)
            target_profile.department = department
        target_profile.save()

        return Response({'message': 'Role assigned successfully'})

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# University admin management endpoints for frontend
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activate_user(request, user_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        target_user = User.objects.get(id=user_id)
        target_profile = UserProfile.objects.get(user=target_user, university=user_profile.university)

        target_user.is_active = True
        target_user.save()

        return Response({'message': 'User activated successfully', 'is_active': True})

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deactivate_user(request, user_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        target_user = User.objects.get(id=user_id)
        target_profile = UserProfile.objects.get(user=target_user, university=user_profile.university)

        target_user.is_active = False
        target_user.save()

        return Response({'message': 'User deactivated successfully', 'is_active': False})

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def management_assign_role(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        user_id = data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        target_user = User.objects.get(id=user_id)
        target_profile = UserProfile.objects.get(user=target_user, university=user_profile.university)

        target_profile.role = data.get('role', target_profile.role)
        if 'faculty_id' in data and data['faculty_id']:
            faculty = Faculty.objects.get(id=data['faculty_id'], university=user_profile.university)
            target_profile.faculty = faculty
        if 'department_id' in data and data['department_id']:
            department = Department.objects.get(id=data['department_id'], faculty__university=user_profile.university)
            target_profile.department = department
        target_profile.save()

        return Response({'message': 'Role assigned successfully'})

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def management_reports_analytics(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        university = user_profile.university
        data = {
            'total_students': Student.objects.filter(university=university).count(),
            'total_lecturers': Lecturer.objects.filter(university=university).count(),
            'total_courses': Course.objects.filter(department__faculty__university=university).count(),
            'active_results': Result.objects.filter(course_registration__course_assignment__course__department__faculty__university=university, grade__isnull=False).count(),
            'total_faculties': Faculty.objects.filter(university=university).count(),
            'total_departments': Department.objects.filter(faculty__university=university).count(),
        }
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def management_submitted_results(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'exam_officer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        university = user_profile.university
        submissions = ResultSubmission.objects.filter(
            course_assignment__course__department__faculty__university=university
        ).select_related('course_assignment__course', 'submitted_by')

        data = []
        for submission in submissions:
            status_label = 'submitted'
            if ResultVerification.objects.filter(result_submission=submission).exists():
                status_label = 'verified'
            if ResultApproval.objects.filter(result_verification__result_submission=submission).exists():
                status_label = 'approved'

            data.append({
                'id': submission.id,
                'course_name': submission.course_assignment.course.name,
                'lecturer_name': f"{submission.submitted_by.first_name} {submission.submitted_by.last_name}",
                'status': status_label
            })

        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def management_verify_result(request, submission_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'exam_officer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        submission = ResultSubmission.objects.get(id=submission_id)
        status_action = request.data.get('status')

        if status_action == 'verified':
            ResultVerification.objects.get_or_create(result_submission=submission, verified_by=request.user)
            return Response({'message': 'Result verified'})
        elif status_action == 'rejected':
            submission.delete()
            return Response({'message': 'Result rejected'})
        else:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    except ResultSubmission.DoesNotExist:
        return Response({'error': 'Submission not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def management_system_alerts(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'exam_officer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        alerts = Notification.objects.filter(
            Q(recipient_type='all') |
            Q(recipient_type='university', recipient_university=user_profile.university)
        ).order_by('-created_at')

        data = [
            {
                'id': alert.id,
                'title': alert.title,
                'message': alert.message,
                'severity': 'info',
                'timestamp': alert.created_at,
                'is_read': alert.is_read
            }
            for alert in alerts
        ]

        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def management_pending_approvals(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role not in ['hod', 'exam_officer']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Get pending approvals based on role
        if user_profile.role == 'hod':
            # HOD sees submissions from their department
            submissions = ResultSubmission.objects.filter(
                course_assignment__course__department=user_profile.department
            ).select_related('course_assignment__course', 'submitted_by')
        else:  # exam_officer
            # Exam officer sees verified submissions pending approval
            submissions = ResultSubmission.objects.filter(
                course_assignment__course__department__faculty__university=user_profile.university
            ).select_related('course_assignment__course', 'submitted_by')

        data = []
        for submission in submissions:
            verification = ResultVerification.objects.filter(result_submission=submission).first()
            approval = ResultApproval.objects.filter(result_verification=verification).first() if verification else None

            status = 'submitted'
            if verification:
                status = 'verified'
            if approval:
                status = 'approved'

            data.append({
                'id': submission.id,
                'course_name': submission.course_assignment.course.name,
                'lecturer_name': f"{submission.submitted_by.first_name} {submission.submitted_by.last_name}",
                'status': status,
                'description': f"Results submitted for {submission.course_assignment.course.name}"
            })

        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def management_exam_officer_stats(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'exam_officer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        university = user_profile.university

        # Calculate stats
        submitted = ResultSubmission.objects.filter(course_assignment__course__department__faculty__university=university).count()
        verified = ResultVerification.objects.filter(result_submission__course_assignment__course__department__faculty__university=university).count()
        approved = ResultApproval.objects.filter(result_verification__result_submission__course_assignment__course__department__faculty__university=university).count()
        published = ResultPublication.objects.filter(result_approval__result_verification__result_submission__course_assignment__course__department__faculty__university=university).count()

        # For locked, assume approved but not published
        locked = approved - published

        return Response({
            'submitted': submitted,
            'pending': verified - approved,  # verified but not approved
            'approved': approved,
            'published': published,
            'locked': locked
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def management_result_corrections(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'exam_officer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # This would typically come from a ResultCorrection model
        # For now, return empty list as placeholder
        return Response([])
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def management_locked_published_results(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'exam_officer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        university = user_profile.university

        # Get published results
        publications = ResultPublication.objects.filter(
            result_approval__result_verification__result_submission__course_assignment__course__department__faculty__university=university
        ).select_related('result_approval__result_verification__result_submission__course_assignment__course')

        data = []
        for pub in publications:
            data.append({
                'id': pub.result_approval.result_verification.result_submission.id,
                'course_name': pub.result_approval.result_verification.result_submission.course_assignment.course.name,
                'lecturer_name': f"{pub.result_approval.result_verification.result_submission.submitted_by.first_name} {pub.result_approval.result_verification.result_submission.submitted_by.last_name}",
                'status': 'published',
                'published_date': pub.published_at
            })

        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def management_locked_results(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'exam_officer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        university = user_profile.university

        # Get approved but not published results
        approvals = ResultApproval.objects.filter(
            result_verification__result_submission__course_assignment__course__department__faculty__university=university,
            resultpublication__isnull=True
        ).select_related('result_verification__result_submission__course_assignment__course')

        data = []
        for approval in approvals:
            data.append({
                'id': approval.result_verification.result_submission.id,
                'course_name': approval.result_verification.result_submission.course_assignment.course.name,
                'lecturer_name': f"{approval.result_verification.result_submission.submitted_by.first_name} {approval.result_verification.result_submission.submitted_by.last_name}",
                'status': 'locked'
            })

        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def management_published_results(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'exam_officer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        university = user_profile.university

        publications = ResultPublication.objects.filter(
            result_approval__result_verification__result_submission__course_assignment__course__department__faculty__university=university
        ).select_related('result_approval__result_verification__result_submission__course_assignment__course')

        data = []
        for pub in publications:
            data.append({
                'id': pub.id,
                'course_name': pub.result_approval.result_verification.result_submission.course_assignment.course.name,
                'lecturer_name': f"{pub.result_approval.result_verification.result_submission.submitted_by.first_name} {pub.result_approval.result_verification.result_submission.submitted_by.last_name}",
                'published_date': pub.published_at,
                'status': 'published'
            })

        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def management_approved_results(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'exam_officer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        university = user_profile.university

        approvals = ResultApproval.objects.filter(
            result_verification__result_submission__course_assignment__course__department__faculty__university=university
        ).select_related('result_verification__result_submission__course_assignment__course')

        data = []
        for approval in approvals:
            data.append({
                'id': approval.result_verification.result_submission.id,
                'course_name': approval.result_verification.result_submission.course_assignment.course.name,
                'lecturer_name': f"{approval.result_verification.result_submission.submitted_by.first_name} {approval.result_verification.result_submission.submitted_by.last_name}",
                'status': 'approved'
            })

        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def management_grading_policies(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'exam_officer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        university = user_profile.university

        if request.method == 'GET':
            # Return default grading policies
            policies = [
                {'id': 1, 'grade': 'A', 'min_score': 80, 'max_score': 100, 'description': 'Excellent'},
                {'id': 2, 'grade': 'B', 'min_score': 70, 'max_score': 79, 'description': 'Good'},
                {'id': 3, 'grade': 'C', 'min_score': 60, 'max_score': 69, 'description': 'Satisfactory'},
                {'id': 4, 'grade': 'D', 'min_score': 50, 'max_score': 59, 'description': 'Pass'},
                {'id': 5, 'grade': 'F', 'min_score': 0, 'max_score': 49, 'description': 'Fail'}
            ]
            return Response(policies)

        elif request.method == 'POST':
            # In a real implementation, this would save to database
            return Response({'message': 'Grading policy created'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def management_publish_result(request, submission_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'exam_officer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        submission = ResultSubmission.objects.get(id=submission_id)
        if submission.course_assignment.course.department.faculty.university != user_profile.university:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Get the approval
        verification = ResultVerification.objects.filter(result_submission=submission).first()
        if not verification:
            return Response({'error': 'Submission not verified'}, status=status.HTTP_400_BAD_REQUEST)

        approval = ResultApproval.objects.filter(result_verification=verification).first()
        if not approval:
            return Response({'error': 'Submission not approved'}, status=status.HTTP_400_BAD_REQUEST)

        # Publish
        ResultPublication.objects.create(result_approval=approval, published_by=request.user)
        return Response({'message': 'Results published'})

    except ResultSubmission.DoesNotExist:
        return Response({'error': 'Submission not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def management_lock_result(request, submission_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'exam_officer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        submission = ResultSubmission.objects.get(id=submission_id)
        if submission.course_assignment.course.department.faculty.university != user_profile.university:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Get the approval
        verification = ResultVerification.objects.filter(result_submission=submission).first()
        if not verification:
            return Response({'error': 'Submission not verified'}, status=status.HTTP_400_BAD_REQUEST)

        approval = ResultApproval.objects.filter(result_verification=verification).first()
        if not approval:
            return Response({'error': 'Submission not approved'}, status=status.HTTP_400_BAD_REQUEST)

        # For locking, we just ensure it's approved but not published
        return Response({'message': 'Results locked'})

    except ResultSubmission.DoesNotExist:
        return Response({'error': 'Submission not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def management_reopen_result(request, submission_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'exam_officer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        submission = ResultSubmission.objects.get(id=submission_id)
        if submission.course_assignment.course.department.faculty.university != user_profile.university:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Delete publication to reopen
        verification = ResultVerification.objects.filter(result_submission=submission).first()
        if verification:
            approval = ResultApproval.objects.filter(result_verification=verification).first()
            if approval:
                ResultPublication.objects.filter(result_approval=approval).delete()

        return Response({'message': 'Results reopened'})

    except ResultSubmission.DoesNotExist:
        return Response({'error': 'Submission not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def management_final_approve(request, submission_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'exam_officer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        submission = ResultSubmission.objects.get(id=submission_id)
        if submission.course_assignment.course.department.faculty.university != user_profile.university:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Get verification
        verification = ResultVerification.objects.filter(result_submission=submission).first()
        if not verification:
            return Response({'error': 'Submission not verified'}, status=status.HTTP_400_BAD_REQUEST)

        # Create approval
        ResultApproval.objects.get_or_create(result_verification=verification, approved_by=request.user)
        return Response({'message': 'Results approved'})

    except ResultSubmission.DoesNotExist:
        return Response({'error': 'Submission not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def management_handle_correction(request, correction_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'exam_officer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Placeholder for correction handling
        action = request.data.get('action')
        return Response({'message': f'Correction {action}ed'})

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Notifications
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def notifications(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        if request.method == 'GET':
            notifications = Notification.objects.filter(
                Q(recipient_type='all') |
                Q(recipient_type='university', recipient_university=user_profile.university)
            ).order_by('-created_at')
            data = [{
                'id': notif.id,
                'title': notif.title,
                'message': notif.message,
                'recipient_type': notif.recipient_type,
                'created_at': notif.created_at
            } for notif in notifications]
            return Response(data)

        elif request.method == 'POST':
            data = request.data
            notification = Notification.objects.create(
                title=data['title'],
                message=data['message'],
                recipient_type=data.get('recipient_type', 'university'),
                recipient_university=user_profile.university if data.get('recipient_type') == 'university' else None,
                sent_by=request.user
            )
            return Response({
                'id': notification.id,
                'title': notification.title,
                'message': notification.message,
                'created_at': notification.created_at
            }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Activity Logs
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def activity_logs(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        activities = ActivityLog.objects.filter(university=user_profile.university).order_by('-timestamp')[:100]
        data = [{
            'id': activity.id,
            'timestamp': activity.timestamp,
            'user': activity.user.username if activity.user else 'System',
            'activity': activity.activity,
            'description': activity.description
        } for activity in activities]
        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Reports
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reports(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        university = user_profile.university
        report_type = request.query_params.get('type', 'enrollment')

        if report_type == 'enrollment':
            # Student enrollment report
            data = {
                'total_students': Student.objects.filter(university=university).count(),
                'active_students': Student.objects.filter(university=university, is_active=True).count(),
                'students_by_faculty': [
                    {
                        'faculty': faculty.name,
                        'count': Student.objects.filter(university=university, faculty=faculty).count()
                    } for faculty in Faculty.objects.filter(university=university)
                ]
            }
        elif report_type == 'course':
            # Course statistics
            data = {
                'total_courses': Course.objects.filter(department__faculty__university=university).count(),
                'courses_by_department': [
                    {
                        'department': dept.name,
                        'count': Course.objects.filter(department=dept).count()
                    } for dept in Department.objects.filter(faculty__university=university)
                ]
            }
        else:
            data = {'error': 'Invalid report type'}

        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Profile Settings
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_settings(request):
    try:
        if request.method == 'GET':
            serializer = UserSerializer(request.user)
            return Response(serializer.data)

        elif request.method == 'PUT':
            data = request.data
            user = request.user
            user.first_name = data.get('first_name', user.first_name)
            user.last_name = data.get('last_name', user.last_name)
            user.email = data.get('email', user.email)
            user.save()

            # Update profile if needed
            profile = UserProfile.objects.get(user=user)
            if 'phone' in data:
                # Assuming we add phone field to UserProfile
                pass

            return Response({'message': 'Profile updated successfully'})

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Change Password
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    try:
        data = request.data
        user = request.user

        if not user.check_password(data['current_password']):
            return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(data['new_password'])
        user.save()

        return Response({'message': 'Password changed successfully'})

    except KeyError:
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ============================================================================
# STUDENT ENDPOINTS
# ============================================================================

# Academic Calendar
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def academic_calendar(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        university = user_profile.university

        # Get current academic session and semesters
        current_session = AcademicSession.objects.filter(university=university, is_active=True).first()
        semesters = Semester.objects.filter(academic_session=current_session).order_by('start_date')

        data = {
            'current_session': {
                'name': current_session.name,
                'start_date': current_session.start_date,
                'end_date': current_session.end_date
            } if current_session else None,
            'semesters': [{
                'name': semester.name,
                'start_date': semester.start_date,
                'end_date': semester.end_date,
                'is_current': getattr(semester, 'is_current', False)
            } for semester in semesters]
        }
        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Course Information
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_courses(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        student = Student.objects.get(user=request.user)

        # Get registered courses
        registrations = CourseRegistration.objects.filter(student=student).select_related(
            'course_assignment__course', 'course_assignment__lecturer', 'course_assignment__semester'
        )

        data = [{
            'course_code': reg.course_assignment.course.code,
            'course_name': reg.course_assignment.course.name,
            'lecturer': f"{reg.course_assignment.lecturer.first_name} {reg.course_assignment.lecturer.last_name}",
            'semester': reg.course_assignment.semester.name,
            'credits': reg.course_assignment.course.credits,
            'registration_date': reg.registration_date
        } for reg in registrations]

        return Response(data)

    except Student.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Results
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_results(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        student = Student.objects.get(user=request.user)

        # Get results
        results = Result.objects.filter(course_registration__student=student).select_related(
            'course_registration__course_assignment__course',
            'course_registration__course_assignment__semester'
        )

        data = [{
            'course_code': result.course_registration.course_assignment.course.code,
            'course_name': result.course_registration.course_assignment.course.name,
            'semester': result.course_registration.course_assignment.semester.name,
            'score': result.score,
            'grade': result.grade
        } for result in results]

        return Response(data)

    except Student.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# GPA/CGPA
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_gpa(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        student = Student.objects.get(user=request.user)

        # Calculate GPA and CGPA
        results = Result.objects.filter(course_registration__student=student, grade__isnull=False)

        if not results:
            return Response({'gpa': 0, 'cgpa': 0, 'total_credits': 0})

        # Simple GPA calculation (assuming grade points: A=4, B=3, C=2, D=1, F=0)
        grade_points = {'A': 4, 'B': 3, 'C': 2, 'D': 1, 'F': 0}
        total_points = 0
        total_credits = 0

        for result in results:
            grade = result.grade.upper() if result.grade else 'F'
            points = grade_points.get(grade, 0)
            credits = result.course_registration.course_assignment.course.credits
            total_points += points * credits
            total_credits += credits

        gpa = total_points / total_credits if total_credits > 0 else 0

        data = {
            'gpa': round(gpa, 2),
            'cgpa': round(gpa, 2),  # For simplicity, same as GPA
            'total_credits': total_credits
        }
        return Response(data)

    except Student.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# GPA Calculator
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def gpa_calculator(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        courses = data.get('courses', [])

        grade_points = {'A': 4, 'B': 3, 'C': 2, 'D': 1, 'F': 0}
        total_points = 0
        total_credits = 0

        for course in courses:
            grade = course.get('grade', '').upper()
            credits = course.get('credits', 0)
            points = grade_points.get(grade, 0)
            total_points += points * credits
            total_credits += credits

        gpa = total_points / total_credits if total_credits > 0 else 0

        return Response({
            'calculated_gpa': round(gpa, 2),
            'total_credits': total_credits
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Academic Progress
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def academic_progress(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        student = Student.objects.get(user=request.user)

        # Get all course registrations and results
        registrations = CourseRegistration.objects.filter(student=student).select_related(
            'course_assignment__course', 'course_assignment__semester'
        )

        completed_courses = []
        in_progress_courses = []

        for reg in registrations:
            result = Result.objects.filter(course_registration=reg).first()
            course_data = {
                'course_code': reg.course_assignment.course.code,
                'course_name': reg.course_assignment.course.name,
                'credits': reg.course_assignment.course.credits,
                'semester': reg.course_assignment.semester.name
            }

            if result and result.grade:
                course_data['grade'] = result.grade
                course_data['score'] = result.score
                completed_courses.append(course_data)
            else:
                in_progress_courses.append(course_data)

        data = {
            'completed_courses': completed_courses,
            'in_progress_courses': in_progress_courses,
            'total_completed_credits': sum(course['credits'] for course in completed_courses),
            'total_registered_credits': sum(course['credits'] for course in (completed_courses + in_progress_courses))
        }
        return Response(data)

    except Student.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Auth-level Notifications
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auth_notifications(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        notifications = Notification.objects.filter(
            Q(recipient_type='all') |
            Q(recipient_type='university', recipient_university=user_profile.university)
        ).order_by('-created_at')[:20]

        data = [{
            'id': notif.id,
            'title': notif.title,
            'message': notif.message,
            'created_at': notif.created_at,
            'is_read': notif.is_read
        } for notif in notifications]

        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Auth-level Academic Progress
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auth_academic_progress(request):
    # Alias for /student/academic-progress/ to support frontend routes
    return academic_progress(request)

# User detail (self) endpoint
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_detail(request, user_id):
    try:
        if request.user.id != user_id:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        user = User.objects.get(id=user_id)

        if request.method == 'GET':
            return Response(UserSerializer(user).data)

        data = request.data
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            user.email = data['email']
        user.save()

        # Update profile fields if present
        try:
            profile = UserProfile.objects.get(user=user)
            if 'phone' in data:
                profile.phone = data['phone'] if hasattr(profile, 'phone') else None
                profile.save()
        except UserProfile.DoesNotExist:
            pass

        return Response(UserSerializer(user).data)

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Student endpoints using user ID in URL (frontend compatibility)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_results_by_user(request, user_id):
    if request.user.id != user_id:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    return student_results(request)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_gpa_by_user(request, user_id):
    if request.user.id != user_id:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    return student_gpa(request)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_history_by_user(request, user_id):
    if request.user.id != user_id:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    return student_history(request)

# Dashboard helpers
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_student_enrollment_chart(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        university = user_profile.university
        year_counts = (
            Student.objects.filter(university=university)
            .annotate(year=ExtractYear('enrollment_date'))
            .values('year')
            .annotate(count=Count('id'))
            .order_by('year')
        )

        data = [{'year': item['year'], 'count': item['count']} for item in year_counts]
        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_pending_approvals(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        pending = ResultVerification.objects.filter(
            result_submission__course_assignment__course__department__faculty__university=user_profile.university,
            resultapproval__isnull=True
        ).select_related('result_submission__course_assignment__course')

        data = [{
            'id': v.result_submission.id,
            'course': v.result_submission.course_assignment.course.name,
            'department': v.result_submission.course_assignment.course.department.name,
            'verified_at': v.verified_at
        } for v in pending]

        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_department_overview(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        university = user_profile.university
        departments = Department.objects.filter(faculty__university=university)

        data = []
        for dept in departments:
            students_count = Student.objects.filter(department=dept).count()
            lecturers_count = Lecturer.objects.filter(department=dept).count()
            courses_count = Course.objects.filter(department=dept).count()
            data.append({
                'id': dept.id,
                'name': dept.name,
                'students': students_count,
                'lecturers': lecturers_count,
                'courses': courses_count
            })

        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_upcoming_events(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'university_admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        today = datetime.date.today()
        upcoming_semesters = Semester.objects.filter(
            academic_session__university=user_profile.university,
            start_date__gte=today
        ).order_by('start_date')[:5]

        data = [{
            'id': sem.id,
            'title': f"Semester {sem.name} starts",
            'date': sem.start_date,
            'type': 'semester_start'
        } for sem in upcoming_semesters]

        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Dean Results Review
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dean_results_review(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'dean':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        faculty = user_profile.faculty
        verifications = ResultVerification.objects.filter(
            result_submission__course_assignment__course__department__faculty=faculty,
            resultapproval__isnull=True
        ).select_related('result_submission__course_assignment__course', 'result_submission__submitted_by')

        data = [{
            'id': v.result_submission.id,
            'course': v.result_submission.course_assignment.course.name,
            'department': v.result_submission.course_assignment.course.department.name,
            'lecturer': f"{v.result_submission.submitted_by.first_name} {v.result_submission.submitted_by.last_name}",
            'verified_at': v.verified_at
        } for v in verifications]

        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dean_reports(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'dean':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        faculty = user_profile.faculty

        # Faculty overview
        faculty_overview = {
            'departments': Department.objects.filter(faculty=faculty).count(),
            'courses': Course.objects.filter(department__faculty=faculty).count(),
            'lecturers': Lecturer.objects.filter(faculty=faculty).count(),
            'students': Student.objects.filter(faculty=faculty).count(),
        }

        # Result statistics
        all_results = Result.objects.filter(course_registration__course_assignment__course__department__faculty=faculty)
        result_stats = {
            'total_results': all_results.count(),
            'grade_distribution': {
                'A': all_results.filter(grade='A').count(),
                'B': all_results.filter(grade='B').count(),
                'C': all_results.filter(grade='C').count(),
                'D': all_results.filter(grade='D').count(),
                'F': all_results.filter(grade='F').count(),
            }
        }

        # Submission statistics
        submission_stats = {
            'total_submissions': ResultSubmission.objects.filter(course_assignment__course__department__faculty=faculty).count(),
            'verified_submissions': ResultVerification.objects.filter(result_submission__course_assignment__course__department__faculty=faculty).count(),
            'approved_submissions': ResultApproval.objects.filter(result_submission__course_assignment__course__department__faculty=faculty).count(),
        }

        return Response({
            'faculty_overview': faculty_overview,
            'result_stats': result_stats,
            'submission_stats': submission_stats
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# HOD verify results
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_results(request, submission_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'hod':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        submission = ResultSubmission.objects.get(id=submission_id)
        if submission.course_assignment.course.department != user_profile.department:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Create verification
        ResultVerification.objects.get_or_create(result_submission=submission, verified_by=request.user)
        return Response({'message': 'Results verified'})

    except ResultSubmission.DoesNotExist:
        return Response({'error': 'Submission not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Review Results
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def review_results(request, approval_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'dean':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        approval = ResultApproval.objects.get(id=approval_id)
        # Verify the approval belongs to faculty
        if approval.result_submission.course_assignment.course.department.faculty != user_profile.faculty:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        if request.method == 'GET':
            results = Result.objects.filter(course_registration__course_assignment=approval.result_submission.course_assignment)
            data = {
                'course': approval.result_submission.course_assignment.course.name,
                'department': approval.result_submission.course_assignment.course.department.name,
                'results': [{
                    'student': f"{result.course_registration.student.first_name} {result.course_registration.student.last_name}",
                    'score': result.score,
                    'grade': result.grade
                } for result in results]
            }
            return Response(data)

        elif request.method == 'POST':
            data = request.data
            action = data.get('action')

            if action == 'approve':
                # Final approval - results can be published
                return Response({'message': 'Results approved for publication'})
            elif action == 'return':
                # Return for correction
                approval.delete()
                return Response({'message': 'Results returned for correction'})

    except ResultApproval.DoesNotExist:
        return Response({'error': 'Approval not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'dean':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        faculty = user_profile.faculty

        # Faculty overview
        faculty_overview = {
            'departments': Department.objects.filter(faculty=faculty).count(),
            'courses': Course.objects.filter(department__faculty=faculty).count(),
            'lecturers': Lecturer.objects.filter(faculty=faculty).count(),
            'students': Student.objects.filter(faculty=faculty).count(),
        }

        # Result statistics
        all_results = Result.objects.filter(course_registration__course_assignment__course__department__faculty=faculty)
        total_results = all_results.count()
        passed_results = all_results.exclude(grade__in=[None, '', 'F']).count()
        pass_rate = round((passed_results / total_results) * 100, 2) if total_results > 0 else 0

        result_statistics = {
            'total_results': total_results,
            'passed_results': passed_results,
            'pass_rate': pass_rate,
        }

        # Submission statistics
        total_submissions = ResultSubmission.objects.filter(course_assignment__course__department__faculty=faculty).count()
        verified_submissions = ResultVerification.objects.filter(result_submission__course_assignment__course__department__faculty=faculty).count()
        approved_submissions = ResultApproval.objects.filter(result_verification__result_submission__course_assignment__course__department__faculty=faculty).count()

        submission_statistics = {
            'total_submissions': total_submissions,
            'verified_submissions': verified_submissions,
            'approved_submissions': approved_submissions,
        }

        # Department performance
        department_performance = []
        for dept in Department.objects.filter(faculty=faculty):
            dept_results = all_results.filter(course_registration__course_assignment__course__department=dept)
            dept_total = dept_results.count()
            dept_passed = dept_results.exclude(grade__in=[None, '', 'F']).count()
            dept_pass_rate = round((dept_passed / dept_total) * 100, 2) if dept_total > 0 else 0

            department_performance.append({
                'name': dept.name,
                'students': Student.objects.filter(department=dept).count(),
                'courses': Course.objects.filter(department=dept).count(),
                'results': dept_total,
                'pass_rate': dept_pass_rate,
            })

        return Response({
            'faculty_overview': faculty_overview,
            'result_statistics': result_statistics,
            'submission_statistics': submission_statistics,
            'department_performance': department_performance,
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Dean overview alias
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dean_overview(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'dean':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        faculty = user_profile.faculty
        if not faculty:
            # Dean account created without a faculty assigned (optional during creation)
            # Return a safe empty overview to avoid breaking the dashboard.
            return Response({
                'faculty': None,
                'stats': {
                    'departments': 0,
                    'courses': 0,
                    'lecturers': 0,
                    'students': 0,
                    'pending_submissions': 0,
                    'pending_approvals': 0,
                },
                'message': 'No faculty assigned. Please set a faculty for this dean account.'
            })

        stats = {
            'departments': Department.objects.filter(faculty=faculty).count(),
            'courses': Course.objects.filter(department__faculty=faculty).count(),
            'lecturers': Lecturer.objects.filter(faculty=faculty).count(),
            'students': Student.objects.filter(faculty=faculty).count(),
            'pending_submissions': ResultSubmission.objects.filter(course_assignment__course__department__faculty=faculty).count(),
            'pending_approvals': ResultVerification.objects.filter(
                result_submission__course_assignment__course__department__faculty=faculty,
                resultapproval__isnull=True
            ).count()
        }

        return Response({
            'faculty': {'name': faculty.name},
            'stats': stats
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def dean_results_approve(request, submission_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'dean':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        submission = ResultSubmission.objects.get(id=submission_id)
        # Ensure within faculty
        if submission.course_assignment.course.department.faculty != user_profile.faculty:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Ensure verification exists
        verification = ResultVerification.objects.filter(result_submission=submission).first()
        if not verification:
            return Response({'error': 'Submission not verified yet'}, status=status.HTTP_400_BAD_REQUEST)

        # Approve
        if ResultApproval.objects.filter(result_verification=verification).exists():
            return Response({'error': 'Already approved'}, status=status.HTTP_400_BAD_REQUEST)

        ResultApproval.objects.create(result_verification=verification, approved_by=request.user)
        return Response({'message': 'Results approved'})

    except ResultSubmission.DoesNotExist:
        return Response({'error': 'Submission not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def dean_results_return(request, submission_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'dean':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        submission = ResultSubmission.objects.get(id=submission_id)
        if submission.course_assignment.course.department.faculty != user_profile.faculty:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Delete submission to send back
        submission.delete()

        return Response({'message': 'Submission returned for correction'})

    except ResultSubmission.DoesNotExist:
        return Response({'error': 'Submission not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Dean Lecturer Activities (alias for recent activities)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dean_lecturer_activities(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'dean':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        faculty = user_profile.faculty

        # Get verified submissions pending dean approval
        verifications = ResultVerification.objects.filter(
            result_submission__course_assignment__course__department__faculty=faculty,
            resultapproval__isnull=True
        ).select_related('result_submission__course_assignment__course', 'result_submission__submitted_by')

        data = []
        for verification in verifications:
            data.append({
                'id': verification.result_submission.id,
                'course': verification.result_submission.course_assignment.course.name,
                'department': verification.result_submission.course_assignment.course.department.name,
                'lecturer': f"{verification.result_submission.submitted_by.first_name} {verification.result_submission.submitted_by.last_name}",
                'verified_at': verification.verified_at
            })

        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Results API
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'dean':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        faculty = user_profile.faculty

        # Faculty overview
        faculty_overview = {
            'departments': Department.objects.filter(faculty=faculty).count(),
            'courses': Course.objects.filter(department__faculty=faculty).count(),
            'lecturers': Lecturer.objects.filter(faculty=faculty).count(),
            'students': Student.objects.filter(faculty=faculty).count(),
        }

        # Result statistics
        all_results = Result.objects.filter(course_registration__course_assignment__course__department__faculty=faculty)
        total_results = all_results.count()
        passed_results = all_results.exclude(grade__in=[None, '', 'F']).count()
        pass_rate = round((passed_results / total_results) * 100, 2) if total_results > 0 else 0

        result_statistics = {
            'total_results': total_results,
            'passed_results': passed_results,
            'pass_rate': pass_rate,
        }

        # Submission statistics
        total_submissions = ResultSubmission.objects.filter(course_assignment__course__department__faculty=faculty).count()
        verified_submissions = ResultVerification.objects.filter(result_submission__course_assignment__course__department__faculty=faculty).count()
        approved_submissions = ResultApproval.objects.filter(result_verification__result_submission__course_assignment__course__department__faculty=faculty).count()

        submission_statistics = {
            'total_submissions': total_submissions,
            'verified_submissions': verified_submissions,
            'approved_submissions': approved_submissions,
        }

        # Department performance
        department_performance = []
        for dept in Department.objects.filter(faculty=faculty):
            dept_results = all_results.filter(course_registration__course_assignment__course__department=dept)
            dept_total = dept_results.count()
            dept_passed = dept_results.exclude(grade__in=[None, '', 'F']).count()
            dept_pass_rate = round((dept_passed / dept_total) * 100, 2) if dept_total > 0 else 0

            department_performance.append({
                'name': dept.name,
                'students': Student.objects.filter(department=dept).count(),
                'courses': Course.objects.filter(department=dept).count(),
                'results': dept_total,
                'pass_rate': dept_pass_rate,
            })

        return Response({
            'faculty_overview': faculty_overview,
            'result_statistics': result_statistics,
            'submission_statistics': submission_statistics,
            'department_performance': department_performance,
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Results API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def results_list(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        role = user_profile.role

        # Determine scope based on role
        if role == 'student':
            student = Student.objects.get(user=request.user)
            results = Result.objects.filter(course_registration__student=student)
        elif role == 'lecturer':
            lecturer = Lecturer.objects.get(user=request.user)
            results = Result.objects.filter(course_registration__course_assignment__lecturer=lecturer)
        elif role == 'hod':
            department = user_profile.department
            results = Result.objects.filter(course_registration__course_assignment__course__department=department)
        elif role == 'exam_officer':
            university = user_profile.university
            results = Result.objects.filter(course_registration__course_assignment__course__department__faculty__university=university)
        elif role == 'dean':
            faculty = user_profile.faculty
            results = Result.objects.filter(course_registration__course_assignment__course__department__faculty=faculty)
        elif role == 'university_admin':
            university = user_profile.university
            results = Result.objects.filter(course_registration__course_assignment__course__department__faculty__university=university)
        else:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        data = []
        for r in results.select_related('course_registration__student__user', 'course_registration__course_assignment__course', 'course_registration__course_assignment__lecturer'):
            # Determine status
            submission = ResultSubmission.objects.filter(course_assignment=r.course_registration.course_assignment).first()
            verification = ResultVerification.objects.filter(result_submission=submission).first() if submission else None
            approval = ResultApproval.objects.filter(result_verification=verification).first() if verification else None

            if not submission:
                status_label = 'not_submitted'
            elif submission and not verification:
                status_label = 'submitted'
            elif verification and not approval:
                status_label = 'verified'
            else:
                status_label = 'approved'

            data.append({
                'id': r.id,
                'course_code': r.course_registration.course_assignment.course.code,
                'course_name': r.course_registration.course_assignment.course.name,
                'student': f"{r.course_registration.student.first_name} {r.course_registration.student.last_name}",
                'score': r.score,
                'grade': r.grade,
                'status': status_label,
                'submitted_at': submission.submitted_at if submission else None,
                'verified_at': verification.verified_at if verification else None
            })

        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def result_verify(request, result_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role not in ['hod', 'exam_officer', 'dean']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        result = Result.objects.get(id=result_id)
        submission = ResultSubmission.objects.filter(course_assignment=result.course_registration.course_assignment).first()
        if not submission:
            return Response({'error': 'Result has not been submitted'}, status=status.HTTP_400_BAD_REQUEST)

        verification, created = ResultVerification.objects.get_or_create(result_submission=submission, defaults={'verified_by': request.user})
        if not created:
            return Response({'error': 'Already verified'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Result verified successfully'})

    except Result.DoesNotExist:
        return Response({'error': 'Result not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def result_update_status(request, result_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role not in ['hod', 'exam_officer', 'dean']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        result = Result.objects.get(id=result_id)
        status_value = request.data.get('status')
        if status_value == 'rejected':
            # Remove submission to send back to lecturer
            submission = ResultSubmission.objects.filter(course_assignment=result.course_registration.course_assignment).first()
            if submission:
                submission.delete()
            return Response({'message': 'Result rejected'});

        return Response({'error': 'Unsupported status action'}, status=status.HTTP_400_BAD_REQUEST)

    except Result.DoesNotExist:
        return Response({'error': 'Result not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Course Scores (for lecturer update)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_scores(request, course_assignment_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        assignment = CourseAssignment.objects.get(id=course_assignment_id)
        if user_profile.role == 'lecturer':
            lecturer = Lecturer.objects.get(user=request.user)
            if assignment.lecturer != lecturer:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        results = Result.objects.filter(course_registration__course_assignment=assignment).select_related('course_registration__student')
        data = [{
            'id': r.id,
            'student_id': r.course_registration.student.student_id,
            'student_name': f"{r.course_registration.student.first_name} {r.course_registration.student.last_name}",
            'score': r.score,
            'grade': r.grade
        } for r in results]
        return Response(data)

    except CourseAssignment.DoesNotExist:
        return Response({'error': 'Course assignment not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def score_update(request, score_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        result = Result.objects.get(id=score_id)
        assignment = result.course_registration.course_assignment

        if user_profile.role == 'lecturer':
            lecturer = Lecturer.objects.get(user=request.user)
            if assignment.lecturer != lecturer:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        if 'score' in data:
            result.score = data['score']
        if 'grade' in data:
            result.grade = data['grade']
        result.save()
        return Response({'message': 'Score updated successfully'})

    except Result.DoesNotExist:
        return Response({'error': 'Score not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Department endpoints for HOD / Admin reports
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_students(request, department_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role not in ['university_admin', 'hod']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        if user_profile.role == 'hod' and user_profile.department.id != department_id:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        students = Student.objects.filter(department__id=department_id)
        data = [{
            'id': s.id,
            'student_id': s.student_id,
            'first_name': s.first_name,
            'last_name': s.last_name,
            'email': s.email
        } for s in students]
        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_lecturers(request, department_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role not in ['university_admin', 'hod']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        if user_profile.role == 'hod' and user_profile.department.id != department_id:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        lecturers = Lecturer.objects.filter(department__id=department_id)
        data = [{
            'id': l.id,
            'employee_id': l.employee_id,
            'first_name': l.first_name,
            'last_name': l.last_name,
            'email': l.email
        } for l in lecturers]
        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_courses(request, department_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role not in ['university_admin', 'hod']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        if user_profile.role == 'hod' and user_profile.department.id != department_id:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        courses = Course.objects.filter(department__id=department_id)
        data = [{
            'id': c.id,
            'code': c.code,
            'name': c.name,
            'credits': c.credits
        } for c in courses]
        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_enrollment(request, course_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        course = Course.objects.get(id=course_id)

        # Restrict to university admin or related users
        if user_profile.role == 'hod' and course.department != user_profile.department:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        if user_profile.role == 'lecturer':
            # Lecturers should only view their own courses
            lecturer = Lecturer.objects.get(user=request.user)
            if not CourseAssignment.objects.filter(course=course, lecturer=lecturer).exists():
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        enrollment_count = CourseRegistration.objects.filter(course_assignment__course=course).count()
        return Response({'course_id': course.id, 'enrollment_count': enrollment_count})

    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ============================================================================
# GRADUATION TRACK
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def graduation_track(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        student = Student.objects.get(user=request.user)

        # Get program requirements
        program = student.program
        required_credits = program.duration_years * 30  # Assuming 30 credits per year

        # Calculate completed credits
        results = Result.objects.filter(
            course_registration__student=student,
            grade__in=['A', 'B', 'C', 'D']  # Passing grades
        ).select_related('course_registration__course_assignment__course')

        completed_credits = sum(
            result.course_registration.course_assignment.course.credits
            for result in results
        )

        data = {
            'program': program.name,
            'required_credits': required_credits,
            'completed_credits': completed_credits,
            'remaining_credits': max(0, required_credits - completed_credits),
            'progress_percentage': min(100, (completed_credits / required_credits) * 100 if required_credits > 0 else 0),
            'can_graduate': completed_credits >= required_credits
        }
        return Response(data)

    except Student.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Transcript Request
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_transcript(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Create transcript request (this would typically create a record in a TranscriptRequest model)
        # For now, just return success
        return Response({'message': 'Transcript request submitted successfully'})

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Download Documents
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_documents(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # This would typically return a list of available documents
        # For now, return mock data
        documents = [
            {'name': 'Registration Form', 'type': 'pdf', 'url': '/documents/registration.pdf'},
            {'name': 'Academic Calendar', 'type': 'pdf', 'url': '/documents/calendar.pdf'},
            {'name': 'Student Handbook', 'type': 'pdf', 'url': '/documents/handbook.pdf'}
        ]
        return Response(documents)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Student Notifications
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_notifications(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        notifications = Notification.objects.filter(
            Q(recipient_type='all') |
            Q(recipient_type='university', recipient_university=user_profile.university)
        ).order_by('-created_at')[:20]

        data = [{
            'id': notif.id,
            'title': notif.title,
            'message': notif.message,
            'created_at': notif.created_at,
            'is_read': notif.is_read
        } for notif in notifications]

        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Student History
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_history(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        student = Student.objects.get(user=request.user)

        # Get academic history
        results = Result.objects.filter(course_registration__student=student).select_related(
            'course_registration__course_assignment__course',
            'course_registration__course_assignment__semester'
        ).order_by('course_registration__course_assignment__semester__start_date')

        history = [{
            'semester': result.course_registration.course_assignment.semester.name,
            'course_code': result.course_registration.course_assignment.course.code,
            'course_name': result.course_registration.course_assignment.course.name,
            'grade': result.grade,
            'score': result.score,
            'credits': result.course_registration.course_assignment.course.credits
        } for result in results]

        return Response(history)

    except Student.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Help Support
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def help_support(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data

        # Create support ticket
        ticket = SupportTicket.objects.create(
            university=user_profile.university,
            title=data['title'],
            description=data['description'],
            priority=data.get('priority', 'medium'),
            created_by=request.user
        )

        return Response({
            'id': ticket.id,
            'message': 'Support request submitted successfully'
        }, status=status.HTTP_201_CREATED)

    except KeyError:
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ============================================================================
# LECTURER ENDPOINTS
# ============================================================================

# Assigned Courses
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lecturer_assigned_courses(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'lecturer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        lecturer = Lecturer.objects.get(user=request.user)

        # Get assigned courses
        assignments = CourseAssignment.objects.filter(lecturer=lecturer).select_related('course', 'semester')

        data = [{
            'id': assignment.id,
            'course_code': assignment.course.code,
            'course_name': assignment.course.name,
            'semester': assignment.semester.name,
            'credits': assignment.course.credits
        } for assignment in assignments]

        return Response(data)

    except Lecturer.DoesNotExist:
        return Response({'error': 'Lecturer profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Course Students
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_students(request, course_assignment_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'lecturer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        lecturer = Lecturer.objects.get(user=request.user)

        # Verify the course is assigned to this lecturer
        assignment = CourseAssignment.objects.get(id=course_assignment_id, lecturer=lecturer)

        # Get registered students
        registrations = CourseRegistration.objects.filter(course_assignment=assignment).select_related('student')

        data = [{
            'student_id': reg.student.student_id,
            'first_name': reg.student.first_name,
            'last_name': reg.student.last_name,
            'email': reg.student.email
        } for reg in registrations]

        return Response(data)

    except CourseAssignment.DoesNotExist:
        return Response({'error': 'Course assignment not found'}, status=status.HTTP_404_NOT_FOUND)
    except Lecturer.DoesNotExist:
        return Response({'error': 'Lecturer profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Upload Scores
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_scores(request, course_assignment_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'lecturer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        lecturer = Lecturer.objects.get(user=request.user)

        # Verify the course is assigned to this lecturer
        assignment = CourseAssignment.objects.get(id=course_assignment_id, lecturer=lecturer)

        if 'file' not in request.FILES:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        csv_file = request.FILES['file']
        if not csv_file.name.endswith('.csv'):
            return Response({'error': 'File must be a CSV'}, status=status.HTTP_400_BAD_REQUEST)

        # Read CSV file
        file_data = csv_file.read().decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(file_data))

        updated_count = 0
        errors = []

        with transaction.atomic():
            for row_num, row in enumerate(csv_reader, start=2):
                try:
                    student_id = row.get('student_id')
                    score = row.get('score')

                    if not student_id or score is None:
                        errors.append(f"Row {row_num}: Missing student_id or score")
                        continue

                    # Find the student registration
                    registration = CourseRegistration.objects.get(
                        course_assignment=assignment,
                        student__student_id=student_id
                    )

                    # Update or create result
                    result, created = Result.objects.get_or_create(
                        course_registration=registration,
                        defaults={'score': float(score)}
                    )
                    if not created:
                        result.score = float(score)
                        result.save()

                    updated_count += 1

                except CourseRegistration.DoesNotExist:
                    errors.append(f"Row {row_num}: Student {student_id} not registered for this course")
                except Exception as e:
                    errors.append(f"Row {row_num}: {str(e)}")

        return Response({
            'message': f'Successfully uploaded scores for {updated_count} students',
            'errors': errors
        }, status=status.HTTP_200_OK)

    except CourseAssignment.DoesNotExist:
        return Response({'error': 'Course assignment not found'}, status=status.HTTP_404_NOT_FOUND)
    except Lecturer.DoesNotExist:
        return Response({'error': 'Lecturer profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Calculate Grades
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_grades(request, course_assignment_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'lecturer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        lecturer = Lecturer.objects.get(user=request.user)

        # Verify the course is assigned to this lecturer
        assignment = CourseAssignment.objects.get(id=course_assignment_id, lecturer=lecturer)

        # Get all results for this course
        results = Result.objects.filter(course_registration__course_assignment=assignment)

        # Simple grading logic
        for result in results:
            if result.score >= 80:
                result.grade = 'A'
            elif result.score >= 70:
                result.grade = 'B'
            elif result.score >= 60:
                result.grade = 'C'
            elif result.score >= 50:
                result.grade = 'D'
            else:
                result.grade = 'F'
            result.save()

        return Response({'message': f'Grades calculated for {results.count()} students'})

    except CourseAssignment.DoesNotExist:
        return Response({'error': 'Course assignment not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Submit Results
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_results(request, course_assignment_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'lecturer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        lecturer = Lecturer.objects.get(user=request.user)

        # Verify the course is assigned to this lecturer
        assignment = CourseAssignment.objects.get(id=course_assignment_id, lecturer=lecturer)

        # Create result submission record
        submission, created = ResultSubmission.objects.get_or_create(
            course_assignment=assignment,
            defaults={'submitted_by': lecturer}
        )

        if not created:
            return Response({'error': 'Results already submitted'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Results submitted successfully'})

    except CourseAssignment.DoesNotExist:
        return Response({'error': 'Course assignment not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Lecturer Notifications
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lecturer_notifications(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'lecturer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        notifications = Notification.objects.filter(
            Q(recipient_type='all') |
            Q(recipient_type='university', recipient_university=user_profile.university)
        ).order_by('-created_at')[:20]

        data = [{
            'id': notif.id,
            'title': notif.title,
            'message': notif.message,
            'created_at': notif.created_at,
            'is_read': notif.is_read
        } for notif in notifications]

        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

def hod_notifications(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'hod':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        notifications = Notification.objects.filter(
            Q(recipient_type='all') |
            Q(recipient_type='university', recipient_university=user_profile.university)
        ).order_by('-created_at')[:20]

        data = [{
            'id': notif.id,
            'title': notif.title,
            'message': notif.message,
            'created_at': notif.created_at,
            'is_read': notif.is_read
        } for notif in notifications]

        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ============================================================================
# HOD ENDPOINTS
# ============================================================================

# Assign Courses
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def assign_courses(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'hod':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        department = user_profile.department

        if request.method == 'GET':
            # Get available lecturers in the department
            lecturers = Lecturer.objects.filter(department=department).select_related('user')
            lecturer_data = [{
                'id': lecturer.id,
                'name': f"{lecturer.first_name} {lecturer.last_name}",'employee_id': lecturer.employee_id
            } for lecturer in lecturers]

            # Get available courses in the department
            courses = Course.objects.filter(department=department)
            course_data = [{
                'id': course.id,
                'code': course.code,
                'name': course.name,
                'credits': course.credits
            } for course in courses]

            # Get current semester
            current_semester = Semester.objects.filter(
                academic_session__university=user_profile.university,
                is_current=True
            ).first()

            data = {
                'lecturers': lecturer_data,
                'courses': course_data,
                'current_semester': current_semester.name if current_semester else None
            }
            return Response(data)

        elif request.method == 'POST':
            data = request.data
            lecturer = Lecturer.objects.get(id=data['lecturer_id'], department=department)
            course = Course.objects.get(id=data['course_id'], department=department)
            semester = Semester.objects.get(id=data['semester_id'], academic_session__university=user_profile.university)

            # Create course assignment
            assignment, created = CourseAssignment.objects.get_or_create(
                course=course,
                semester=semester,
                defaults={'lecturer': lecturer}
            )

            if not created:
                assignment.lecturer = lecturer
                assignment.save()

            return Response({'message': 'Course assigned successfully'})

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Department Statistics
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_statistics(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'hod':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        department = user_profile.department

        # Calculate statistics
        lecturers_count = Lecturer.objects.filter(department=department).count()
        students_count = Student.objects.filter(department=department).count()
        courses_count = Course.objects.filter(department=department).count()
        programs_count = Program.objects.filter(department=department).count()

        data = {
            'lecturers_count': lecturers_count,
            'students_count': students_count,
            'courses_count': courses_count,
            'programs_count': programs_count
        }
        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Monitor Submission
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monitor_submission(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'hod':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        department = user_profile.department

        # Get submission status for department courses
        assignments = CourseAssignment.objects.filter(
            course__department=department
        ).select_related('course', 'lecturer', 'semester')

        submission_data = []
        for assignment in assignments:
            submitted = ResultSubmission.objects.filter(course_assignment=assignment).exists()
            submission_data.append({
                'course_code': assignment.course.code,
                'course_name': assignment.course.name,
                'lecturer': f"{assignment.lecturer.first_name} {assignment.lecturer.last_name}",'submitted': submitted
            })

        return Response(submission_data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ============================================================================
# EXAM OFFICER ENDPOINTS
# ============================================================================

# Verify Results
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def exam_officer_verify_results(request, submission_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'exam_officer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        submission = ResultSubmission.objects.get(id=submission_id)
        # Verify the submission belongs to university
        if submission.course_assignment.course.department.faculty.university != user_profile.university:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        if request.method == 'GET':
            # Return submission details
            results = Result.objects.filter(course_registration__course_assignment=submission.course_assignment)
            data = {
                'course': submission.course_assignment.course.name,
                'department': submission.course_assignment.course.department.name,
                'lecturer': f"{submission.submitted_by.first_name} {submission.submitted_by.last_name}",'results': [{
                    'student': f"{result.course_registration.student.first_name} {result.course_registration.student.last_name}",'score': result.score,
                    'grade': result.grade
                } for result in results]
            }
            return Response(data)

        elif request.method == 'POST':
            data = request.data
            action = data.get('action')

            if action == 'approve':
                # Create approval record
                ResultApproval.objects.create(
                    result_submission=submission,
                    approved_by=request.user
                )
                return Response({'message': 'Results approved'})
            elif action == 'return':
                # Return for correction
                submission.delete()
                return Response({'message': 'Results returned for correction'})

    except ResultSubmission.DoesNotExist:
        return Response({'error': 'Submission not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Pending Approvals
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_approvals(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'exam_officer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Get verified submissions pending approval
        verifications = ResultVerification.objects.filter(
            result_submission__course_assignment__course__department__faculty__university=user_profile.university
        ).select_related('result_submission__course_assignment__course')

        data = [{
            'id': verification.result_submission.id,
            'course': verification.result_submission.course_assignment.course.name,
            'department': verification.result_submission.course_assignment.course.department.name,
            'verified_at': verification.verified_at
        } for verification in verifications]

        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
# ============================================================================
# DEAN ENDPOINTS
# ============================================================================

# Departments
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dean_departments(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'dean':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        faculty = user_profile.faculty

        departments = Department.objects.filter(faculty=faculty).select_related('head')
        data = [{
            'id': dept.id,
            'name': dept.name,
            'code': dept.code,
            'head': f"{dept.head.first_name} {dept.head.last_name}" if dept.head else None,
            'description': dept.description
        } for dept in departments]

        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Course Assignments
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_assignments(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'dean':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        faculty = user_profile.faculty

        assignments = CourseAssignment.objects.filter(
            course__department__faculty=faculty
        ).select_related('course', 'lecturer', 'semester')

        data = [{
            'id': assignment.id,
            'course_code': assignment.course.code,
            'course_name': assignment.course.name,
            'lecturer': f"{assignment.lecturer.first_name} {assignment.lecturer.last_name}",
            'semester': assignment.semester.name
        } for assignment in assignments]

        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Review Results
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def review_results(request, approval_id):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'dean':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        approval = ResultApproval.objects.get(id=approval_id)
        # Verify the approval belongs to faculty
        if approval.result_submission.course_assignment.course.department.faculty != user_profile.faculty:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        if request.method == 'GET':
            results = Result.objects.filter(course_registration__course_assignment=approval.result_submission.course_assignment)
            data = {
                'course': approval.result_submission.course_assignment.course.name,
                'department': approval.result_submission.course_assignment.course.department.name,
                'results': [{
                    'student': f"{result.course_registration.student.first_name} {result.course_registration.student.last_name}",
                    'score': result.score,
                    'grade': result.grade
                } for result in results]
            }
            return Response(data)

        elif request.method == 'POST':
            data = request.data
            action = data.get('action')

            if action == 'approve':
                # Final approval - results can be published
                return Response({'message': 'Results approved for publication'})
            elif action == 'return':
                # Return for correction
                approval.delete()
                return Response({'message': 'Results returned for correction'})

    except ResultApproval.DoesNotExist:
        return Response({'error': 'Approval not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
