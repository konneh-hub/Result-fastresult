from django.db import models
from srms_app.models import User, University

# Academic Structure
class Faculty(models.Model):
    university = models.ForeignKey(University, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=10, unique=True, null=True, blank=True)
    dean = models.ForeignKey('Lecturer', on_delete=models.SET_NULL, null=True, blank=True, related_name='dean_of_faculty')
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'faculties'
        unique_together = ('university', 'name')

class Department(models.Model):
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=10, unique=True, null=True, blank=True)
    head = models.ForeignKey('Lecturer', on_delete=models.SET_NULL, null=True, blank=True, related_name='head_of_department')
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'departments'
        unique_together = ('faculty', 'name')

class Program(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    degree_type = models.CharField(max_length=10, choices=[
        ('BSc', 'Bachelor of Science'),
        ('BA', 'Bachelor of Arts'),
        ('BEng', 'Bachelor of Engineering'),
        ('MSc', 'Master of Science'),
        ('MA', 'Master of Arts'),
        ('PhD', 'Doctor of Philosophy')
    ], default='BSc')
    duration_years = models.IntegerField(default=4)

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
    rank = models.CharField(max_length=50, choices=[
        ('Professor', 'Professor'),
        ('Associate Professor', 'Associate Professor'),
        ('Senior Lecturer', 'Senior Lecturer'),
        ('Lecturer', 'Lecturer'),
        ('Assistant Lecturer', 'Assistant Lecturer'),
        ('Instructor', 'Instructor')
    ], default='Lecturer')
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
    level = models.IntegerField(default=1)
    enrollment_date = models.DateField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    class Meta:
        db_table = 'students'

# Course Management
class Course(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, null=True, blank=True)
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
    verified_by = models.ForeignKey(User, on_delete=models.CASCADE)
    verified_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Verification for {self.result_submission}"

    class Meta:
        db_table = 'result_verifications'

class ResultApproval(models.Model):
    result_verification = models.OneToOneField(ResultVerification, on_delete=models.CASCADE)
    approved_by = models.ForeignKey(User, on_delete=models.CASCADE)
    approved_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Approval for {self.result_verification}"

    class Meta:
        db_table = 'result_approvals'

class ResultPublication(models.Model):
    result_approval = models.OneToOneField(ResultApproval, on_delete=models.CASCADE)
    published_by = models.ForeignKey(User, on_delete=models.CASCADE)
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
