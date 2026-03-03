from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny


from .models import Order, OrderItem
from products.models import Product
from .serializers import OrderSerializer
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from backend.utils import send_email_async
from datetime import datetime
from django.contrib.auth.models import User
from django.db.models import Sum
from .permissions import IsAdminUserOnly

from django.db import transaction

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    """
    Handles COD orders directly.
    For Online orders, this endpoint is NOT used to create the final order. 
    Online orders are created in 'verify_payment' after successful payment.
    However, if you want to create a 'Pending' order first, you can do that here.
    
    Current Logic:
    - If payment_method is COD: Create Order (Status: Pending) -> Send Email -> Success
    - If payment_method is ONLINE: (Frontend should call initiate_payment instead)
    """
    user = request.user
    items = request.data['items']
    total_amount = request.data['total_amount']
    shipping = request.data['shipping_address']
    payment_method = request.data.get('payment_method', 'COD')
    is_priority = request.data.get('is_priority', False)
    priority_hours = request.data.get('priority_hours', None)

    # Validate products
    for item in items:
        if not Product.objects.filter(id=item['product_id']).exists():
            return Response({"error": f"Product with ID {item['product_id']} no longer exists. Please clear your cart."}, status=400)

    try:
        with transaction.atomic():
            order = Order.objects.create(
                user=user,
                total_amount=total_amount,
                shipping_address=shipping,
                payment_method=payment_method,
                is_priority=is_priority,
                priority_hours=priority_hours
            )

            # Auto-save address to profile
            try:
                profile = user.profile
                profile.address_line1 = shipping.get('address_line1', profile.address_line1)
                profile.city = shipping.get('city', profile.city)
                profile.state = shipping.get('state', profile.state)
                profile.pincode = shipping.get('pincode', profile.pincode)
                profile.phone = shipping.get('phone', profile.phone)
                profile.save()
            except Exception as e:
                print(f"Failed to auto-save profile: {e}")

            items_html = "<table width='100%' cellpadding='6' cellspacing='0' style='border-collapse:collapse;'>"

            for item in items:
                product = Product.objects.select_for_update().get(id=item['product_id'])

                if product.stock < item['qty']:
                    raise Exception(f"Insufficient stock for {product.title}. Only {product.stock} left.")

                product.stock -= item['qty']
                product.save()

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item['qty'],
                    price_at_purchase=product.price
                )

                items_html += f"""
                <tr style="border-bottom:1px solid #eee;">
                    <td>{product.title}</td>
                    <td align="center">{item['qty']}</td>
                    <td align="right">₹{product.price}</td>
                </tr>
                """
            
            items_html += "</table>"
            
        # Render HTML email
        html_content = render_to_string(
            "emails/order_confirmation.html",
            {
                "name": user.first_name or "Customer",
                "order_id": order.id,
                "items_html": items_html,
                "total": total_amount,
                "address": shipping,
                "year": datetime.now().year,
                "payment_method": payment_method
            }
        )

        text_content = strip_tags(html_content)

        email = EmailMultiAlternatives(
            subject=f"Order Confirmation - MEKARO #{order.id}",
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )

        email.attach_alternative(html_content, "text/html")
        send_email_async(email)

        return Response({
            "success": True,
            "order_id": order.id
        })
    except Exception as e:
        return Response({"error": str(e)}, status=400)


