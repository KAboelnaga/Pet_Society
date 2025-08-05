from django.contrib import admin
from .models import ChatGroup, GroupMessage


@admin.register(ChatGroup)
class ChatGroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_private', 'member_count', 'online_count']
    list_filter = ['is_private']
    search_fields = ['name']
    filter_horizontal = ['members', 'users_online']

    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = 'Members'

    def online_count(self, obj):
        return obj.users_online.count()
    online_count.short_description = 'Online'


@admin.register(GroupMessage)
class GroupMessageAdmin(admin.ModelAdmin):
    list_display = ['author', 'group', 'body_preview', 'created']
    list_filter = ['group', 'created']
    search_fields = ['body', 'author__username']
    readonly_fields = ['created']

    def body_preview(self, obj):
        return obj.body[:50] + '...' if len(obj.body) > 50 else obj.body
    body_preview.short_description = 'Message'
