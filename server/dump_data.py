
import sqlite3

db_path = 'd:\\ecomm-django-react\\server\\db.sqlite3'

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products_category")
    rows = cursor.fetchall()
    print("Data in products_category:")
    for row in rows:
        print(row)
    conn.close()
except Exception as e:
    print(f"Error: {e}")
