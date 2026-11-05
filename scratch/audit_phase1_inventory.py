import sys
import json
sys.path.insert(0, r"c:\Users\DELL\Documents\Rohit\krishisetu")

from backend.database import engine
from sqlalchemy import text

def run_inventory():
    with engine.connect() as conn:
        print("=== DATABASE INVENTORY AUDIT ===")
        
        # 1. Tables in public schema
        tables_res = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)).fetchall()
        tables = [r[0] for r in tables_res]
        print(f"\n1. Public Tables Found ({len(tables)}):", tables)

        # 2. Row count per table
        print("\n2. Table Row Counts:")
        for t in tables:
            cnt = conn.execute(text(f"SELECT count(*) FROM public.{t}")).scalar()
            print(f"  - {t}: {cnt} rows")

        # 3. Columns, Types, Nullable
        print("\n3. Table Columns & Nullability:")
        for t in tables:
            cols = conn.execute(text(f"""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = '{t}'
                ORDER BY ordinal_position;
            """)).fetchall()
            print(f"\n  [{t}]")
            for c in cols:
                print(f"    - {c[0]}: {c[1]} (Nullable: {c[2]}, Default: {c[3]})")

        # 4. Primary Keys
        print("\n4. Primary Keys:")
        pks = conn.execute(text("""
            SELECT tc.table_name, ccu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu 
              ON tc.constraint_name = ccu.constraint_name
            WHERE tc.table_schema = 'public' AND tc.constraint_type = 'PRIMARY KEY'
            ORDER BY tc.table_name;
        """)).fetchall()
        for pk in pks:
            print(f"  - {pk[0]}.{pk[1]}")

        # 5. Foreign Keys
        print("\n5. Foreign Key Constraints:")
        fks = conn.execute(text("""
            SELECT
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name,
                rc.update_rule,
                rc.delete_rule
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.referential_constraints AS rc
              ON tc.constraint_name = rc.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
            WHERE tc.table_schema = 'public' AND tc.constraint_type = 'FOREIGN KEY'
            ORDER BY tc.table_name;
        """)).fetchall()
        for fk in fks:
            print(f"  - {fk[0]}.{fk[1]} -> {fk[2]}.{fk[3]} (ON UPDATE {fk[4]}, ON DELETE {fk[5]})")

        # 6. Check Constraints
        print("\n6. Check Constraints:")
        checks = conn.execute(text("""
            SELECT tc.table_name, tc.constraint_name, cc.check_clause
            FROM information_schema.table_constraints tc
            JOIN information_schema.check_constraints cc 
              ON tc.constraint_name = cc.constraint_name
            WHERE tc.table_schema = 'public'
            ORDER BY tc.table_name;
        """)).fetchall()
        for chk in checks:
            print(f"  - {chk[0]} ({chk[1]}): {chk[2]}")

        # 7. Indexes
        print("\n7. Indexes:")
        indexes = conn.execute(text("""
            SELECT tablename, indexname, indexdef
            FROM pg_indexes
            WHERE schemaname = 'public'
            ORDER BY tablename, indexname;
        """)).fetchall()
        for idx in indexes:
            print(f"  - {idx[0]}: {idx[1]} -> {idx[2]}")

        # 8. Triggers
        print("\n8. Triggers:")
        triggers = conn.execute(text("""
            SELECT event_object_table, trigger_name, action_timing, event_manipulation, action_statement
            FROM information_schema.triggers
            WHERE trigger_schema = 'public'
            ORDER BY event_object_table;
        """)).fetchall()
        for trg in triggers:
            print(f"  - On {trg[0]}: {trg[1]} ({trg[2]} {trg[3]}) -> {trg[4]}")

        # 9. Functions in public schema
        print("\n9. Custom Functions & Procedures in Public:")
        funcs = conn.execute(text("""
            SELECT routine_name, routine_type, data_type, security_type
            FROM information_schema.routines
            WHERE routine_schema = 'public'
            ORDER BY routine_name;
        """)).fetchall()
        for fn in funcs:
            print(f"  - {fn[0]} ({fn[1]} returning {fn[2]}, Security: {fn[3]})")

        # 10. RLS Status and Policies
        print("\n10. Row Level Security Policies:")
        rls_res = conn.execute(text("""
            SELECT tablename, rowsecurity
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename;
        """)).fetchall()
        for r in rls_res:
            print(f"  - Table {r[0]}: RLS Enabled = {r[1]}")

        policies = conn.execute(text("""
            SELECT tablename, policyname, roles, cmd, qual, with_check
            FROM pg_policies
            WHERE schemaname = 'public'
            ORDER BY tablename, policyname;
        """)).fetchall()
        print("\n  Policies:")
        for pol in policies:
            print(f"  - On {pol[0]}: \"{pol[1]}\" [CMD: {pol[3]}, ROLES: {pol[2]}] USING ({pol[4]}) WITH CHECK ({pol[5]})")

        # 11. Custom Enums
        print("\n11. Enums and Custom Types:")
        enums = conn.execute(text("""
            SELECT t.typname, e.enumlabel
            FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname = 'public'
            ORDER BY t.typname, e.enumsortorder;
        """)).fetchall()
        current_typ = None
        for en in enums:
            if en[0] != current_typ:
                current_typ = en[0]
                print(f"  - Enum {current_typ}:")
            print(f"      * {en[1]}")

        # 12. Database Views
        views = conn.execute(text("""
            SELECT table_name, view_definition
            FROM information_schema.views
            WHERE table_schema = 'public';
        """)).fetchall()
        print("\n12. Views:", [v[0] for v in views])

if __name__ == "__main__":
    run_inventory()

