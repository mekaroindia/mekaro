from django.contrib import admin
from .models import WorkshopEnquiry

@admin.register(WorkshopEnquiry)
class WorkshopEnquiryAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'organization', 'created_at', 'is_read')
    list_filter = ('is_read', 'created_at')
    search_fields = ('name', 'email', 'organization', 'message')
