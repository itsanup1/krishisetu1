import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)

from datetime import date, timedelta
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import SessionLocal
from backend.models import User, UserRole, EquipmentListing, RentalRecord, RentalPayment, RentalQueue
from backend.auth import create_access_token

def test_full_rental_module():
    # 1. Setup test users: Owner 1, Owner 2, Farmer 1, Farmer 2
    with SessionLocal() as db:
        owner1 = db.query(User).filter(User.email == "farmer@krishisetu.com").first()
        farmer1 = db.query(User).filter(User.email == "farmer2@krishisetu.com").first()
        
        owner2 = db.query(User).filter(User.email == "owner2@krishisetu.com").first()
        if not owner2:
            owner2 = User(
                name="Sanjay Patil (Owner 2)",
                email="owner2@krishisetu.com",
                hashed_password="demo",
                phone="9876500002",
                role=UserRole.FARMER,
                is_equipment_owner=True,
                location="Pune, Maharashtra",
            )
            db.add(owner2)
            db.commit()
            db.refresh(owner2)

        farmer2 = db.query(User).filter(User.email == "farmer3@krishisetu.com").first()
        if not farmer2:
            farmer2 = User(
                name="Deepak More (Farmer 3)",
                email="farmer3@krishisetu.com",
                hashed_password="demo",
                phone="9876500003",
                role=UserRole.FARMER,
                is_equipment_owner=False,
                location="Satara, Maharashtra",
            )
            db.add(farmer2)
            db.commit()
            db.refresh(farmer2)

        owner1_id = owner1.id
        token_owner1 = create_access_token({"sub": str(owner1.id), "role": owner1.role.value})
        token_owner2 = create_access_token({"sub": str(owner2.id), "role": owner2.role.value})
        token_farmer1 = create_access_token({"sub": str(farmer1.id), "role": farmer1.role.value})
        token_farmer2 = create_access_token({"sub": str(farmer2.id), "role": farmer2.role.value})

    headers_owner1 = {"Authorization": f"Bearer {token_owner1}"}
    headers_owner2 = {"Authorization": f"Bearer {token_owner2}"}
    headers_farmer1 = {"Authorization": f"Bearer {token_farmer1}"}
    headers_farmer2 = {"Authorization": f"Bearer {token_farmer2}"}

    client = TestClient(app)

    print("\n--- TEST SCENARIO 1: Owner creates an equipment listing ---")
    listing_payload = {
        "equipment_name": "Kubota Precision Rice Transplanter 4-Row",
        "category": "HARVESTER",
        "description": "High-speed diesel engine paddy transplanter with rotary planting arm.",
        "specifications": "4 rows, 30cm row spacing, 1.2 Ha/day capacity",
        "price_per_day": 1200.0,
        "total_quantity": 1,  # Only 1 machine available
        "location": "Nashik, Maharashtra",
        "listing_status": "active"
    }
    res = client.post("/api/rentals/listings", json=listing_payload, headers=headers_owner1)
    assert res.status_code == 201, f"Failed: {res.text}"
    listing_data = res.json()
    listing_id = listing_data["listing_id"]
    assert listing_data["owner_id"] == owner1_id
    assert listing_data["total_quantity"] == 1
    print(f"[PASS] Listing created successfully: ID {listing_id}, Rental ID: {listing_data['rental_id']}")

    print("\n--- TEST SCENARIO 2: Another owner cannot edit or delete that listing ---")
    edit_payload = {"equipment_name": "Hacked Name by Owner 2"}
    res = client.put(f"/api/rentals/listings/{listing_id}", json=edit_payload, headers=headers_owner2)
    assert res.status_code == 403, f"Expected 403 Forbidden, got {res.status_code}: {res.text}"
    print("[PASS] Security enforced: Owner 2 rejected with HTTP 403 on edit")

    res = client.delete(f"/api/rentals/listings/{listing_id}", headers=headers_owner2)
    assert res.status_code == 403, f"Expected 403 Forbidden, got {res.status_code}: {res.text}"
    print("[PASS] Security enforced: Owner 2 rejected with HTTP 403 on delete")

    print("\n--- TEST SCENARIO 3: Farmer can view available equipment ---")
    res = client.get(f"/api/rentals/listings/{listing_id}")
    assert res.status_code == 200
    assert res.json()["available_quantity"] == 1
    print(f"[PASS] Farmer viewed listing. Current available quantity: {res.json()['available_quantity']}")

    print("\n--- TEST SCENARIO 4: Farmer 1 requests equipment rental ---")
    start_date = str(date.today() + timedelta(days=10))
    end_date = str(date.today() + timedelta(days=12))  # 3 days: 10, 11, 12
    rental_payload = {
        "listing_id": listing_id,
        "quantity_rented": 1,
        "rental_start_date": start_date,
        "rental_end_date": end_date
    }
    res = client.post("/api/rentals/records", json=rental_payload, headers=headers_farmer1)
    assert res.status_code == 201, f"Failed: {res.text}"
    rental1 = res.json()
    rental1_id = rental1["rental_id"]
    assert rental1["total_amount"] == 3600.0, f"Expected 3600.0, got {rental1['total_amount']}"
    assert rental1["rental_status"] == "pending"
    print(f"[PASS] Rental requested: Rental ID {rental1_id}, Total calculated: INR {rental1['total_amount']}")

    print("\n--- TEST SCENARIO 5: Owner approves rental request ---")
    res = client.patch(f"/api/rentals/records/{rental1_id}/status", json={"rental_status": "approved"}, headers=headers_owner1)
    assert res.status_code == 200
    assert res.json()["rental_status"] == "approved"
    print("[PASS] Rental approved by Owner 1 successfully")

    print("\n--- TEST SCENARIO 6: Dynamic availability calculated correctly ---")
    res = client.get(f"/api/rentals/listings/{listing_id}/availability?start_date={start_date}&end_date={end_date}")
    assert res.status_code == 200
    avail_data = res.json()
    assert avail_data["available_quantity"] == 0, f"Expected 0, got {avail_data['available_quantity']}"
    print(f"[PASS] Available quantity for booked window: {avail_data['available_quantity']} (Booked: {avail_data['booked_quantity']})")

    print("\n--- TEST SCENARIO 7: Overbooking prevented for overlapping dates ---")
    res = client.post("/api/rentals/records", json=rental_payload, headers=headers_farmer2)
    assert res.status_code == 400
    assert "exceeds available quantity" in res.json()["detail"].lower()
    print("[PASS] Overbooking blocked! Response: " + res.json()["detail"])

    print("\n--- TEST SCENARIO 8: Rental payment record created and linked ---")
    payment_payload = {
        "rental_id": rental1_id,
        "amount": 3600.0,
        "payment_method": "RAZORPAY",
        "transaction_reference": f"pay_test_{listing_id}_{rental1_id}"
    }
    res = client.post("/api/rentals/payments", json=payment_payload, headers=headers_farmer1)
    assert res.status_code == 201
    payment_data = res.json()
    payment_id = payment_data["payment_id"]
    assert payment_data["payment_status"] == "successful"
    print(f"[PASS] Payment record linked to Rental {rental1_id}: Payment ID {payment_id}")

    print("\n--- TEST SCENARIO 9: Farmer 2 cannot view Farmer 1's payment records ---")
    res = client.get(f"/api/rentals/records/{rental1_id}/payments", headers=headers_farmer2)
    assert res.status_code == 403
    print("[PASS] Privacy security enforced: Farmer 2 rejected with HTTP 403 on payment records")

    print("\n--- TEST SCENARIO 10: Farmer 2 joins waiting queue for unavailable equipment ---")
    queue_payload = {
        "listing_id": listing_id,
        "requested_quantity": 1,
        "requested_start_date": start_date,
        "requested_end_date": end_date
    }
    res = client.post("/api/rentals/queue", json=queue_payload, headers=headers_farmer2)
    assert res.status_code == 201
    queue_data = res.json()
    queue_id = queue_data["queue_id"]
    assert queue_data["queue_position"] == 1
    assert queue_data["queue_status"] == "waiting"
    print(f"[PASS] Farmer 2 joined waiting queue: Position #{queue_data['queue_position']}, Status: {queue_data['queue_status']}")

    print("\n--- TEST SCENARIO 11: Duplicate active queue prevented ---")
    res = client.post("/api/rentals/queue", json=queue_payload, headers=headers_farmer2)
    assert res.status_code == 400
    print("[PASS] Duplicate queue rejected with HTTP 400")

    print("\n--- TEST SCENARIO 12: Cancellation/completion triggers queue notification ---")
    res = client.patch(f"/api/rentals/records/{rental1_id}/status", json={"rental_status": "cancelled"}, headers=headers_farmer1)
    assert res.status_code == 200
    
    # Check queue status for farmer 2
    res = client.get("/api/rentals/my-queue", headers=headers_farmer2)
    assert res.status_code == 200
    entries = res.json()
    notified_entry = next((e for e in entries if e["queue_id"] == queue_id), None)
    assert notified_entry is not None
    assert notified_entry["queue_status"] == "notified", f"Expected notified, got {notified_entry['queue_status']}"
    print(f"[PASS] Eligible Farmer 2 automatically notified! Queue status: {notified_entry['queue_status']}")

    print("\n--- TEST SCENARIO 13: Safe deactivation policy on deletion ---")
    client.delete(f"/api/rentals/queue/{queue_id}", headers=headers_farmer2)
    res = client.delete(f"/api/rentals/listings/{listing_id}", headers=headers_owner1)
    assert res.status_code == 200
    print("[PASS] Safe deactivation executed successfully:", res.json())

    # Clean up test rows
    with SessionLocal() as db:
        db.query(RentalPayment).filter(RentalPayment.rental_id == rental1_id).delete()
        db.query(RentalQueue).filter(RentalQueue.listing_id == listing_id).delete()
        db.query(RentalRecord).filter(RentalRecord.listing_id == listing_id).delete()
        db.query(EquipmentListing).filter(EquipmentListing.listing_id == listing_id).delete()
        db.commit()

    print("\n>>> ALL 14 TEST SCENARIOS PASSED WITH 100% SUCCESS! <<<")

if __name__ == "__main__":
    test_full_rental_module()
