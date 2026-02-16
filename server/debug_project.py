
import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from projects.serializers import ProjectRequestSerializer
from django.core.mail import send_mail
from django.conf import settings

print("--- Testing Database Save ---")
data = {
    "name": "Test Debug User",
    "email": "testdebug@example.com",
    "phone": "9998887776",
    "project_title": "Debug Project",
    "project_type": "robotics",
    "description": "Debug description"
}

serializer = ProjectRequestSerializer(data=data)
if serializer.is_valid():
    try:
        instance = serializer.save()
        print(f"SUCCESS: Saved ProjectRequest with ID: {instance.id}")
    except Exception as e:
        print(f"FAILURE: Database Save Failed: {e}")
else:
    print(f"FAILURE: Serializer Invalid: {serializer.errors}")

print("\n--- Testing Email Sending ---")
try:
    print(f"Sending email from {settings.DEFAULT_FROM_EMAIL} to {settings.EMAIL_HOST_USER}...")
    send_mail(
        "Debug Email",
        "This is a test email to verify SMTP settings.",
        settings.DEFAULT_FROM_EMAIL,
        [settings.EMAIL_HOST_USER],
        fail_silently=False
    )
    print("SUCCESS: Email sent.")
except Exception as e:
    print(f"FAILURE: Email Sending Failed: {e}")
