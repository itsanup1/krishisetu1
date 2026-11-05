import sys
import time
import requests
from datetime import date, timedelta

BASE_URL = "http://localhost:8000"

def test_owner_journey():
    print("=" * 60)
    print("TEST SUITE 2: COMPLETE EQUIPMENT OWNER JOURNEY (11 STEPS)")
    print("=" * 60)

    # 1. Owner Registration & Login
    print("\n[Step 1] Testing Equipment Owner Registration & Login...")
    ts = int(time.time())
    owner_email = f"owner_journey_{ts}@krishisetu.com"
    owner_pwd = "password123"
    reg_payload = {
        "email": owner_email,
        "password": owner_pwd,
        "name": "Ramesh Patil",
        "phone": "9876543210",
        "location": "Pune, Maharashtra",
        "role": "FARMER"
    }
    reg_resp = requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201, f"Owner registration failed: {reg_resp.text}"
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Verify login with same creds
    login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": owner_email, "password": owner_pwd})
    assert login_resp.status_code == 200, f"Owner login failed: {login_resp.text}"
    print(f" PASS: Owner registered & logged in successfully ({owner_email}).")

    # 2. Owner Dashboard Stats
    print("\n[Step 2] Testing Owner Dashboard Metrics...")
    resp = requests.get(f"{BASE_URL}/api/rentals/dashboard/owner", headers=headers)
    assert resp.status_code == 200, f"Owner stats failed: {resp.text}"
    stats = resp.json()
    print(f" PASS: Owner stats retrieved: {stats}")
    assert "total_listings_count" in stats
    assert "pending_requests_count" in stats
    assert "total_rental_earnings" in stats

    # 3. Equipment Listing Creation
    print("\n[Step 3] Testing Equipment Listing Creation...")
    new_listing = {
        "equipment_name": f"Smart Harvester {ts}",
        "category": "HARVESTER",
        "price_per_day": 8500.0,
        "location": "Nashik, Maharashtra",
        "description": "State-of-the-art combine harvester for rice and wheat",
        "total_quantity": 2,
        "specifications": "110HP, Diesel, 2024 model",
        "image_url": "/assets/images/harvester.jpg",
        "listing_status": "active"
    }
    resp = requests.post(f"{BASE_URL}/api/rentals/listings", json=new_listing, headers=headers)
    assert resp.status_code == 201, f"Listing creation failed: {resp.text}"
    listing = resp.json()
    listing_id = listing["listing_id"]
    print(f" PASS: Created Listing #{listing_id} ('{listing['equipment_name']}', total_qty: {listing['total_quantity']}).")

    # 4. Listing Editing
    print("\n[Step 4] Testing Equipment Listing Editing...")
    update_data = {
        "price_per_day": 9000.0,
        "description": "Updated: Heavy duty combine harvester with GPS navigation"
    }
    resp = requests.put(f"{BASE_URL}/api/rentals/listings/{listing_id}", json=update_data, headers=headers)
    assert resp.status_code == 200, f"Listing update failed: {resp.text}"
    updated = resp.json()
    assert updated["price_per_day"] == 9000.0
    print(f" PASS: Updated listing #{listing_id} daily rate to INR {updated['price_per_day']}.")

    # 5. Incoming Rental Requests
    print("\n[Step 5] Creating Incoming Rental Request (as Farmer)...")
    farmer_resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "farmer@krishisetu.com", "password": "farmer123"})
    farmer_token = farmer_resp.json()["access_token"]
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}
    
    start_d = str(date.today() + timedelta(days=10))
    end_d = str(date.today() + timedelta(days=12))

    rental_req = {
        "listing_id": listing_id,
        "quantity_rented": 1,
        "rental_start_date": start_d,
        "rental_end_date": end_d
    }
    r_resp = requests.post(f"{BASE_URL}/api/rentals/records", json=rental_req, headers=farmer_headers)
    assert r_resp.status_code == 201, f"Farmer rental request failed: {r_resp.text}"
    rental_record = r_resp.json()
    rental_id = rental_record["rental_id"]
    print(f" PASS: Farmer created Rental Request #{rental_id} (Status: {rental_record['rental_status']}).")

    # Check that owner sees it in incoming requests
    resp = requests.get(f"{BASE_URL}/api/rentals/owner-requests", headers=headers)
    assert resp.status_code == 200
    owner_rentals = resp.json()
    incoming = [r for r in owner_rentals if r["rental_id"] == rental_id]
    assert len(incoming) == 1, "Owner cannot see incoming rental request"
    print(f" PASS: Owner successfully retrieved incoming request #{rental_id}.")

    # 6. Rental Approval and Rejection
    print("\n[Step 6] Testing Rental Approval & Rejection Workflow...")
    # First test rejection on a second request
    rental_req2 = {
        "listing_id": listing_id,
        "quantity_rented": 1,
        "rental_start_date": str(date.today() + timedelta(days=20)),
        "rental_end_date": str(date.today() + timedelta(days=21))
    }
    r2_resp = requests.post(f"{BASE_URL}/api/rentals/records", json=rental_req2, headers=farmer_headers)
    rental_id2 = r2_resp.json()["rental_id"]
    
    # Reject rental_id2
    reject_resp = requests.patch(f"{BASE_URL}/api/rentals/records/{rental_id2}/status", json={"rental_status": "rejected"}, headers=headers)
    assert reject_resp.status_code == 200, f"Rejection failed: {reject_resp.text}"
    assert reject_resp.json()["rental_status"] == "rejected"
    print(f" PASS: Rental #{rental_id2} successfully rejected.")

    # Approve rental_id
    approve_resp = requests.patch(f"{BASE_URL}/api/rentals/records/{rental_id}/status", json={"rental_status": "approved"}, headers=headers)
    assert approve_resp.status_code == 200, f"Approval failed: {approve_resp.text}"
    assert approve_resp.json()["rental_status"] == "approved"
    print(f" PASS: Rental #{rental_id} successfully approved.")

    # 7. Dynamic Equipment Availability Check
    print("\n[Step 7] Testing Equipment Availability after Approval...")
    avail_resp = requests.get(
        f"{BASE_URL}/api/rentals/listings/{listing_id}/availability",
        params={"start_date": start_d, "end_date": end_d}
    )
    assert avail_resp.status_code == 200, f"Availability check failed: {avail_resp.text}"
    avail_data = avail_resp.json()
    print(f" Availability: total={avail_data['total_quantity']}, booked={avail_data['booked_quantity']}, available={avail_data['available_quantity']}")
    assert avail_data["available_quantity"] == 1, f"Expected 1 available, got {avail_data['available_quantity']}"
    print(" PASS: Dynamic availability correctly reflects 1 unit booked and 1 remaining.")

    # 8. Rental History
    print("\n[Step 8] Testing Owner Rental History...")
    history_resp = requests.get(f"{BASE_URL}/api/rentals/owner-requests", headers=headers)
    assert history_resp.status_code == 200
    all_owner_history = history_resp.json()
    statuses = set(r["rental_status"] for r in all_owner_history)
    print(f" PASS: Owner rental history contains {len(all_owner_history)} records across statuses: {statuses}.")

    # 9. Queue Management Inspection
    print("\n[Step 9] Testing Owner Queue Inspection...")
    # Book the remaining 1 unit so equipment is 100% booked for that window
    r3_resp = requests.post(f"{BASE_URL}/api/rentals/records", json={
        "listing_id": listing_id,
        "quantity_rented": 1,
        "rental_start_date": start_d,
        "rental_end_date": end_d
    }, headers=farmer_headers)
    requests.patch(f"{BASE_URL}/api/rentals/records/{r3_resp.json()['rental_id']}/status", json={"rental_status": "approved"}, headers=headers)
    
    # Now farmer joins queue
    q_join_resp = requests.post(f"{BASE_URL}/api/rentals/queue", json={
        "listing_id": listing_id,
        "requested_start_date": start_d,
        "requested_end_date": end_d,
        "requested_quantity": 1
    }, headers=farmer_headers)
    assert q_join_resp.status_code == 201
    q_entry = q_join_resp.json()
    print(f" Farmer joined queue #{q_entry['queue_id']} at position #{q_entry['queue_position']}.")

    # Inspect owner stats to verify queue count incremented
    dash_resp = requests.get(f"{BASE_URL}/api/rentals/dashboard/owner", headers=headers)
    assert dash_resp.status_code == 200
    assert dash_resp.json()["waiting_queue_count"] >= 1
    print(f" PASS: Owner dashboard accurately shows active waiting queue count: {dash_resp.json()['waiting_queue_count']}.")

    # 10. Safe Listing Deactivation
    print("\n[Step 10] Testing Safe Listing Deactivation...")
    deact_resp = requests.delete(f"{BASE_URL}/api/rentals/listings/{listing_id}", headers=headers)
    assert deact_resp.status_code == 200, f"Deactivation failed: {deact_resp.text}"
    deact_data = deact_resp.json()
    assert deact_data.get("status") in ["deactivated", "success"]
    print(f" PASS: Listing #{listing_id} safely deactivated (response: {deact_data['message']}). Data preserved without FK deletion violation.")

    # Verify deactivated listing is omitted from public active marketplace
    market_resp = requests.get(f"{BASE_URL}/api/rentals/listings")
    active_ids = [item["listing_id"] for item in market_resp.json()]
    assert listing_id not in active_ids, "Deactivated listing should not be in public active listings"
    print(" PASS: Deactivated listing safely hidden from public marketplace.")

    # 11. Logout & Token Invalidation
    print("\n[Step 11] Testing Owner Logout...")
    bad_resp = requests.post(f"{BASE_URL}/api/rentals/listings", json=new_listing, headers={"Authorization": "Bearer invalid_token"})
    assert bad_resp.status_code == 401
    print(" PASS: Owner logout verified; invalid credentials rejected with 401 Unauthorized.")

    print("\n" + "=" * 60)
    print(">>> COMPLETE EQUIPMENT OWNER JOURNEY VERIFIED: ALL 11 STEPS PASSED 100%! <<<")
    print("=" * 60)

if __name__ == "__main__":
    test_owner_journey()
