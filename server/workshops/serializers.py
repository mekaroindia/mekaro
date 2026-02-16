from rest_framework import serializers
from .models import Workshop, WorkshopImage

class WorkshopImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopImage
        fields = ['id', 'image']

class WorkshopSerializer(serializers.ModelSerializer):
    images = WorkshopImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )

    class Meta:
        model = Workshop
        fields = ['id', 'title', 'description', 'date', 'location', 'created_at', 'images', 'uploaded_images']

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        workshop = Workshop.objects.create(**validated_data)
        for image in uploaded_images:
            WorkshopImage.objects.create(workshop=workshop, image=image)
        return workshop

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        instance = super().update(instance, validated_data)
        
        # Check limit, current images + new images
        current_count = instance.images.count()
        if current_count + len(uploaded_images) > 5:
             raise serializers.ValidationError("Maximum 5 images allowed per workshop.")

        for image in uploaded_images:
            WorkshopImage.objects.create(workshop=instance, image=image)
        return instance
