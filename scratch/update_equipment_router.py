with open('backend/routers/equipment.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Update get_equipment signature and query
old_get = '''@router.get("", response_model=List[EquipmentResponse])
def get_equipment(
    type: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Equipment).outerjoin(User, Equipment.owner_id == User.id)'''

new_get = '''@router.get("", response_model=List[EquipmentResponse])
def get_equipment(
    type: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Equipment).outerjoin(User, Equipment.owner_id == User.id)
    query = query.filter(Equipment.availability_status != "DEACTIVATED")
    if min_price is not None:
        query = query.filter(Equipment.rate >= min_price)
    if max_price is not None:
        query = query.filter(Equipment.rate <= max_price)'''

assert old_get in code, "old_get not found"
code = code.replace(old_get, new_get, 1)

# Update delete_equipment to perform safe deactivation
old_del = '''@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipment(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    eq = db.query(Equipment).filter(Equipment.id == id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment not found")
    if eq.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete this equipment")

    db.delete(eq)
    db.commit()
    return None'''

new_del = '''@router.delete("/{id}")
def delete_equipment(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    eq = db.query(Equipment).filter(Equipment.id == id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment not found")
    if eq.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete this equipment")

    # Safe deactivation policy
    eq.availability_status = "DEACTIVATED"
    db.commit()
    return {"status": "success", "message": "Equipment listing successfully deactivated."}'''

assert old_del in code, "old_del not found"
code = code.replace(old_del, new_del, 1)

with open('backend/routers/equipment.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: backend/routers/equipment.py updated cleanly")
