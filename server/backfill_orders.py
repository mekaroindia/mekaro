
import os
import django
import random
import string
from django.utils import timezone
from django.db.models import Q

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from orders.models import Order

def backfill():
    # Find orders where order_id is null OR empty string
    orders = Order.objects.filter(Q(order_id__isnull=True) | Q(order_id=''))
    print(f"Found {orders.count()} orders to update.")
    
    count = 0
    for order in orders:
        print(f"Processing Order #{order.id} (Current ID: {order.order_id})")
        
        year = order.created_at.year if order.created_at else timezone.now().year
        
        while True:
            random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            candidate = f"MEKARO-{year}-{random_str}"
            if not Order.objects.filter(order_id=candidate).exists():
                order.order_id = candidate
                order.save()
                print(f" -> Updated Order {order.id} to {candidate}")
                break
        count += 1
    print(f"Successfully backfilled {count} orders.")

if __name__ == '__main__':
    backfill()
