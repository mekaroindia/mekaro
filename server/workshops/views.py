from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Workshop, WorkshopImage
from .serializers import WorkshopSerializer

class WorkshopViewSet(viewsets.ModelViewSet):
    queryset = Workshop.objects.all().order_by('-date')
    serializer_class = WorkshopSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    @action(detail=True, methods=['post'], url_path='delete_image')
    def delete_image(self, request, pk=None):
        workshop = self.get_object()
        image_id = request.data.get('image_id')
        try:
            image = WorkshopImage.objects.get(id=image_id, workshop=workshop)
            image.delete()
            return Response({'status': 'Image deleted'}, status=status.HTTP_200_OK)
        except WorkshopImage.DoesNotExist:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
