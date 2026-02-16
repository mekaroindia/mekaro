
import os
import django
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

try:
    from products.models import Category
    print("Category model imported successfully.")
    print("Category fields:", [f.name for f in Category._meta.get_fields()])
    
    # Try to access simple count
    print("Category count:", Category.objects.count())
    
    # Try to create one
    cat = Category(name="TestCat", slug="test-cat")
    # Don't save, just check instantiation
    print("Category instantiated.")
    
except Exception:
    traceback.print_exc()
