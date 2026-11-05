with open('backend/routers/products.py', 'r', encoding='utf-8') as f:
    content = f.read()

target = "        id=p.id,\n"
if "\r\n" in content:
    target = "        id=p.id,\r\n"
    newline = "\r\n"
else:
    newline = "\n"

replacement = target + "        product_id=getattr(p, \"product_id\", None) or f\"PROD-{p.id:04d}\"," + newline

if target in content:
    content = content.replace(target, replacement, 1)
    with open('backend/routers/products.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Updated format_product_response with product_id")
else:
    print("ERROR: Target not found")

