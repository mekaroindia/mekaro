
import os
import django
import json
from rest_framework import serializers

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from orders.models import Order
from orders.serializers import OrderSerializer

def debug_serializer():
    order = Order.objects.get(id=6)
    print(f"DB Order ID: {order.order_id}")
    
    serializer = OrderSerializer(order)
    data = serializer.data
    # Convert to dict to inspect keys
    # print(json.dumps(data, indent=2, default=str)) # too verbose
    
    if 'order_id' in data:
        print(f"Serializer 'order_id': {data['order_id']}")
    else:
        print("Serializer MISSING 'order_id' field!")
        print(f"Available fields: {list(data.keys())}")

if __name__ == '__main__':
    debug_serializer()
