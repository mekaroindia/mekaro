
import requests
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    token = request.data.get('token')
    if not token:
        return Response({'error': 'No token provided'}, status=400)

    # Verify token with Google
    google_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
    response = requests.get(google_url)

    if response.status_code != 200:
        return Response({'error': 'Invalid Google Token'}, status=400)

    user_data = response.json()
    email = user_data.get('email')
    first_name = user_data.get('given_name', '')
    last_name = user_data.get('family_name', '')

    if not email:
        return Response({'error': 'Email not found in token'}, status=400)

    # Get or Create User
    try:
        user = User.objects.get(email=email)
        # Login
    except User.DoesNotExist:
        # Register
        user = User.objects.create(
            username=email,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=make_password(None) # Unusable password
        )
        user.save()

    # Generate JWT
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
