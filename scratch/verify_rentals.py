import sys
sys.path.insert(0, '.')
from backend.database import engine
from sqlalchemy import text

def verify():
    with engine.connect() as conn:
        print("=== rental_payments columns ===")
        cols = conn.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'rental_payments'
            ORDER BY ordinal_position;
        """)).fetchall()
        for c in cols:
            print(f"  {c[0]} ({c[1]})")

        print("\n=== rental_payments rows ===")
        rows = conn.execute(text("SELECT * FROM rental_payments")).fetchall()
        for r in rows:
            print(f"  {r}")

        print("\n=== Constraints & Checks ===")
        checks = conn.execute(text("""
            SELECT tc.table_name, tc.constraint_name, cc.check_clause
            FROM information_schema.table_constraints tc
            JOIN information_schema.check_constraints cc 
              ON tc.constraint_name = cc.constraint_name
            WHERE tc.table_schema = 'public'
            ORDER BY tc.table_name;
        """)).fetchall()
        for chk in checks:
            print(f"  [{chk[0]}] {chk[1]}: {chk[2]}")

if __name__ == "__main__":
    verify()

