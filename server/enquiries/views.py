from rest_framework import viewsets, status
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from .models import WorkshopEnquiry
from .serializers import WorkshopEnquirySerializer
from rest_framework.permissions import AllowAny, IsAdminUser

class WorkshopEnquiryViewSet(viewsets.ModelViewSet):
    queryset = WorkshopEnquiry.objects.all().order_by('-created_at')
    serializer_class = WorkshopEnquirySerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Send Email to Admin
        try:
            subject = f"New Workshop Enquiry from {serializer.validated_data.get('name')}"
            message = f"""
            You have received a new workshop enquiry.

            Name: {serializer.validated_data.get('name')}
            Email: {serializer.validated_data.get('email')}
            Phone: {serializer.validated_data.get('phone', 'N/A')}
            Organization: {serializer.validated_data.get('organization', 'N/A')}
            
            Message:
            {serializer.validated_data.get('message')}
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                ['mekaro.india@gmail.com'],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send email: {e}")

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
