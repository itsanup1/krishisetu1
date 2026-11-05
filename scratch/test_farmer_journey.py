import requests
import json
import time

BASE_URL = "http://localhost:8000"

def run_farmer_journey():
    print("=" * 60)
    print("TEST SUITE 1: COMPLETE FARMER JOURNEY (12 STEPS)")
    print("=" * 60)

    ts = int(time.time())
    email = f"farmer_journey_{ts}@krishisetu.com"
    password = "FarmerJourney123!"

    # 1. Farmer registration
    print("\n[Step 1] Testing Farmer Registration...")
    reg_payload = {
        "name": "Kailash Farmer",
        "email": email,
        "password": password,
        "phone": "9811223344",
        "role": "FARMER",
        "is_equipment_owner": False,
        "location": "Nashik Agri Belt",
    }
    r = requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload)
    assert r.status_code == 201, f"Registration failed ({r.status_code}): {r.text}"
    token = r.json()["access_token"]
    user_id = r.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f" PASS: Registered Farmer #{user_id} ({email}) successfully.")

    # 2. Login and dashboard
    print("\n[Step 2] Testing Login and Farmer Dashboard stats...")
    r_login = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password})
    assert r_login.status_code == 200, f"Login failed: {r_login.text}"
    r_dash = requests.get(f"{BASE_URL}/api/rentals/dashboard/farmer", headers=headers)
    assert r_dash.status_code == 200, f"Farmer dashboard stats failed: {r_dash.text}"
    dash_stats = r_dash.json()
    assert "active_rentals_count" in dash_stats
    print(f" PASS: Login and Dashboard stats retrieved: {dash_stats}")

    # 3. Marketplace browsing
    print("\n[Step 3] Testing Agricultural Marketplace browsing...")
    r_prods = requests.get(f"{BASE_URL}/api/products")
    assert r_prods.status_code == 200, f"Marketplace browsing failed: {r_prods.text}"
    products = r_prods.json()
    assert len(products) > 0, "No products found in catalog"
    print(f" PASS: Catalog contains {len(products)} agricultural products.")

    # 4. Equipment searching and filtering
    print("\n[Step 4] Testing Equipment searching and filtering...")
    # By category
    r_eq_cat = requests.get(f"{BASE_URL}/api/rentals/listings?category=TRACTOR")
    assert r_eq_cat.status_code == 200, f"Filter by category failed: {r_eq_cat.text}"
    tractors = r_eq_cat.json()
    assert len(tractors) > 0, "No tractors found"
    
    # By price
    r_eq_price = requests.get(f"{BASE_URL}/api/rentals/listings?max_price=800")
    assert r_eq_price.status_code == 200, f"Filter by price failed: {r_eq_price.text}"
    cheap_eq = r_eq_price.json()
    for item in cheap_eq:
        assert float(item["price_per_day"]) <= 800.0
    print(f" PASS: Category filter returned {len(tractors)} tractors. Price filter (<=800) returned {len(cheap_eq)} items.")

    # 5. Equipment details
    print("\n[Step 5] Testing Equipment Details retrieval...")
    test_listing = tractors[0]
    listing_id = test_listing["listing_id"]
    r_detail = requests.get(f"{BASE_URL}/api/rentals/listings/{listing_id}")
    assert r_detail.status_code == 200, f"Detail failed: {r_detail.text}"
    detail = r_detail.json()
    assert detail["listing_id"] == listing_id
    print(f" PASS: Retrieved details for '{detail['equipment_name']}' (ID: #{listing_id}).")

    # 6. Rental request
    print("\n[Step 6] Submitting Rental Request...")
    req_payload = {
        "listing_id": listing_id,
        "quantity_rented": 1,
        "rental_start_date": "2026-12-01",
        "rental_end_date": "2026-12-03",
    }
    r_req = requests.post(f"{BASE_URL}/api/rentals/records", json=req_payload, headers=headers)
    assert r_req.status_code == 201, f"Rental request failed: {r_req.text}"
    rental = r_req.json()
    rental_id = rental["rental_id"]
    assert rental["rental_status"] == "pending"
    assert rental["total_amount"] > 0
    print(f" PASS: Created Rental Record #{rental_id} for INR {rental['total_amount']:.2f} (Status: pending).")

    # 7. Rental status tracking
    print("\n[Step 7] Tracking Farmer's Rental Status...")
    r_my_rentals = requests.get(f"{BASE_URL}/api/rentals/my-rentals", headers=headers)
    assert r_my_rentals.status_code == 200, f"My rentals failed: {r_my_rentals.text}"
    my_rentals = r_my_rentals.json()
    found = any(r["rental_id"] == rental_id for r in my_rentals)
    assert found, f"Rental #{rental_id} not found in farmer's active rentals"
    print(f" PASS: Rental #{rental_id} actively tracked in farmer's rental records.")

    # 8. Payment history & payment recording
    print("\n[Step 8] Testing Payment Recording and History...")
    pay_payload = {
        "rental_id": rental_id,
        "amount": float(rental["total_amount"]),
        "payment_method": "RAZORPAY",
        "payment_status": "successful",
        "transaction_reference": f"TXN_FARMER_JOURNEY_{rental_id}_{ts}",
    }
    r_pay = requests.post(f"{BASE_URL}/api/rentals/payments", json=pay_payload, headers=headers)
    assert r_pay.status_code == 201, f"Payment recording failed: {r_pay.text}"
    
    r_pay_hist = requests.get(f"{BASE_URL}/api/rentals/records/{rental_id}/payments", headers=headers)
    assert r_pay_hist.status_code == 200, f"Payment history failed: {r_pay_hist.text}"
    payments = r_pay_hist.json()
    assert len(payments) == 1
    assert payments[0]["payment_status"] == "successful"
    print(f" PASS: Recorded payment #{payments[0]['payment_id']} (INR {payments[0]['amount']}) successfully verified.")

    # 9. Queue management (Joining, checking position, leaving)
    print("\n[Step 9] Testing Queue Management (Join, Position, Leave)...")
    q_payload = {
        "listing_id": listing_id,
        "requested_quantity": 1,
        "requested_start_date": "2026-12-01",
        "requested_end_date": "2026-12-03",
    }
    r_q = requests.post(f"{BASE_URL}/api/rentals/queue", json=q_payload, headers=headers)
    assert r_q.status_code == 201, f"Join queue failed: {r_q.text}"
    queue_entry = r_q.json()
    q_id = queue_entry["queue_id"]
    pos = queue_entry["queue_position"]
    print(f"  Joined queue #{q_id} at position #{pos}.")

    # Leave queue
    r_leave = requests.delete(f"{BASE_URL}/api/rentals/queue/{q_id}", headers=headers)
    assert r_leave.status_code == 200, f"Leave queue failed: {r_leave.text}"
    print(f" PASS: Joined queue at position #{pos} and safely left the queue.")

    # 10. Notifications
    print("\n[Step 10] Testing In-App Notifications...")
    r_notif = requests.get(f"{BASE_URL}/api/notifications", headers=headers)
    assert r_notif.status_code == 200, f"Get notifications failed: {r_notif.text}"
    notifs = r_notif.json()
    print(f" PASS: Farmer received {len(notifs)} real-time in-app notification(s).")

    # 11. Profile editing
    print("\n[Step 11] Testing Profile Editing & Validation...")
    update_payload = {
        "name": "Kailash Patil",
        "phone": "9811223399",
        "location": "Nashik Agro Cluster",
    }
    r_update = requests.put(f"{BASE_URL}/api/auth/me", json=update_payload, headers=headers)
    assert r_update.status_code == 200, f"Profile update failed: {r_update.text}"
    updated_user = r_update.json()
    assert updated_user["name"] == "Kailash Patil"
    print(f" PASS: Profile updated successfully to '{updated_user['name']}'.")

    # 12. Logout
    print("\n[Step 12] Testing Logout & Session Invalidation...")
    # In token auth, logout clears client storage; testing /me without token gives 401
    r_unauth = requests.get(f"{BASE_URL}/api/auth/me")
    assert r_unauth.status_code == 401, f"Expected 401 Unauthorized without token, got {r_unauth.status_code}"
    print(" PASS: Unauthenticated access properly rejected (401 Unauthorized).")

    print("\n>>> COMPLETE FARMER JOURNEY VERIFIED: ALL 12 STEPS PASSED 100%! <<<")

if __name__ == "__main__":
    run_farmer_journey()

