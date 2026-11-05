import sys, os
sys.path.append(os.getcwd())
from backend.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    print("=== INDEXES ON 4 RENTAL TABLES ===")
    res = db.execute(text("""
        SELECT 
            tablename, 
            indexname, 
            indexdef 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
          AND tablename IN ('equipment_listings', 'rental_records', 'rental_payments', 'rental_queue')
        ORDER BY tablename, indexname;
    """)).fetchall()
    for row in res:
        print(f"Table: {row[0]} | Index: {row[1]} | Def: {row[2]}")
finally:
    db.close()

