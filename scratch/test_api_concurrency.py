import sys
import threading
import time
import requests
from datetime import date, timedelta
from concurrent.futures import ThreadPoolExecutor

BASE_URL = "http://localhost:8000"

def test_simultaneous_booking_race():
    print("=" * 60)
    print("TEST SUITE 3: CONCURRENCY RACE CONDITION (SIMULTANEOUS BOOKING)")
    print("=" * 60)

    # 1. Login owner and create a listing with EXACTLY 1 unit
    owner_creds = {"email": "farmer@krishisetu.com", "password": "farmer123"}
    owner_resp = requests.post(f"{BASE_URL}/api/auth/login", json=owner_creds)
    assert owner_resp.status_code == 200
    owner_token = owner_resp.json()["access_token"]
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    ts = int(time.time())
    new_listing = {
        "equipment_name": f"CONCURRENT_TRACTOR_{ts}",
        "category": "TRACTOR",
        "price_per_day": 2500.0,
        "location": "Nashik",
        "description": "High-demand tractor with exactly 1 unit available",
        "total_quantity": 1,
        "listing_status": "active"
    }
    create_resp = requests.post(f"{BASE_URL}/api/rentals/listings", json=new_listing, headers=owner_headers)
    assert create_resp.status_code == 201
    listing = create_resp.json()
    listing_id = listing["listing_id"]
    print(f"Created Listing #{listing_id} with Total Capacity = 1")

    # 2. Login Farmer A and Farmer B
    f_a_resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "farmer2@krishisetu.com", "password": "farmer123"})
    assert f_a_resp.status_code == 200
    token_a = f_a_resp.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    f_b_resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "farmer3@krishisetu.com", "password": "farmer123"})
    assert f_b_resp.status_code == 200
    token_b = f_b_resp.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. Create two pending rental requests for the same date range
    start_d = str(date.today() + timedelta(days=30))
    end_d = str(date.today() + timedelta(days=32))

    req_a = requests.post(f"{BASE_URL}/api/rentals/records", json={
        "listing_id": listing_id,
        "quantity_rented": 1,
        "rental_start_date": start_d,
        "rental_end_date": end_d
    }, headers=headers_a)
    assert req_a.status_code == 201
    rental_a_id = req_a.json()["rental_id"]

    req_b = requests.post(f"{BASE_URL}/api/rentals/records", json={
        "listing_id": listing_id,
        "quantity_rented": 1,
        "rental_start_date": start_d,
        "rental_end_date": end_d
    }, headers=headers_b)
    assert req_b.status_code == 201
    rental_b_id = req_b.json()["rental_id"]

    print(f"Pending Rental Requests created: Rental A #{rental_a_id}, Rental B #{rental_b_id}")
    print("Both request 1 unit for the same dates: " + start_d + " to " + end_d)

    # 4. Simulate simultaneous approval using ThreadPoolExecutor with a Barrier
    barrier = threading.Barrier(2)
    results = {}

    def approve_rental(rental_id, worker_tag):
        # Wait for both threads to hit the barrier at the exact same moment
        barrier.wait()
        r = requests.patch(
            f"{BASE_URL}/api/rentals/records/{rental_id}/status",
            json={"rental_status": "approved"},
            headers=owner_headers
        )
        results[worker_tag] = {
            "rental_id": rental_id,
            "status_code": r.status_code,
            "response": r.json()
        }

    print("\nTriggering 2 simultaneous approval transactions via ThreadPoolExecutor...")
    with ThreadPoolExecutor(max_workers=2) as executor:
        t1 = executor.submit(approve_rental, rental_a_id, "Farmer_A_Booking")
        t2 = executor.submit(approve_rental, rental_b_id, "Farmer_B_Booking")
        t1.result()
        t2.result()

    print("\nSimultaneous Execution Results:")
    for tag, res in results.items():
        print(f"  [{tag}] Rental #{res['rental_id']} -> HTTP {res['status_code']}: {res['response']}")

    # 5. Verify that EXACTLY ONE approval succeeded and the other was rejected
    statuses = [res["status_code"] for res in results.values()]
    assert 200 in statuses, "At least one booking should have been approved"
    assert 400 in statuses, "The competing booking MUST have been rejected with HTTP 400 due to insufficient availability"

    approved_worker = [tag for tag, res in results.items() if res["status_code"] == 200][0]
    rejected_worker = [tag for tag, res in results.items() if res["status_code"] == 400][0]

    print(f"\nVerification Results:")
    print(f"  [WINNER] {approved_worker} successfully secured the last unit (HTTP 200)")
    print(f"  [PREVENTED] {rejected_worker} safely blocked by SELECT FOR UPDATE lock (HTTP 400)")

    # 6. Check database availability
    avail_resp = requests.get(
        f"{BASE_URL}/api/rentals/listings/{listing_id}/availability",
        params={"start_date": start_d, "end_date": end_d}
    )
    assert avail_resp.status_code == 200
    avail_data = avail_resp.json()
    print(f"  Final Availability: total={avail_data['total_quantity']}, booked={avail_data['booked_quantity']}, available={avail_data['available_quantity']}")
    assert avail_data["available_quantity"] == 0, "Available quantity must be exactly 0 (no overbooking allowed)"

    print("\n" + "=" * 60)
    print(">>> CONCURRENCY RACE CONDITION TEST: 100% PASSED! <<<")
    print("=" * 60)

if __name__ == "__main__":
    test_simultaneous_booking_race()

