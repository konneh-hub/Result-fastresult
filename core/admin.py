from django.contrib import admin
from django.db import models
from django import forms
from .models import (
    University, UniversityAdmin, PlatformSetting, SystemLog,
    ActivityLog, Notification, SystemBackup, User
)

class UniversityAdminForm(forms.ModelForm):
    username = forms.CharField(max_length=150)
    email = forms.EmailField()
    first_name = forms.CharField(max_length=30, required=False)
    last_name = forms.CharField(max_length=150, required=False)
    password = forms.CharField(widget=forms.PasswordInput, required=False)

    class Meta:
        model = UniversityAdmin
        fields = ['university', 'phone_number', 'is_active']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk and self.instance.user:
            self.fields['username'].initial = self.instance.user.username
            self.fields['email'].initial = self.instance.user.email
            self.fields['first_name'].initial = self.instance.user.first_name
            self.fields['last_name'].initial = self.instance.user.last_name

    def save(self, commit=True):
        instance = super().save(commit=False)
        user = instance.user if instance.pk else None
        if not user:
            user = User()
        user.username = self.cleaned_data['username']
        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data.get('first_name', '')
        user.last_name = self.cleaned_data.get('last_name', '')
        if self.cleaned_data.get('password'):
            user.set_password(self.cleaned_data['password'])
        user.save()
        instance.user = user
        if commit:
            instance.save()
        return instance

class BaseAdmin(admin.ModelAdmin):
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        action = 'Updated' if change else 'Created'
        ActivityLog.objects.create(
            user=request.user,
            activity=f'{action} {obj._meta.model_name}',
            description=f'{action} {obj}',
            university=getattr(obj, 'university', None) if hasattr(obj, 'university') else None
        )

    def delete_model(self, request, obj):
        ActivityLog.objects.create(
            user=request.user,
            activity=f'Deleted {obj._meta.model_name}',
            description=f'Deleted {obj}',
            university=getattr(obj, 'university', None) if hasattr(obj, 'university') else None
        )
        super().delete_model(request, obj)

# Platform Management - Only these are managed by System Admin
@admin.register(University)
class UniversityModelAdmin(BaseAdmin):
    list_display = ('name', 'contact_email', 'contact_phone', 'website', 'city', 'country', 'is_active', 'is_approved', 'registration_date')
    list_filter = ('is_active', 'is_approved', 'registration_date', 'country')
    search_fields = ('name', 'contact_email', 'contact_phone', 'website')
    actions = ['approve_universities', 'suspend_universities']

    fieldsets = (
        (None, {'fields': ('name', 'logo', 'website')}),
        ('Contact', {'fields': ('address', 'city', 'country', 'contact_email', 'contact_phone')}),
        ('Status', {'fields': ('is_active', 'is_approved', 'approved_at', 'approved_by')}),
    )

    @admin.action(description='Approve selected universities')
    def approve_universities(self, request, queryset):
        queryset.update(is_approved=True, approved_at=models.functions.Now(), approved_by=request.user)

    @admin.action(description='Suspend selected universities')
    def suspend_universities(self, request, queryset):
        queryset.update(is_active=False)

@admin.register(UniversityAdmin)
class UniversityAdminModelAdmin(BaseAdmin):
    form = UniversityAdminForm
    list_display = ('username', 'email', 'full_name', 'phone_number', 'university', 'created_at', 'is_active', 'last_password_reset')
    list_filter = ('university', 'created_at', 'is_active')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name')
    actions = ['activate_admins', 'deactivate_admins', 'reset_passwords']

    fieldsets = (
        ('User Details', {
            'fields': ('username', 'email', 'first_name', 'last_name', 'password')
        }),
        ('Details', {
            'fields': ('university', 'phone_number', 'is_active')
        }),
    )

    def username(self, obj):
        return obj.user.username
    username.admin_order_field = 'user__username'
    username.short_description = 'Username'

    def email(self, obj):
        return obj.user.email
    email.admin_order_field = 'user__email'
    email.short_description = 'Email'

    def full_name(self, obj):
        return obj.user.get_full_name()
    full_name.short_description = 'Full name'

    @admin.action(description='Activate selected university admins')
    def activate_admins(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description='Deactivate selected university admins')
    def deactivate_admins(self, request, queryset):
        queryset.update(is_active=False)

    @admin.action(description='Reset passwords for selected university admins')
    def reset_passwords(self, request, queryset):
        for admin in queryset:
            admin.user.set_password('ChangeMe123!')
            admin.user.save()
            admin.last_password_reset = models.functions.Now()
            admin.save()

@admin.register(PlatformSetting)
class PlatformSettingAdmin(BaseAdmin):
    list_display = ('key', 'value', 'updated_at')
    search_fields = ('key', 'description')

@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'user', 'action', 'ip_address')
    list_filter = ('timestamp', 'action')
    search_fields = ('user__username', 'action', 'details')
    readonly_fields = ('timestamp', 'user', 'action', 'details', 'ip_address')

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'user', 'activity', 'university')
    list_filter = ('timestamp', 'activity', 'university')
    search_fields = ('user__username', 'activity', 'description')
    readonly_fields = ('timestamp', 'user', 'activity', 'description', 'university')

@admin.register(Notification)
class NotificationAdmin(BaseAdmin):
    list_display = ('title', 'recipient_type', 'sent_by', 'created_at', 'university')
    list_filter = ('recipient_type', 'is_read', 'created_at', 'university')
    search_fields = ('title', 'message', 'sent_by__username')

@admin.register(SystemBackup)
class SystemBackupAdmin(BaseAdmin):
    list_display = ('created_at', 'created_by', 'status', 'backup_file')
    list_filter = ('status', 'created_at')
    search_fields = ('created_by__username', 'notes')
    readonly_fields = ('created_at', 'created_by')