import razorpay

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    amount = float(request.data['amount']) # Amount in INR
    
    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

    payment_data = {
        "amount": int(amount * 100), # Amount in paise
        "currency": "INR",
        "receipt": f"receipt_order_{datetime.now().timestamp()}",
        "payment_capture": 1 
    }

    try:
        order = client.order.create(data=payment_data)
        return Response({
            "id": order['id'],
            "amount": order['amount'],
            "currency": order['currency'],
            "keyId": settings.RAZORPAY_KEY_ID
        })
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    try:
        razorpay_order_id = request.data['razorpay_order_id']
        razorpay_payment_id = request.data['razorpay_payment_id']
        razorpay_signature = request.data['razorpay_signature']
        
        # Order Details to Create Order in DB
        user = request.user
        items = request.data['items']
        total_amount = request.data['total_amount']
        shipping = request.data['shipping_address']
        is_priority = request.data.get('is_priority', False)
        priority_hours = request.data.get('priority_hours', None)

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

        # Verify Signature
        data = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }
        
        check = client.utility.verify_payment_signature(data)

        if not check:
             return Response({'error': 'Signature Mismatch'}, status=400)

        # Create Order in DB (Same logic as create_order but Status = Paid)
        with transaction.atomic():
            order = Order.objects.create(
                user=user,
                total_amount=total_amount,
                shipping_address=shipping,
                payment_method='ONLINE',
                status='paid',
                razorpay_order_id=razorpay_order_id,
                razorpay_payment_id=razorpay_payment_id,
                is_priority=is_priority,
                priority_hours=priority_hours
            )
            
            # Reduce Stock & Create Items
            items_html = "<table width='100%' cellpadding='6' cellspacing='0' style='border-collapse:collapse;'>"
            for item in items:
                product = Product.objects.select_for_update().get(id=item['product_id'])
                if product.stock < item['qty']:
                     raise Exception(f"Insufficient stock for {product.title}")
                product.stock -= item['qty']
                product.save()
                
                OrderItem.objects.create(
                    order=order, product=product, quantity=item['qty'], price_at_purchase=product.price
                )
                items_html += f"<tr><td>{product.title}</td><td>{item['qty']}</td><td>₹{product.price}</td></tr>"
            items_html += "</table>"
            
            # Send Email
            html_content = render_to_string(
                "emails/order_confirmation.html",
                {
                    "name": user.first_name,
                    "order_id": order.id,
                    "items_html": items_html,
                    "total": total_amount,
                    "address": shipping,
                    "year": datetime.now().year,
                    "payment_method": "ONLINE"
                }
            )
            text_content = strip_tags(html_content)
            email = EmailMultiAlternatives(
                subject=f"Order Confirmed - MEKARO #{order.id}",
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email]
            )
            email.attach_alternative(html_content, "text/html")
            send_email_async(email)

            return Response({'success': True, 'order_id': order.id})

    except Exception as e:
        return Response({'error': str(e)}, status=400)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order(request, pk):
    order = Order.objects.get(id=pk, user=request.user)
    serializer = OrderSerializer(order)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_orders(request):
    user = request.user
    orders = Order.objects.filter(user=user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUserOnly])
def admin_dashboard_stats(request):
    total_users = User.objects.count()
    total_orders = Order.objects.count()
    total_revenue = Order.objects.aggregate(
        total=Sum("total_amount")
    )["total"] or 0

    pending_orders = Order.objects.filter(status="pending").count()
    delivered_orders = Order.objects.filter(status="delivered").count()

    return Response({
        "total_users": total_users,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "pending_orders": pending_orders,
        "delivered_orders": delivered_orders,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUserOnly])
def admin_all_orders(request):
    orders = Order.objects.select_related('user').prefetch_related('items__product').all().order_by("-created_at")
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated, IsAdminUserOnly])
def admin_update_order_status(request, pk):
    order = Order.objects.get(id=pk)
    status = request.data.get("status")

    if status not in ["pending", "paid", "shipped", "delivered"]:
        return Response({"error": "Invalid status"}, status=400)

    # Only send email if status actually changes
    if order.status != status:
        order.status = status
        order.save()

        # Send Email Notification
        try:
            subject = f"Order Update - MEKARO #{order.id}"
            html_content = render_to_string(
                "emails/order_status.html",
                {
                    "name": order.user.first_name or "Customer",
                    "order_id": order.id,
                    "status": status,
                    "year": datetime.now().year,
                }
            )
            text_content = strip_tags(html_content)

            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[order.user.email],
            )
            email.attach_alternative(html_content, "text/html")
            email.attach_alternative(html_content, "text/html")
            send_email_async(email)
        except Exception as e:
            print(f"Failed to send status update email: {e}")

    return Response({"success": True, "new_status": order.status})


from geopy.geocoders import Nominatim
import requests

# Trigger reload


import math

