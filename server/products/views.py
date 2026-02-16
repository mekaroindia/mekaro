from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer

from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import OrderingFilter

class ProductPagination(PageNumberPagination):
    page_size = 18
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = ProductPagination
    filter_backends = [OrderingFilter]
    ordering_fields = ['price', 'created_at'] # Add fields you want to sort by

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = Product.objects.select_related('category').prefetch_related('product_images').all()
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('q') # Support search query
        
        if category:
            queryset = queryset.filter(category_id=category)
        
        if search:
            queryset = queryset.filter(title__icontains=search)

        if self.request.query_params.get('is_innovative_project') == 'true':
            queryset = queryset.filter(is_innovative_project=True)
            
        return queryset

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]
