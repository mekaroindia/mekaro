import os
import django
import sys
from django.utils.timezone import now
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
from users.models import EmailOTP, Profile

def run_tests():
    c = Client()
    print("--- Testing OTP Verification Flow ---")
    
    # Clean up previous tests
    User.objects.filter(username="testuser_otp").delete()
    
    print("1. Registering user...")
    res = c.post('/api/register/', {
        "username": "testuser_otp",
        "email": "testuser_otp@example.com",
        "password": "Password123!",
        "first_name": "Test",
        "last_name": "OTP"
    }, content_type="application/json")
    
    assert res.status_code == 201, f"Registration failed: {res.json()}"
    print("   [+] Registration successful. Checking DB state...")
    
    user = User.objects.get(username="testuser_otp")
    assert user.is_active == False, "User should be inactive"
    
    otp_record = EmailOTP.objects.get(user=user)
    print(f"   [+] OTP Record created. Code: {otp_record.otp_code}, Expires: {otp_record.expires_at}")
    
    print("2. Testing Rate Limiting on Resend...")
    res = c.post('/api/resend-otp/', {"email": "testuser_otp@example.com"}, content_type="application/json")
    assert res.status_code == 429, f"Should be rate limited, got {res.status_code}"
    print("   [+] Rate limit working.")
    
    print("3. Testing Max Attempts...")
    for i in range(3):
        res = c.post('/api/verify-otp/', {"email": "testuser_otp@example.com", "otp": "000000"}, content_type="application/json")
        assert res.status_code == 400
        
    otp_record.refresh_from_db()
    assert otp_record.attempts == 3, "Attempts should be 3"
    
    res = c.post('/api/verify-otp/', {"email": "testuser_otp@example.com", "otp": otp_record.otp_code}, content_type="application/json")
    assert res.status_code == 400
    assert "Maximum attempts reached" in res.json()['error']
    print("   [+] Max attempts triggered securely.")
    
    print("4. Bypassing rate limit & requesting new OTP for success test...")
    otp_record.created_at = now() - timedelta(minutes=2)
    otp_record.save()
    
    res = c.post('/api/resend-otp/', {"email": "testuser_otp@example.com"}, content_type="application/json")
    assert res.status_code == 200, f"Resend failed: {res.json()}"
    
    otp_record.refresh_from_db()
    new_otp = otp_record.otp_code
    print(f"   [+] New OTP Generated: {new_otp}")
    
    print("5. Verifying correctly...")
    res = c.post('/api/verify-otp/', {"email": "testuser_otp@example.com", "otp": new_otp}, content_type="application/json")
    assert res.status_code == 200, f"Verification failed: {res.json()}"
    print("   [+] Verified successfully!")
    
    user.refresh_from_db()
    assert user.is_active == True, "User should be active now"
    assert not EmailOTP.objects.filter(user=user).exists(), "OTP should be deleted"
    
    print("6. Testing Edit Email Flow (should fail for verified users)...")
    res = c.post('/api/edit-email-otp/', {"old_email": "testuser_otp@example.com", "new_email": "new_email@example.com"}, content_type="application/json")
    assert res.status_code == 400, "Should not edit verified email"
    print("   [+] Guard against editing verified email works.")

    print("\nAll Backend Tests Passed Successfully! 🎉")

if __name__ == "__main__":
    run_tests()
