from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, StaffMember
from django.contrib.auth.password_validation import validate_password

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('phone','address_line1','address_line2','city','state','pincode')

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    class Meta:
        model = User
        fields = ('id','username','email','first_name','last_name','profile', 'is_staff', 'is_superuser')

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    address_line1 = serializers.CharField(required=False, allow_blank=True)
    address_line2 = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    pincode = serializers.CharField(required=False, allow_blank=True)

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is already taken")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already taken")
        return value

class StaffMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffMember
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        img_url = ret.get('image')
        if img_url and isinstance(img_url, str):
            # Ensure HTTPS for production / CDN URLs to avoid mixed content blocking
            if img_url.startswith('http://') and 'localhost' not in img_url and '127.0.0.1' not in img_url:
                ret['image'] = img_url.replace('http://', 'https://', 1)
        return ret

