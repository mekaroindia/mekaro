from django.core.management.base import BaseCommand
from products.models import Category
from django.core.files.base import ContentFile
import requests

from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Seeds initial categories'

    def handle(self, *args, **options):
        # ... (categories list remains same) ...
        categories = [
            {"name": "Development Boards", "image": "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&q=80&w=300"},
            {"name": "Drone Parts", "image": "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&q=80&w=300"},
            {"name": "Batteries, Power Supply", "image": "https://images.unsplash.com/photo-1619641472917-3844645dd6f2?auto=format&fit=crop&q=80&w=300"},
            {"name": "3D Printers and Parts", "image": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=300"},
            {"name": "Sensors", "image": "https://images.unsplash.com/photo-1581092918056-0c4c3acd90f7?auto=format&fit=crop&q=80&w=300"},
            {"name": "Electronic Components", "image": "https://images.unsplash.com/photo-1563770095125-84f53cd7d9a5?auto=format&fit=crop&q=80&w=300"},
            {"name": "Motors | Drivers | Pumps", "image": "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&q=80&w=300"},
            {"name": "Electronic Modules", "image": "https://images.unsplash.com/photo-1628102491629-778571d893a3?auto=format&fit=crop&q=80&w=300"},
            {"name": "IoT and Wireless", "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=300"},
            {"name": "Mechanical Parts", "image": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=300"},
            {"name": "DIY & Maker Kits", "image": "https://images.unsplash.com/photo-1581093583449-ed25213445e9?auto=format&fit=crop&q=80&w=300"},
            {"name": "Electric Vehicle Parts", "image": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=300"},
        ]

        for cat_data in categories:
            slug = slugify(cat_data["name"])
            cat, created = Category.objects.get_or_create(name=cat_data["name"], defaults={'slug': slug})
            if created:
                try:
                    # For now just saving the URL as string if model supports it, 
                    # OR we could download it. 
                    # Assuming minimal model content for now, let's just create the object
                    # You might need to adjust this depending on your Category model fields (e.g. if image is FileField)
                    
                    # NOTE: Since I don't see the model definition, I am assuming a standard setup.
                    # If image is a FileField/ImageField, we need to download content.
                    response = requests.get(cat_data["image"])
                    if response.status_code == 200:
                        cat.image.save(f"{cat.name.replace(' ', '_').lower()}.jpg", ContentFile(response.content), save=True)
                        self.stdout.write(self.style.SUCCESS(f'Created category: {cat.name}'))
                    else:
                        self.stdout.write(self.style.WARNING(f'Failed to download image for: {cat.name}'))

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error creating/saving image for {cat.name}: {e}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Category already exists: {cat.name}'))
