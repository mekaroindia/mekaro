import os
import django
import sys
import time
from django.test import Client

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth.models import User
from users.models import EmailOTP
from django.utils.timezone import now
from datetime import timedelta

def run_tests():
    c = Client()
    print("--- Testing Forgot Password Flow ---")
    
    # 1. Setup Test User
    email = "testforgotpwd@example.com"
    username = "testforgotpwd"
    password = "OldPassword123!"
    
    User.objects.filter(email=email).delete()
    User.objects.filter(username=username).delete()
    
    user = User.objects.create_user(username=username, email=email, password=password)
    user.is_active = True
    user.save()
    
    print("1. Requesting OTP using email...")
    res = c.post('/api/password-reset/request/', {"username_or_email": email}, content_type="application/json")
    if res.status_code != 200:
        print(f"FAILED Request OTP by email! {res.json()}")
        return
    print("   [+] OTP requested successfully by email!")

    print("2. Requesting OTP using username (Testing Rate Limiting)...")
    res = c.post('/api/password-reset/request/', {"username_or_email": username}, content_type="application/json")
    if res.status_code != 429:
        print(f"FAILED Rate limiting should have blocked this! Status: {res.status_code}")
        return
    print("   [+] Rate limiting successfully blocked rapid requests!")

    # Bypass rate limiting
    otp_record = EmailOTP.objects.get(user=user)
    otp_record.created_at = now() - timedelta(minutes=2)
    otp_record.save()
    
    print("3. Requesting OTP using username (After cooldown bypass)...")
    res = c.post('/api/password-reset/request/', {"username_or_email": username}, content_type="application/json")
    if res.status_code != 200:
        print(f"FAILED Request OTP by username! {res.json()}")
        return
    print("   [+] OTP requested successfully by username!")
    
    # Get the latest OTP
    otp_record.refresh_from_db()
    valid_otp = otp_record.otp_code

    print("4. Verifying OTP with wrong code (Attempt 1)...")
    res = c.post('/api/password-reset/verify/', {"email": email, "otp": "000000"}, content_type="application/json")
    if res.status_code != 400 or "Invalid OTP" not in res.json().get('error', ''):
         print(f"FAILED Invalid OTP check! {res.json()}")
         return
    print("   [+] Invalid OTP correctly rejected!")

    print("5. Verifying OTP with correct code...")
    res = c.post('/api/password-reset/verify/', {"email": email, "otp": valid_otp}, content_type="application/json")
    if res.status_code != 200:
         print(f"FAILED Valid OTP verification! {res.json()}")
         return
    print("   [+] Valid OTP correctly verified!")
    
    # Store token from verification
    token = res.json().get('access')
    
    print("6. Setting New Password...")
    new_password = "NewPassword456@"
    res = c.post('/api/password-reset/confirm/', {"new_password": new_password}, content_type="application/json", HTTP_AUTHORIZATION=f"Bearer {token}")
    if res.status_code != 200:
         print(f"FAILED Password reset! {res.json()}")
         return
    print("   [+] Password correctly updated!")
    
    # Validate Login
    print("7. Testing Login with New Password...")
    res = c.post('/api/login/', {"username": username, "password": new_password}, content_type="application/json")
    if res.status_code != 200:
         print(f"FAILED Login with new password! {res.json()}")
         return
    print("   [+] Login successful with new password!")
    
    print("\nAll Backend Tests Passed Successfully! 🎉")

if __name__ == "__main__":
    run_tests()
