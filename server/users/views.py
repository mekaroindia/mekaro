from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from django.db import models
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .serializers import RegisterSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.contrib.auth.hashers import check_password, make_password
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.timezone import now
from django.conf import settings
from backend.utils import send_email_async
import secrets
from datetime import timedelta
from .models import EmailOTP
from rest_framework_simplejwt.tokens import RefreshToken


@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data

    user = User.objects.create(
        username=data['username'],
        email=data['email'],
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', ''),
        password=make_password(data['password']),
        is_active=False
    )

    # Fill profile
    profile = user.profile
    profile.phone = data.get('phone', '')
    profile.address_line1 = data.get('address_line1', '')
    profile.address_line2 = data.get('address_line2', '')
    profile.city = data.get('city', '')
    profile.state = data.get('state', '')
    profile.pincode = data.get('pincode', '')
    profile.save()

    # ---------- GENERATE & SEND OTP EMAIL ----------
    otp_code = "".join(secrets.choice("0123456789") for _ in range(6))
    expires_at = now() + timedelta(minutes=10)
    
    EmailOTP.objects.create(
        user=user,
        otp_code=otp_code,
        expires_at=expires_at
    )
    
    subject = "Verify your email - MEKARO Store"

    html_content = render_to_string(
        "emails/otp_email.html",
        {
            "first_name": user.first_name or "Customer",
            "otp_code": otp_code,
            "year": now().year,
        }
    )

    email_msg = EmailMultiAlternatives(
        subject=subject,
        body=f"Your OTP code is {otp_code}",
        from_email="MEKARO India <mekaro.india@gmail.com>",
        to=[user.email],
    )
    email_msg.attach_alternative(html_content, "text/html")
    send_email_async(email_msg)

    return Response({"detail": "User registered successfully. Please verify OTP."}, status=status.HTTP_201_CREATED)



@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email_otp(request):
    email = request.data.get('email')
    otp_code = request.data.get('otp')

    if not email or not otp_code:
        return Response({"error": "Email and OTP are required"}, status=400)

    # Find the most recently created OTP record for this email
    otp_record = EmailOTP.objects.filter(user__email=email).order_by('-created_at').first()
    
    if not otp_record:
        return Response({"error": "Invalid email or OTP request"}, status=400)
        
    user = otp_record.user
    if user.is_active:
        return Response({"error": "User already verified"}, status=400)

    # Check maximum attempts
    if otp_record.attempts >= 3:
        return Response({"error": "Maximum attempts reached. Please resend OTP."}, status=400)

    # Check expiration
    if now() > otp_record.expires_at:
        return Response({"error": "OTP has expired. Please resend OTP."}, status=400)

    # Validate OTP
    if otp_record.otp_code != otp_code:
        otp_record.attempts += 1
        otp_record.save()
        remaining = 3 - otp_record.attempts
        return Response({"error": f"Invalid OTP. {remaining} attempts remaining."}, status=400)

    # Success: activate user, delete OTP record
    user.is_active = True
    user.save()
    otp_record.delete()

    # Send Welcome Email
    subject = "Welcome to MEKARO Store 🎉"
    html_content = render_to_string(
        "emails/welcome_email.html",
        {
            "first_name": user.first_name or "Customer",
            "year": now().year,
        }
    )
    email_msg = EmailMultiAlternatives(
        subject=subject,
        body="Welcome to MEKARO Store!",
        from_email="MEKARO India <mekaro.india@gmail.com>",
        to=[user.email],
    )
    email_msg.attach_alternative(html_content, "text/html")
    send_email_async(email_msg)

    # Generate tokens for automatic login
    refresh = RefreshToken.for_user(user)
    return Response({
        "detail": "Email verified successfully.",
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "isAdmin": user.is_staff
        }
    }, status=200)

