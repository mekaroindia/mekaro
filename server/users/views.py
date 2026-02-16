from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
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
        is_active=True
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

    # ---------- SEND WELCOME EMAIL ----------
    subject = "Welcome to MEKARO Store 🎉"

    html_content = render_to_string(
        "emails/welcome_email.html",
        {
            "first_name": user.first_name or "Customer",
            "year": now().year,
        }
    )

    email = EmailMultiAlternatives(
        subject=subject,
        body="Welcome to MEKARO Store!",
        from_email=settings.EMAIL_HOST_USER,
        to=[user.email],
    )

    email.attach_alternative(html_content, "text/html")
    email.attach_alternative(html_content, "text/html")
    send_email_async(email)

    return Response({"detail": "User registered successfully"}, status=status.HTTP_201_CREATED)


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
            from_email=settings.DEFAULT_FROM_EMAIL,
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
        from_email=settings.EMAIL_HOST_USER,
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
