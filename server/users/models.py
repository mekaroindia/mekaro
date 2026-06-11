from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile: {self.user.username}"

class EmailOTP(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='email_otp')
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    attempts = models.IntegerField(default=0)

    def __str__(self):
        return f"OTP for {self.user.email}"

class StaffMember(models.Model):
    STAFF_TYPE_CHOICES = (
        ('tutor', 'Tutor'),
        ('staff', 'Working Staff'),
    )
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=150)
    type = models.CharField(max_length=10, choices=STAFF_TYPE_CHOICES, default='tutor')
    bio = models.TextField(blank=True)
    expertise = models.CharField(max_length=255, blank=True, help_text="Comma-separated list of expertise tags, e.g., Arduino, ROS, CAD")
    linkedin = models.URLField(blank=True, max_length=255)
    email = models.EmailField(blank=True)
    image = models.ImageField(upload_to='staff/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

