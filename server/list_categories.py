
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Category
print(f"Total Categories: {Category.objects.count()}")
for c in Category.objects.all():
    print(f"ID: {c.id}, Name: '{c.name}', Slug: '{c.slug}', Image: '{c.image}'")
