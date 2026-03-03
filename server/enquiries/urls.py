from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkshopEnquiryViewSet

router = DefaultRouter()
router.register(r'enquiries', WorkshopEnquiryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
