from rest_framework import serializers
from .models import WorkshopEnquiry

class WorkshopEnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopEnquiry
        fields = '__all__'
