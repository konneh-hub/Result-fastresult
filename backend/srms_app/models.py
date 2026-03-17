from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

# Custom User Model
class User(AbstractUser):
    class Meta:
        db_table = 'users'

# Platform Management
class University(models.Model):
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=10, unique=True, null=True, blank=True)
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
    user = models.OneToOneField(User, on_delete=models.CASCADE)
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
    title = models.CharField(max_length=255, default='Notification')
    message = models.TextField()
    recipient_type = models.CharField(max_length=20, choices=[
        ('all', 'All Universities'),
        ('university', 'Specific University'),
    ], default='all')
    recipient_university = models.ForeignKey(University, on_delete=models.SET_NULL, null=True, blank=True)
    sent_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_notifications')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.recipient_type}"

    class Meta:
        db_table = 'notifications'

class SupportTicket(models.Model):
    university = models.ForeignKey(University, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ], default='medium')
    status = models.CharField(max_length=20, choices=[
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ], default='open')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_tickets')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.university.name}"

    class Meta:
        db_table = 'support_tickets'

class SystemBackup(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    backup_file = models.FileField(upload_to='backups/')
    status = models.CharField(max_length=50, choices=[
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    ], default='pending')
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Backup {self.created_at}"

    class Meta:
        db_table = 'system_backups'

class APIIntegration(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    api_key = models.CharField(max_length=255, blank=True)
    base_url = models.URLField(default='https://api.example.com')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'api_integrations'

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    university = models.ForeignKey(University, on_delete=models.CASCADE)
    role = models.CharField(max_length=50)  # e.g., 'University Admin', 'Exam Officer', etc.
    faculty = models.ForeignKey('academic.Faculty', on_delete=models.SET_NULL, null=True, blank=True)
    department = models.ForeignKey('academic.Department', on_delete=models.SET_NULL, null=True, blank=True)
    program = models.ForeignKey('academic.Program', on_delete=models.SET_NULL, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

    class Meta:
        db_table = 'user_profiles'
        unique_together = ('user', 'university')

class PlatformReport(models.Model):
    title = models.CharField(max_length=255)
    report_type = models.CharField(max_length=50, choices=[
        ('user_activity', 'User Activity'),
        ('system_performance', 'System Performance'),
        ('academic_stats', 'Academic Statistics'),
        ('security_audit', 'Security Audit'),
        ('financial', 'Financial Report'),
    ])
    parameters = models.JSONField(default=dict)  # Store report parameters
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    generated_at = models.DateTimeField(auto_now_add=True)
    file_path = models.FileField(upload_to='reports/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ], default='pending')

    def __str__(self):
        return f"{self.title} - {self.report_type}"

    class Meta:
        db_table = 'platform_reports'

class SecuritySetting(models.Model):
    setting_name = models.CharField(max_length=100, unique=True)
    setting_value = models.TextField()
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=[
        ('authentication', 'Authentication'),
        ('authorization', 'Authorization'),
        ('encryption', 'Encryption'),
        ('audit', 'Audit Logging'),
        ('network', 'Network Security'),
    ])
    is_active = models.BooleanField(default=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.setting_name} - {self.category}"

    class Meta:
        db_table = 'security_settings'

class SystemSetting(models.Model):
    setting_name = models.CharField(max_length=100, unique=True)
    setting_value = models.TextField()
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=[
        ('general', 'General'),
        ('email', 'Email Configuration'),
        ('storage', 'Storage'),
        ('backup', 'Backup'),
        ('performance', 'Performance'),
    ])
    is_active = models.BooleanField(default=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.setting_name} - {self.category}"

    class Meta:
        db_table = 'system_settings'

class Branding(models.Model):
    name = models.CharField(max_length=100, unique=True)
    logo = models.ImageField(upload_to='branding/', null=True, blank=True)
    favicon = models.ImageField(upload_to='branding/', null=True, blank=True)
    primary_color = models.CharField(max_length=7, default='#007bff')  # Hex color
    secondary_color = models.CharField(max_length=7, default='#6c757d')  # Hex color
    accent_color = models.CharField(max_length=7, default='#28a745')  # Hex color
    font_family = models.CharField(max_length=100, default='Arial, sans-serif')
    custom_css = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'branding'
