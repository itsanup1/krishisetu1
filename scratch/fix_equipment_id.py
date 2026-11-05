with open('backend/routers/equipment.py', 'r', encoding='utf-8') as f:
    content = f.read()

target = "        id=eq.id,\n"
if "\r\n" in content:
    target = "        id=eq.id,\r\n"
    newline = "\r\n"
else:
    newline = "\n"

replacement = target + "        rental_id=getattr(eq, \"rental_id\", None) or f\"EQ-{eq.id:04d}\"," + newline

if target in content:
    content = content.replace(target, replacement, 1)
    with open('backend/routers/equipment.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Updated format_equipment_response with rental_id")
else:
    print("ERROR: Target not found")