@api_view(['POST'])
@permission_classes([AllowAny])
def resend_email_otp(request):
    email = request.data.get('email')
    if not email:
        return Response({"error": "Email is required"}, status=400)

    # Find the most recently created OTP record for this email
    otp_record = EmailOTP.objects.filter(user__email=email).order_by('-created_at').first()
    
    if not otp_record:
        return Response({"error": "Invalid email or OTP request"}, status=400)
        
    user = otp_record.user
    if user.is_active:
        return Response({"error": "User already verified"}, status=400)

    # Rate limiting: 1 minute cooldown
    if now() < otp_record.created_at + timedelta(minutes=1):
        wait_time = int((otp_record.created_at + timedelta(minutes=1) - now()).total_seconds())
        return Response({"error": f"Please wait {wait_time}s before resending."}, status=429)

    # Generate new OTP
    new_otp_code = "".join(secrets.choice("0123456789") for _ in range(6))
    
    # Update record
    otp_record.otp_code = new_otp_code
    otp_record.created_at = now()
    otp_record.expires_at = now() + timedelta(minutes=10)
    otp_record.attempts = 0
    otp_record.save()

    # Send email
    subject = "Verify your email - MEKARO Store"
    html_content = render_to_string(
        "emails/otp_email.html",
        {
            "first_name": user.first_name or "Customer",
            "otp_code": new_otp_code,
            "year": now().year,
        }
    )
    email_msg = EmailMultiAlternatives(
        subject=subject,
        body=f"Your OTP code is {new_otp_code}",
        from_email="MEKARO India <mekaro.india@gmail.com>",
        to=[user.email],
    )
    email_msg.attach_alternative(html_content, "text/html")
    send_email_async(email_msg)

    return Response({"detail": "A new OTP has been sent."})

@api_view(['POST'])
@permission_classes([AllowAny])
def edit_unverified_email(request):
    old_email = request.data.get('old_email')
    new_email = request.data.get('new_email')

    if not old_email or not new_email:
        return Response({"error": "Both old and new emails are required"}, status=400)

    if User.objects.filter(email=new_email).exists():
        return Response({"error": "Email is already taken"}, status=400)

    # Find the unverified user
    user = User.objects.filter(email=old_email).order_by('-date_joined').first()
    
    if not user:
        return Response({"error": "User not found"}, status=404)
        
    if user.is_active:
        return Response({"error": "Cannot edit email of a verified user"}, status=400)

    # Update email
    user.email = new_email
    user.save()

    # Get or create OTP record
    otp_record, created = EmailOTP.objects.get_or_create(user=user)
    
    # Rate limit check specifically for edit to prevent spam, 
    # but since it's an edit, we can give a bit less strictness, 
    # let's apply the standard 1 minute
    if not created and now() < otp_record.created_at + timedelta(minutes=1):
        wait_time = int((otp_record.created_at + timedelta(minutes=1) - now()).total_seconds())
        return Response({"error": f"Please wait {wait_time}s before editing email again."}, status=429)

    new_otp_code = "".join(secrets.choice("0123456789") for _ in range(6))
    otp_record.otp_code = new_otp_code
    otp_record.created_at = now()
    otp_record.expires_at = now() + timedelta(minutes=10)
    otp_record.attempts = 0
    otp_record.save()

    # Send new OTP email
    subject = "Verify your email - MEKARO Store"
    html_content = render_to_string(
        "emails/otp_email.html",
        {
            "first_name": user.first_name or "Customer",
            "otp_code": new_otp_code,
            "year": now().year,
        }
    )
    email_msg = EmailMultiAlternatives(
        subject=subject,
        body=f"Your OTP code is {new_otp_code}",
        from_email="MEKARO India <mekaro.india@gmail.com>",
        to=[user.email],
    )
    email_msg.attach_alternative(html_content, "text/html")
    send_email_async(email_msg)

    return Response({"detail": "Email updated successfully. OTP sent to new email."})

# --- FORGOT PASSWORD FLOW ---

