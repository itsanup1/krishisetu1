with open('backend/routers/auth.py', 'r', encoding='utf-8') as f:
    content = f.read()

target = "def register(user_in: UserCreate, db: Session = Depends(get_db)):\n"
if "\r\n" in content:
    target = "def register(user_in: UserCreate, db: Session = Depends(get_db)):\r\n"
    newline = "\r\n"
else:
    newline = "\n"

guard = (
    "    if user_in.role == UserRole.ADMIN:" + newline +
    "        raise HTTPException(" + newline +
    "            status_code=status.HTTP_403_FORBIDDEN," + newline +
    "            detail=\"Direct registration as ADMIN is not permitted.\"," + newline +
    "        )" + newline
)

replacement = target + guard
if target in content:
    new_content = content.replace(target, replacement, 1)
    with open('backend/routers/auth.py', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS: Guard added to auth.py")
else:
    print("ERROR: Target not found")

