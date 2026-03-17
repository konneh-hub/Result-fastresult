from django.contrib import admin
from .models import User, University, UniversityAdmin, ActivityLog, Notification, SupportTicket, SystemBackup, APIIntegration, PlatformReport, SecuritySetting, SystemSetting, Branding

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_active']

@admin.register(University)
class UniversityAdminClass(admin.ModelAdmin):
    list_display = ['name', 'code', 'contact_email', 'is_approved', 'is_active']

@admin.register(UniversityAdmin)
class UniversityAdminAdmin(admin.ModelAdmin):
    list_display = ['user', 'university', 'phone_number', 'is_active', 'created_at']
    list_filter = ['university', 'is_active']
    search_fields = ['user__username', 'user__email', 'university__name']

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'user', 'activity', 'university']
    list_filter = ['timestamp', 'university']
    search_fields = ['user__username', 'activity']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'recipient_type', 'sent_by', 'created_at']
    list_filter = ['recipient_type', 'created_at']
    search_fields = ['title', 'content']

@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ['title', 'university', 'priority', 'status', 'created_at']
    list_filter = ['priority', 'status', 'university']
    search_fields = ['title', 'description']

@admin.register(SystemBackup)
class SystemBackupAdmin(admin.ModelAdmin):
    list_display = ['created_at', 'created_by', 'status']
    list_filter = ['status', 'created_at']
    search_fields = ['created_by__username']

@admin.register(APIIntegration)
class APIIntegrationAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']

@admin.register(PlatformReport)
class PlatformReportAdmin(admin.ModelAdmin):
    list_display = ['title', 'report_type', 'status', 'generated_at', 'generated_by']
    list_filter = ['report_type', 'status', 'generated_at']
    search_fields = ['title', 'generated_by__username']

@admin.register(SecuritySetting)
class SecuritySettingAdmin(admin.ModelAdmin):
    list_display = ['setting_name', 'category', 'is_active', 'updated_at', 'updated_by']
    list_filter = ['category', 'is_active']
    search_fields = ['setting_name', 'description']

@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ['setting_name', 'category', 'is_active', 'updated_at', 'updated_by']
    list_filter = ['category', 'is_active']
    search_fields = ['setting_name', 'description']

@admin.register(Branding)
class BrandingAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at', 'created_by']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name']