@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    identity = request.data.get('username_or_email')
    if not identity:
        return Response({"error": "Username or email is required"}, status=400)

    # Find the user
    user = User.objects.filter(models.Q(email=identity) | models.Q(username=identity)).first()
    
    if not user:
        return Response({"error": "No account found matching this username or email"}, status=404)
        
    if not user.is_active:
         return Response({"error": "Account is not active. Please complete registration first."}, status=400)

    # Get or create OTP record with defaults to avoid null constraint errors
    otp_record, created = EmailOTP.objects.get_or_create(
        user=user, 
        defaults={
            'otp_code': '000000', 
            'expires_at': now() + timedelta(minutes=10)
        }
    )

    # Rate limiting: 1 minute cooldown
    if not created and now() < otp_record.created_at + timedelta(minutes=1):
        wait_time = int((otp_record.created_at + timedelta(minutes=1) - now()).total_seconds())
        return Response({"error": f"Please wait {wait_time}s before requesting a new OTP."}, status=429)

    # Generate new OTP
    otp_code = "".join(secrets.choice("0123456789") for _ in range(6))
    
    # Update record
    otp_record.otp_code = otp_code
    otp_record.created_at = now()
    otp_record.expires_at = now() + timedelta(minutes=10)
    otp_record.attempts = 0
    otp_record.save()

    # Send email
    subject = "Reset Your Password - MEKARO Store"
    html_content = render_to_string(
        "emails/reset_email.html",
        {
            "first_name": user.first_name or "Customer",
            "otp_code": otp_code,
            "year": now().year,
        }
    )
    email_msg = EmailMultiAlternatives(
        subject=subject,
        body=f"Your Password Reset OTP is {otp_code}",
        from_email="MEKARO India <mekaro.india@gmail.com>",
        to=[user.email],
    )
    email_msg.attach_alternative(html_content, "text/html")
    send_email_async(email_msg)

    return Response({
        "detail": "Password reset OTP sent successfully to your registered email.",
        "email": user.email # return email to the front end so they know where it went
    }, status=200)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_reset_otp(request):
    email = request.data.get('email')
    otp_code = request.data.get('otp')

    if not email or not otp_code:
        return Response({"error": "Email and OTP are required"}, status=400)

    otp_record = EmailOTP.objects.filter(user__email=email).order_by('-created_at').first()
    
    if not otp_record:
        print(f"DEBUG Verify: User or OTP not found for {email}")
        return Response({"error": "Invalid email or OTP request"}, status=400)
        
    user = otp_record.user
    print(f"DEBUG Verify: Received Email={email} OTP={otp_code}, DB OTP={otp_record.otp_code}")

    # Check maximum attempts
    if otp_record.attempts >= 3:
        print(f"DEBUG Verify: Failed. Max attempts reached ({otp_record.attempts})")
        return Response({"error": "Maximum attempts reached. Please request a new OTP."}, status=400)

    # Check expiration
    if now() > otp_record.expires_at:
        print(f"DEBUG Verify: Failed. Expired at {otp_record.expires_at}, now is {now()}")
        return Response({"error": "OTP has expired. Please request a new OTP."}, status=400)

    # Validate OTP
    print(f"DEBUG Verify: Comparing '{otp_record.otp_code}' with '{otp_code}'")
    if str(otp_record.otp_code).strip() != str(otp_code).strip():
        otp_record.attempts += 1
        otp_record.save()
        remaining = 3 - otp_record.attempts
        print(f"DEBUG Verify: Failed. OTP Mismatch. Remaining {remaining}")
        return Response({"error": f"Invalid OTP. {remaining} attempts remaining."}, status=400)

    print("DEBUG Verify: SUCCESS")
    # In a fully strict system this token would be stored. Here we can use simple jwt framework
    # or just a secondary signed token. For speed and matching current structure, we will return 
    # a standard access token but the frontend will only use it temporarily for the next step, 
    # OR we can just allow them to pass the OTP _again_ to the next step.
    # Let's delete the OTP record to prevent reuse, and issue them a valid standard login token
    # that they can use to either hit 'Skip & Login' or 'Set New Password'.
    
    otp_record.delete()
    
    refresh = RefreshToken.for_user(user)
    return Response({
        "detail": "OTP Verified.",
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "isAdmin": user.is_staff
        }
    }, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_forgotten_password(request):
    user = request.user
    new_password = request.data.get("new_password")

    if not new_password or len(new_password) < 6:
        return Response({"error": "Password must be at least 6 characters"}, status=400)

    import re
    if not re.search(r"[A-Z]", new_password):
        return Response({'error': 'Password must contain at least one uppercase letter'}, status=400)
    if not re.search(r"[a-z]", new_password):
        return Response({'error': 'Password must contain at least one lowercase letter'}, status=400)
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", new_password):
        return Response({'error': 'Password must contain at least one special character'}, status=400)

    user.password = make_password(new_password)
    user.save()

    return Response({"detail": "Password successfully updated. You are now logged in."})


