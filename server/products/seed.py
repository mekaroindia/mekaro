from .models import Product, Category

def run():
    cat, _ = Category.objects.get_or_create(name="General", slug="general")

    sample_products = [
        {"title": "Wireless Headphones", "price": 1999, "stock": 50},
        {"title": "Smart Watch", "price": 3499, "stock": 40},
        {"title": "Fitness Band", "price": 1299, "stock": 60},
        {"title": "Bluetooth Speaker", "price": 2499, "stock": 30},
    ]

    for p in sample_products:
        Product.objects.create(
            title=p["title"],
            description="Sample description",
            price=p["price"],
            stock=p["stock"],
            images=["https://picsum.photos/300"],
            category=cat
        )

    print("Seed data added!")
