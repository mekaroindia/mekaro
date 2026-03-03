from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from backend.utils import send_email_async
from .models import ProjectRequest
from .serializers import ProjectRequestSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def create_project_request(request):
    print("DEBUG: Received Project Request")
    print(f"DEBUG: Data: {request.data}")
    
    data = request.data
    serializer = ProjectRequestSerializer(data=data)

    if serializer.is_valid():
        try:
            project_request = serializer.save()
            print(f"DEBUG: Saved Project Request ID: {project_request.id}")

            # Send Email to Admin (Async via Resend API)
            subject = f"New Project Request: {project_request.project_title}"
            message = f"""
            New Project Request Received!
    
            Name: {project_request.name}
            Email: {project_request.email}
            Phone: {project_request.phone}
            Project Type: {project_request.project_type}
            
            Description:
            {project_request.description}
    
            Log in to the admin dashboard to view details.
            """
            
            email = EmailMultiAlternatives(
                subject=subject,
                body=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=["mekaro.india@gmail.com"] # Admins receive this
            )
            
            send_email_async(email)
            
            return Response(serializer.data, status=201)
        except Exception as e:
            print(f"DEBUG: Error saving project: {e}")
            return Response({"error": str(e)}, status=500)
    else:
        print(f"DEBUG: Serializer Errors: {serializer.errors}")
        return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_project_requests(request):
    requests = ProjectRequest.objects.all().order_by('-created_at')
    serializer = ProjectRequestSerializer(requests, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_project_request_status(request, pk):
    try:
        project_request = ProjectRequest.objects.get(pk=pk)
        project_request.status = request.data.get('status', project_request.status)
        project_request.save()
        return Response(ProjectRequestSerializer(project_request).data)
    except ProjectRequest.DoesNotExist:
        return Response({'error': 'Request not found'}, status=404)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_project_request(request, pk):
    try:
        project_request = ProjectRequest.objects.get(pk=pk)
        project_request.delete()
        return Response({'message': 'Request deleted successfully'})
    except ProjectRequest.DoesNotExist:
        return Response({'error': 'Request not found'}, status=404)
