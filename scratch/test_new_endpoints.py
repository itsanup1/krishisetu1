import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoints():
    print("=== TESTING NEW KRISHISETU ENDPOINTS ===")
    
    # 1. Login as Farmer
    r_login = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "farmer@krishisetu.com", "password": "farmer123"})
    assert r_login.status_code == 200, f"Login failed: {r_login.text}"
    token = r_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] Login as farmer@krishisetu.com succeeded.")

    # 2. Test Forgot Password
    print("\n2. Testing Forgot Password...")
    r_forgot = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={"email": "farmer2@krishisetu.com"})
    assert r_forgot.status_code == 200, f"Forgot password failed: {r_forgot.text}"
    data = r_forgot.json()
    reset_token = data.get("reset_token")
    assert reset_token is not None, "Expected reset_token in response"
    print(f"[PASS] Forgot password returned valid reset token for farmer2@krishisetu.com.")

    # 3. Test Reset Password
    print("\n3. Testing Reset Password with token...")
    r_reset = requests.post(f"{BASE_URL}/api/auth/reset-password", json={"token": reset_token, "new_password": "newpassword123"})
    assert r_reset.status_code == 200, f"Reset password failed: {r_reset.text}"
    print("[PASS] Reset password succeeded.")

    # Verify login with new password
    r_relogin = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "farmer2@krishisetu.com", "password": "newpassword123"})
    assert r_relogin.status_code == 200, f"Login with new password failed: {r_relogin.text}"
    print("[PASS] Login with new password succeeded.")

    # Reset it back to farmer123 for test continuity
    r_forgot2 = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={"email": "farmer2@krishisetu.com"})
    t2 = r_forgot2.json()["reset_token"]
    requests.post(f"{BASE_URL}/api/auth/reset-password", json={"token": t2, "new_password": "farmer123"})

    # 4. Test Farmer Dashboard Stats
    print("\n4. Testing Farmer Dashboard Stats...")
    r_farmer_stats = requests.get(f"{BASE_URL}/api/rentals/dashboard/farmer", headers=headers)
    assert r_farmer_stats.status_code == 200, f"Farmer stats failed: {r_farmer_stats.text}"
    print(f"[PASS] Farmer Dashboard Stats: {r_farmer_stats.json()}")

    # 5. Test Owner Dashboard Stats
    print("\n5. Testing Owner Dashboard Stats...")
    r_owner_stats = requests.get(f"{BASE_URL}/api/rentals/dashboard/owner", headers=headers)
    assert r_owner_stats.status_code == 200, f"Owner stats failed: {r_owner_stats.text}"
    print(f"[PASS] Owner Dashboard Stats: {r_owner_stats.json()}")

    # 6. Test Notifications Endpoint
    print("\n6. Testing Notifications Endpoint...")
    r_notifs = requests.get(f"{BASE_URL}/api/notifications", headers=headers)
    assert r_notifs.status_code == 200, f"Notifications failed: {r_notifs.text}"
    print(f"[PASS] Notifications count: {len(r_notifs.json())}")

    # 7. Test Price Filters on Equipment
    print("\n7. Testing Price Filters...")
    r_eq_filter = requests.get(f"{BASE_URL}/api/equipment?max_price=500", headers=headers)
    assert r_eq_filter.status_code == 200, f"Equipment filter failed: {r_eq_filter.text}"
    items = r_eq_filter.json()
    for item in items:
        assert item["rate"] <= 500, f"Item rate {item['rate']} > 500"
    print(f"[PASS] Equipment price filter (max_price=500): {len(items)} items returned, all <= 500.")

    # 8. Test Price Filters on Rentals Listings
    r_rent_filter = requests.get(f"{BASE_URL}/api/rentals/listings?max_price=1000", headers=headers)
    assert r_rent_filter.status_code == 200, f"Rental listing filter failed: {r_rent_filter.text}"
    rent_items = r_rent_filter.json()
    for item in rent_items:
        assert item["price_per_day"] <= 1000, f"Listing price {item['price_per_day']} > 1000"
    print(f"[PASS] Rentals price filter (max_price=1000): {len(rent_items)} items returned, all <= 1000.")

    print("\n>>> ALL TESTED NEW ENDPOINTS PASSED 100% <<<")

if __name__ == "__main__":
    test_endpoints()
