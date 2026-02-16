from django.contrib import admin
from .models import Workshop, WorkshopImage

class WorkshopImageInline(admin.TabularInline):
    model = WorkshopImage
    extra = 1

@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'location', 'created_at')
    search_fields = ('title', 'location')
    inlines = [WorkshopImageInline]
