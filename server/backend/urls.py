from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from products.views import ProductViewSet, CategoryViewSet, ReviewViewSet, YouTubeVideoViewSet
from orders.views import create_order, get_order, get_my_orders, admin_dashboard_stats, admin_all_orders, admin_update_order_status, calculate_distance, initiate_payment, verify_payment, track_order
from users.views import register_user, get_current_user, update_profile, change_password, subscribe_newsletter, google_login, get_all_users, update_user_admin_status, complete_google_signup, verify_email_otp, resend_email_otp, edit_unverified_email, request_password_reset, verify_reset_otp, reset_forgotten_password
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'videos', YouTubeVideoViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),

    # API Router (Products/Categories)
    path('api/', include(router.urls)),

    # Users
    path('api/register/', register_user),
    path('api/verify-otp/', verify_email_otp),
    path('api/resend-otp/', resend_email_otp),
    path('api/edit-email-otp/', edit_unverified_email),
    path('api/google-login/', google_login),
    path('api/google-signup-complete/', complete_google_signup),
    path('api/user/', get_current_user),
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("api/user/update/", update_profile),
    path("api/user/update/", update_profile),
    path("api/user/change-password/", change_password),
    path("api/subscribe/", subscribe_newsletter),
    path('api/password-reset/request/', request_password_reset),
    path('api/password-reset/verify/', verify_reset_otp),
    path('api/password-reset/confirm/', reset_forgotten_password),
    
    # Admin Dashboard
    path("api/admin/dashboard/", admin_dashboard_stats),
    path("api/admin/stats/", admin_dashboard_stats),
    path("api/admin/orders/", admin_all_orders),
    path("api/admin/orders/<int:pk>/status/", admin_update_order_status),

    # Admin Users
    path("api/admin/users/", get_all_users),
    path("api/admin/users/<int:pk>/status/", update_user_admin_status),


    # Orders
    path('api/orders/pay/initiate/', initiate_payment),
    path('api/orders/pay/verify/', verify_payment),
    path('api/orders/create/', create_order),
    path('api/orders/<int:pk>/', get_order),
    path('api/orders/my-orders/', get_my_orders),
    path('api/orders/track/<str:order_id>/', track_order),
    path('api/orders/calculate-distance/', calculate_distance),
    path('api/projects/', include('projects.urls')),
    path('api/', include('enquiries.urls')),
    path('api/workshops/', include('workshops.urls')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
