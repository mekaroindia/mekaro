
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Category, Product

# Allowed categories matching the user request/image
ALLOWED_NAMES = [
    "Development Boards",
    "Drone Parts",
    "Batteries, Power Supply and Accessories",
    "3D Printers and Parts",
    "Sensors",
    "Electronic Components",
    "Motors | Drivers | Pumps | Actuators",
    "Electronic Modules and Displays",
    "IoT and Wireless Modules",
    "Mechanical Parts, Measurement & Workbench Tools",
    "DIY & Maker Kits",
    "Electric Vehicle Parts",
]

print("--- Current Categories ---")
for cat in Category.objects.all():
    count = cat.products.count()
    status = "KEEP" if cat.name in ALLOWED_NAMES else "DELETE"
    print(f"ID: {cat.id} | Name: {cat.name} | Products: {count} | Action: {status}")

print("\n--- Products in Categories to be DELETED ---")
categories_to_delete = Category.objects.exclude(name__in=ALLOWED_NAMES)
for cat in categories_to_delete:
    for p in cat.products.all():
        print(f"Product: {p.title} (ID: {p.id}) in Category: {cat.name}")
