
import sqlite3
import os

# Path to db.sqlite3
db_path = 'd:\\ecomm-django-react\\server\\db.sqlite3'

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(products_category)")
    columns = cursor.fetchall()
    print("Table: products_category")
    for col in columns:
        print(col)
    conn.close()
except Exception as e:
    print(f"Error: {e}")