# optional: current user endpoint
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    data = request.data

    # update user info
    user.first_name = data.get("first_name", user.first_name)
    user.last_name = data.get("last_name", user.last_name)
    user.email = data.get("email", user.email)
    user.save()

    # update profile fields
    profile = user.profile
    profile.phone = data.get("phone", profile.phone)
    profile.address_line1 = data.get("address_line1", profile.address_line1)
    profile.address_line2 = data.get("address_line2", profile.address_line2)
    profile.city = data.get("city", profile.city)
    profile.state = data.get("state", profile.state)
    profile.pincode = data.get("pincode", profile.pincode)
    profile.save()

    return Response({"detail": "Profile updated"})


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    data = request.data

    old = data.get("old_password")
    new = data.get("new_password")

    if not check_password(old, user.password):
        return Response({"error": "Old password is incorrect"}, status=400)

    if len(new) < 6:
        return Response({"error": "Password too short (min 6 chars)"}, status=400)

    user.password = make_password(new)
    user.save()

    return Response({"detail": "Password changed successfully"})


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def subscribe_newsletter(request):
    email_addr = request.data.get('email')
    
    if not email_addr:
        return Response({"error": "Email is required"}, status=400)

    # In a real app, save to a Subscriber model. 
    # For now, just send the welcome email.

    subject = "Welcome to the Inner Circle 🚀 | Mekaro"
    html_content = render_to_string(
        "emails/newsletter_welcome.html",
        {}
    )

    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body="Welcome to Mekaro Newsletter!",
            from_email="MEKARO India <mekaro.india@gmail.com>",
            to=[email_addr],
        )
        email.attach_alternative(html_content, "text/html")
        email.attach_alternative(html_content, "text/html")
        send_email_async(email)
    except Exception as e:
        print(f"Error sending email: {e}")
        return Response({"error": "Failed to send email"}, status=500)

    return Response({"detail": "Subscribed successfully! Check your email."})

import requests
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Client ID from frontend
GOOGLE_CLIENT_ID = "733597529233-msuclt8qeide7tgimobj99p0tp397uqd.apps.googleusercontent.com"

@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    token = request.data.get('token')
    if not token:
        return Response({'error': 'No token provided'}, status=400)

    user_data = None
    
    # OPTIMIZATION: Check if token structure resembles an ID Token (JWT) before trying to verify as ID Token
    # JWTs have 3 parts separated by dots. Access tokens are usually opaque strings.
    if token.count('.') == 2:
        try:
            # Verify ID Token locally (fast, uses cached public keys)
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID) 
            user_data = idinfo
        except ValueError:
            pass # Invalid ID Token, might be access token

    # If not a valid ID Token, verify as Access Token (UserInfo endpoint)
    # This involves a network call to Google
    if not user_data:
        try:
            access_token_url = "https://www.googleapis.com/oauth2/v3/userinfo"
            access_resp = requests.get(access_token_url, params={'access_token': token})
            if access_resp.status_code == 200:
                user_data = access_resp.json()
        except:
            pass
            
    if not user_data:
        return Response({'error': 'Invalid Google Token'}, status=400)

    email = user_data.get('email')
    first_name = user_data.get('given_name', '')
    last_name = user_data.get('family_name', '')

    if not email:
        return Response({'error': 'Email not found in token'}, status=400)

    # Get or Create User
    try:
        user = User.objects.get(email=email)
        # Login (Generate JWT)
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'isAdmin': user.is_staff
            }
        })
    except User.DoesNotExist:
        # Return flag to frontend to redirect to "Complete Profile"
        return Response({
            'is_new_user': True,
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
            'google_token': token  # Send back (or frontend keeps it) to be sent to complete_signup
        })

