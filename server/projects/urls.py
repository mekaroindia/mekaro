from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_project_request, name='create_project_request'),
    path('', views.get_project_requests, name='get_project_requests'),
    path('<int:pk>/status/', views.update_project_request_status, name='update_project_request_status'),
    path('<int:pk>/delete/', views.delete_project_request, name='delete_project_request'),
]
