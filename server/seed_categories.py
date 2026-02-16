
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Category
from django.core.files import File

CATEGORIES = [
    { "name": "Development Boards", "image_path": "client/public/assets/categories/dev_board.png" },
    { "name": "Drone Parts" },
    { "name": "Batteries, Power Supply and Accessories" },
    { "name": "3D Printers and Parts" },
    { "name": "Sensors" },
    { "name": "Electronic Components" },
    { "name": "Motors | Drivers | Pumps | Actuators" },
    { "name": "Electronic Modules and Displays" },
    { "name": "IoT and Wireless Modules" },
    { "name": "Mechanical Parts, Measurement & Workbench Tools" },
    { "name": "DIY & Maker Kits" },
    { "name": "Electric Vehicle Parts" },
]


# Valid categories list
ALLOWED_NAMES = {c["name"] for c in CATEGORIES}

# Remove any categories NOT in the list
print("Cleaning up old categories...")
deleted_count, _ = Category.objects.exclude(name__in=ALLOWED_NAMES).delete()
print(f"Deleted {deleted_count} categories that were not in the allowed list.")

for cat_data in CATEGORIES:
    name = cat_data["name"]
    slug = name.replace(" ", "-").replace(",", "").replace("|", "").lower()
    
    category, created = Category.objects.get_or_create(
        name=name,
        defaults={"slug": slug}
    )
    
    if created:
        print(f"Created category: {name}")
        image_path = cat_data.get("image_path")
        if image_path and os.path.exists(image_path):
            with open(image_path, 'rb') as f:
                # Save to specific path or let Django handle upload_to
                # Using 'categories/filename' relative to MEDIA_ROOT
                filename = os.path.basename(image_path)
                category.image.save(filename, File(f), save=True)
                print(f"  - Attached image: {filename}")
    else:
        print(f"Category already exists: {name}")

print("Seeding complete.")
