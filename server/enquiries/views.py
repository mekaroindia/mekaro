from rest_framework import viewsets, status
from rest_framework.response import Response
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from backend.utils import send_email_async
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
            
            email = EmailMultiAlternatives(
                subject=subject,
                body=message,
                from_email="MEKARO India <mekaro.india@gmail.com>",
                to=['mekaro.india@gmail.com']
            )
            send_email_async(email)
        except Exception as e:
            print(f"Failed to send email: {e}")

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
