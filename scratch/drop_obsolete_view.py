import sys, os
sys.path.append(os.getcwd())
from backend.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    print("Checking rental_items view...")
    res = db.execute(text("""
        SELECT table_name, table_type 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'rental_items';
    """)).fetchall()
    print("Found:", res)
    if res:
        print("Dropping view rental_items safely (DROP VIEW IF EXISTS rental_items)...")
        db.execute(text("DROP VIEW IF EXISTS rental_items;"))
        db.commit()
        print("[PASS] Obsolete view rental_items dropped successfully!")
    else:
        print("rental_items view already gone.")
except Exception as e:
    db.rollback()
    print(f"Error: {e}")
    sys.exit(1)
finally:
    db.close()