def haversine_distance(lat1, lon1, lat2, lon2):
    # Earth radius in km
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    c = 2*math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R*c

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_distance(request):
    """
    Robust Tri-Layer Distance Calculation:
    1. Exact Geocode + OSRM Routing
    2. Region Geocode + OSRM Routing
    3. Haversine Geometric Fallback (Fail-safe)
    """
    user_address_data = request.data
    
    # buffers
    PROCESSING_MINUTES = 45 
    TRAFFIC_BUFFER = 15
    URBAN_TORTUOSITY = 1.4 # Factor for straight line -> road dist

    # 1. Address Construction
    params = [
        user_address_data.get('address_line1', ''),
        user_address_data.get('city', ''),
        user_address_data.get('state', ''),
        str(user_address_data.get('pincode', ''))
    ]
    full_address_str = ", ".join([p for p in params if p])
    fallback_address_str = ", ".join([p for p in params[1:] if p]) # City, State, Pin
    pincode_str = str(user_address_data.get('pincode', ''))

    # Admin Location (Fixed)
    ADMIN_ADDRESS_STR = "Ayapakkam, Scotland, Chennai, 600077" # Keeping simple for geocoder success
    # Ideally hardcode coords to save 1 API call
    ADMIN_COORDS = (13.1067, 80.1444) # Approx Ayapakkam Coords to fail-safe Admin geocoding
    
    geolocator = Nominatim(user_agent="mekaro_ecom_robust_v3")

    try:
        # --- PHASE A: Geocoding Admin ---
        try:
            admin_loc = geolocator.geocode("Ayapakkam, Chennai")
            if admin_loc:
                admin_coords = (admin_loc.latitude, admin_loc.longitude)
            else:
                admin_coords = ADMIN_COORDS
        except:
             admin_coords = ADMIN_COORDS

        # --- PHASE B: Geocoding User ---
        user_coords = None
        method = "none"

        # Attempt 1: Full Address
        try:
            loc = geolocator.geocode(full_address_str)
            if loc: 
                user_coords = (loc.latitude, loc.longitude)
                method = "exact_geocode"
        except: pass

        # Attempt 2: Fallback Address
        if not user_coords:
            try:
                loc = geolocator.geocode(fallback_address_str)
                if loc:
                     user_coords = (loc.latitude, loc.longitude)
                     method = "region_geocode"
            except: pass

        # Attempt 3: Pincode
        if not user_coords:
            try:
                loc = geolocator.geocode(pincode_str)
                if loc:
                    user_coords = (loc.latitude, loc.longitude)
                    method = "pincode_geocode"
            except: pass

        if not user_coords:
             return Response({"allowed": False, "reason": "Could not map this location."})

        # --- PHASE C: Routing / Distance ---
        final_km = 0
        est_minutes = 0
        route_method = "math"

        # Try OSRM
        try:
            osrm_url = f"http://router.project-osrm.org/route/v1/driving/{admin_coords[1]},{admin_coords[0]};{user_coords[1]},{user_coords[0]}?overview=false"
            resp = requests.get(osrm_url, timeout=3)
            if resp.status_code == 200:
                data = resp.json()
                if data['code'] == 'Ok' and data['routes']:
                    rt = data['routes'][0]
                    final_km = rt['distance'] / 1000.0
                    est_minutes = rt['duration'] / 60.0
                    route_method = "osrm_route"
        except Exception as e:
            print(f"OSRM Fail ({e}), switching to geometric fallback")
        
        # Fallback: Haversine
        if route_method == "math":
            raw_dist = haversine_distance(admin_coords[0], admin_coords[1], user_coords[0], user_coords[1])
            final_km = raw_dist * URBAN_TORTUOSITY
            # 30km/h avg speed
            est_minutes = (final_km / 30.0) * 60 

        # --- PHASE D: Validation & Response ---
        if final_km > 100:
             return Response({
                "allowed": False,
                "reason": f"Delivery radius exceeded ({int(final_km)}km). Limit 100km."
            })

        total_time_mins = est_minutes + PROCESSING_MINUTES + TRAFFIC_BUFFER
        total_hours = math.ceil(total_time_mins / 60)

        # Ensure at least 1 hour
        if total_hours < 1: total_hours = 1

        return Response({
            "allowed": True,
            "distance_km": round(final_km, 1),
            "estimated_hours": total_hours,
            "details": f"{total_hours} hrs ({int(est_minutes)} mins drive + prep time)",
            "method": f"{method} + {route_method}"
        })

    except Exception as e:
        print(f"Calculation Fatal Error: {e}")
        return Response({"allowed": False, "reason": "Server calculation error"})


@api_view(['GET'])
@permission_classes([AllowAny])
def track_order(request, order_id):
    try:
        # Case-insensitive search
        order = Order.objects.filter(order_id__iexact=order_id).first()
        if not order:
             return Response({"error": "Order ID not found."}, status=404)
        
        items_data = []
        for item in order.items.all():
            items_data.append({
                "product_title": item.product.title,
                "qty": item.quantity,
                "price": item.price_at_purchase
            })

        return Response({
            "order_id": order.order_id,
            "status": order.status,
            "total_amount": order.total_amount,
            "created_at": order.created_at,
            "shipping_address": order.shipping_address,
            "items": items_data,
            "payment_method": order.payment_method
        })
    except Exception as e:
        return Response({"error": str(e)}, status=400)
