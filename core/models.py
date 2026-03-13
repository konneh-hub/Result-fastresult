from django.db import models
from django.contrib.auth.models import AbstractUser

# Custom User Model
class User(AbstractUser):
    class Meta:
        db_table = 'users'

# Platform Management
class University(models.Model):
    name = models.CharField(max_length=255, unique=True)
    logo = models.ImageField(upload_to='university_logos/', null=True, blank=True)
    website = models.URLField(null=True, blank=True)
    address = models.TextField()
    city = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    contact_email = models.EmailField(unique=True)
    contact_phone = models.CharField(max_length=20)
    registration_date = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        'User', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_universities'
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'universities'

class UniversityAdmin(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    university = models.ForeignKey(University, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_university_admins')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    last_password_reset = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.university.name}"

    class Meta:
        db_table = 'university_admins'
        unique_together = ('user', 'university')

class PlatformSetting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.key

    class Meta:
        db_table = 'platform_settings'

class SystemLog(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    details = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        return f"{self.timestamp} - {self.action}"

    class Meta:
        db_table = 'system_logs'

# User Authentication and Roles
class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'roles'

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    university = models.ForeignKey(University, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    faculty = models.ForeignKey('Faculty', on_delete=models.SET_NULL, null=True, blank=True)
    department = models.ForeignKey('Department', on_delete=models.SET_NULL, null=True, blank=True)
    program = models.ForeignKey('Program', on_delete=models.SET_NULL, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.role.name}"

    class Meta:
        db_table = 'user_profiles'
        unique_together = ('user', 'university')

# Academic Structure
class Faculty(models.Model):
    university = models.ForeignKey(University, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'faculties'
        unique_together = ('university', 'name')

class Department(models.Model):
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'departments'
        unique_together = ('faculty', 'name')

class Program(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'programs'
        unique_together = ('department', 'name')

# Academic Calendar
class AcademicSession(models.Model):
    university = models.ForeignKey(University, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'academic_sessions'
        unique_together = ('university', 'name')

class Semester(models.Model):
    academic_session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'semesters'
        unique_together = ('academic_session', 'name')

# Lecturer and Student Records
class Lecturer(models.Model):
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True)
    university = models.ForeignKey(University, on_delete=models.CASCADE)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    employee_id = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    class Meta:
        db_table = 'lecturers'

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True)
    university = models.ForeignKey(University, on_delete=models.CASCADE)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    program = models.ForeignKey(Program, on_delete=models.CASCADE)
    student_id = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    enrollment_date = models.DateField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    class Meta:
        db_table = 'students'

# Course Management
class Course(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=255)
    credits = models.IntegerField()

    def __str__(self):
        return f"{self.code} - {self.name}"

    class Meta:
        db_table = 'courses'
        unique_together = ('department', 'code')

class CourseAssignment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    lecturer = models.ForeignKey(Lecturer, on_delete=models.CASCADE)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.course} - {self.lecturer}"

    class Meta:
        db_table = 'course_assignments'
        unique_together = ('course', 'semester')

class CourseRegistration(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course_assignment = models.ForeignKey(CourseAssignment, on_delete=models.CASCADE)
    registration_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.course_assignment}"

    class Meta:
        db_table = 'course_registrations'
        unique_together = ('student', 'course_assignment')

# Result Management
class Result(models.Model):
    course_registration = models.OneToOneField(CourseRegistration, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    grade = models.CharField(max_length=5, null=True, blank=True)

    def __str__(self):
        return f"{self.course_registration} - {self.grade}"

    class Meta:
        db_table = 'results'

class ResultSubmission(models.Model):
    course_assignment = models.OneToOneField(CourseAssignment, on_delete=models.CASCADE)
    submitted_by = models.ForeignKey(Lecturer, on_delete=models.CASCADE)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Submission for {self.course_assignment}"

    class Meta:
        db_table = 'result_submissions'

class ResultVerification(models.Model):
    result_submission = models.OneToOneField(ResultSubmission, on_delete=models.CASCADE)
    verified_by = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    verified_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Verification for {self.result_submission}"

    class Meta:
        db_table = 'result_verifications'

class ResultApproval(models.Model):
    result_verification = models.OneToOneField(ResultVerification, on_delete=models.CASCADE)
    approved_by = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    approved_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Approval for {self.result_verification}"

    class Meta:
        db_table = 'result_approvals'

class ResultPublication(models.Model):
    result_approval = models.OneToOneField(ResultApproval, on_delete=models.CASCADE)
    published_by = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    published_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Publication for {self.result_approval}"

    class Meta:
        db_table = 'result_publications'

# Academic Performance
class GPARecord(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
    gpa = models.DecimalField(max_digits=4, decimal_places=2)

    def __str__(self):
        return f"GPA for {self.student} in {self.semester}"

    class Meta:
        db_table = 'gpa_records'
        unique_together = ('student', 'semester')

class CGPARecord(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    academic_session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)
    cgpa = models.DecimalField(max_digits=4, decimal_places=2)

    def __str__(self):
        return f"CGPA for {self.student} in {self.academic_session}"

    class Meta:
        db_table = 'cgpa_records'
        unique_together = ('student', 'academic_session')

# Activity Monitoring
class ActivityLog(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    activity = models.CharField(max_length=255)
    description = models.TextField()
    university = models.ForeignKey(University, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.timestamp} - {self.activity}"

    class Meta:
        db_table = 'activity_logs'

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user}"

    class Meta:
        db_table = 'notifications'

class SystemBackup(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    backup_file = models.FileField(upload_to='backups/')
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed')])
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Backup {self.created_at}"

    class Meta:
        db_table = 'system_backups'
