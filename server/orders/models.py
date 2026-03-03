from django.db import models
from django.contrib.auth.models import User
from products.models import Product
import random
import string
from django.utils import timezone

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    shipping_address = models.JSONField(default=dict)
    
    # Custom Order ID
    order_id = models.CharField(max_length=20, unique=True, blank=True, null=True)

    status = models.CharField(
        max_length=20,
        default='pending',
        choices=[
            ('pending', 'Pending'),
            ('paid', 'Paid'),
            ('shipped', 'Shipped'),
            ('delivered', 'Delivered'),
        ]
    )

    PAYMENT_METHOD_CHOICES = [
        ('COD', 'Cash on Delivery'),
        ('ONLINE', 'Online Payment (Razorpay)'),
    ]
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default='COD')
    
    razorpay_order_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)


    created_at = models.DateTimeField(auto_now_add=True)

    # Priority Order Fields
    is_priority = models.BooleanField(default=False)
    priority_hours = models.IntegerField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.order_id:
            year = timezone.now().year
            while True:
                # Generate random 6-char string (e.g., A1B2C3)
                random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
                candidate_id = f"MEKARO-{year}-{random_str}"
                if not Order.objects.filter(order_id=candidate_id).exists():
                    self.order_id = candidate_id
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.order_id} ({self.id})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)

    quantity = models.IntegerField()
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product}"
