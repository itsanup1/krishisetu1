import sys, os
sys.path.append(os.getcwd())
from backend.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    cols = db.execute(text("""
        SELECT table_name, column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
    """)).fetchall()
    
    current_table = None
    for c in cols:
        if c[0] != current_table:
            current_table = c[0]
            print(f"\n--- TABLE: {current_table} ---")
        print(f"  {c[1]} ({c[2]}, nullable={c[3]})")
finally:
    db.close()

