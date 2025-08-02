from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.action(description='Promote selected users to Admin')
def promote_to_admin(modeladmin, request, queryset):
    queryset.update(is_admin=True, is_staff=True)

@admin.action(description='Block selected users')
def block_users(modeladmin, request, queryset):
    queryset.update(is_blocked=True)

@admin.action(description='Unblock selected users')
def unblock_users(modeladmin, request, queryset):
    queryset.update(is_blocked=False)