import re

@api_view(['POST'])
@permission_classes([AllowAny])
def complete_google_signup(request):
    token = request.data.get('token')
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not token or not username or not password:
        return Response({'error': 'All fields are required'}, status=400)

    # 1. Verify Google Token again to ensure email is valid and belongs to this session
    user_data = None
    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        user_data = idinfo
    except ValueError:
        pass
        
    if not user_data:
        # Fallback to UserInfo endpoint
        try:
            access_token_url = "https://www.googleapis.com/oauth2/v3/userinfo"
            access_resp = requests.get(access_token_url, params={'access_token': token})
            if access_resp.status_code == 200:
                user_data = access_resp.json()
        except:
            pass

    if not user_data:
        return Response({'error': 'Invalid or expired Google Token'}, status=400)
    
    email = user_data.get('email')
    first_name = user_data.get('given_name', '')
    last_name = user_data.get('family_name', '')

    # 2. Check if user already exists (shouldn't happen if flow is correct, but good safety)
    if User.objects.filter(email=email).exists():
        return Response({'error': 'User with this email already exists. Please login.'}, status=400)
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username is already taken'}, status=400)

    # 3. Validate Password
    # Constraints: 1 Capital, 1 Small, 1 Special, Length >= 8
    if len(password) < 8:
        return Response({'error': 'Password must be at least 8 characters long'}, status=400)
    if not re.search(r"[A-Z]", password):
        return Response({'error': 'Password must contain at least one uppercase letter'}, status=400)
    if not re.search(r"[a-z]", password):
        return Response({'error': 'Password must contain at least one lowercase letter'}, status=400)
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return Response({'error': 'Password must contain at least one special character'}, status=400)

    # 4. Create User
    user = User.objects.create(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        password=make_password(password)
    )
    
    # Create Profile
    from .models import Profile
    Profile.objects.create(user=user)

    # 5. Generate Tokens
    refresh = RefreshToken.for_user(user)

    # 6. Send Welcome Email (Reused logic)
    subject = "Welcome to MEKARO Store 🎉"
    html_content = render_to_string(
        "emails/welcome_email.html",
        {
            "first_name": user.first_name or "Customer",
            "year": now().year,
        }
    )
    email_msg = EmailMultiAlternatives(
        subject=subject,
        body="Welcome to MEKARO Store!",
        from_email="MEKARO India <mekaro.india@gmail.com>",
        to=[user.email],
    )
    email_msg.attach_alternative(html_content, "text/html")
    send_email_async(email_msg)

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'isAdmin': user.is_staff
        }
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_users(request):
    users = User.objects.all().order_by('-date_joined')
    data = []
    
    for u in users:
        data.append({
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'is_staff': u.is_staff,
            'is_superuser': u.is_superuser,
            'date_joined': u.date_joined,
            # Profile fields if needed
            'phone': u.profile.phone if hasattr(u, 'profile') else ""
        })
        
    return Response(data)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_user_admin_status(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
        
    # Superuser protection
    if user.is_superuser:
        return Response({'error': 'Cannot change status of a Super Admin'}, status=403)
        
    # Toggle staff status
    user.is_staff = not user.is_staff
    user.save()
    
    return Response({
        'id': user.id,
        'is_staff': user.is_staff,
        'message': f"User {user.username} is now {'an Admin' if user.is_staff else 'a User'}"
    })
