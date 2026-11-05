import sys, os
sys.path.append(os.getcwd())
from backend.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    print("=== 1. ALL TABLES IN PUBLIC SCHEMA ===")
    tables = db.execute(text("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    """)).fetchall()
    table_names = [t[0] for t in tables]
    for t in table_names:
        count = db.execute(text(f'SELECT count(*) FROM "{t}";')).scalar()
        print(f" - {t}: {count} rows")

    print("\n=== 2. FOREIGN KEYS ===")
    fks = db.execute(text("""
        SELECT
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
        ORDER BY tc.table_name, kcu.column_name;
    """)).fetchall()
    for fk in fks:
        print(f" {fk[0]}.{fk[1]} -> {fk[2]}.{fk[3]} ({fk[4]})")

    print("\n=== 3. RLS STATUS & POLICIES ===")
    rls = db.execute(text("""
        SELECT tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
    """)).fetchall()
    for r in rls:
        print(f" Table {r[0]}: RLS Enabled = {r[1]}")

    policies = db.execute(text("""
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
        FROM pg_policies
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname;
    """)).fetchall()
    print(f"\nTotal RLS Policies found: {len(policies)}")
    for p in policies:
        print(f" Policy [{p[1]}]: '{p[2]}' CMD={p[5]} ROLES={p[4]}")

    print("\n=== 4. TRIGGERS & FUNCTIONS IN PUBLIC ===")
    triggers = db.execute(text("""
        SELECT trigger_name, event_manipulation, event_object_table, action_statement
        FROM information_schema.triggers
        WHERE trigger_schema = 'public'
        ORDER BY event_object_table, trigger_name;
    """)).fetchall()
    print(f"Total Triggers: {len(triggers)}")
    for tr in triggers:
        print(f" Trigger [{tr[2]}]: '{tr[0]}' Event={tr[1]}")

finally:
    db.close()
