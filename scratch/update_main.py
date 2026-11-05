with open('backend/main.py', 'r', encoding='utf-8') as f:
    code = f.read()

old_import = 'from backend.routers import auth, products, equipment, bookings, orders, payments, admin, rentals'
new_import = 'from backend.routers import auth, products, equipment, bookings, orders, payments, admin, rentals, notifications'
assert old_import in code, "old_import not found"
code = code.replace(old_import, new_import, 1)

old_mount = 'app.include_router(rentals.router)'
new_mount = 'app.include_router(rentals.router)\napp.include_router(notifications.router)'
assert old_mount in code, "old_mount not found"
code = code.replace(old_mount, new_mount, 1)

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: backend/main.py updated cleanly")
