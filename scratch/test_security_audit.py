import requests
import json

BASE_URL = "http://localhost:8000"

def test_security():
    print("=== TESTING SECURITY FIXES & AUDIT CHECKS ===")

    # 1. Test Admin Registration Exploit Prevention
    print("\n1. Testing direct ADMIN registration exploit...")
    payload = {
        "name": "Attacker Admin",
        "email": "attacker_admin_probe@example.com",
        "password": "Password123!",
        "phone": "9999999999",
        "role": "ADMIN",
        "location": "Probe"
    }
    r = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
    print(f"Status: {r.status_code}, Body: {r.text}")
    assert r.status_code == 403, f"Expected 403 Forbidden, got {r.status_code}"
    print("PASS: Direct registration as ADMIN is successfully blocked (403 Forbidden).")

    # 2. Test Farmer Registration
    print("\n2. Testing legitimate FARMER registration...")
    farmer_payload = {
        "name": "Security Test Farmer",
        "email": "sec_farmer_probe@example.com",
        "password": "Password123!",
        "phone": "9876543210",
        "role": "FARMER",
        "location": "Pune"
    }
    r_farmer = requests.post(f"{BASE_URL}/api/auth/register", json=farmer_payload)
    if r_farmer.status_code == 400: # Already exists from previous run
        r_login = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "sec_farmer_probe@example.com", "password": "Password123!"})
        token = r_login.json()["access_token"]
    else:
        assert r_farmer.status_code == 201, f"Expected 201 Created, got {r_farmer.status_code}"
        token = r_farmer.json()["access_token"]
    print("PASS: Legitimate user registration / login successful.")

    # 3. Test Unauthorized Role Escalation via Profile Update
    print("\n3. Testing role escalation attempt via PUT /api/auth/me...")
    headers = {"Authorization": f"Bearer {token}"}
    r_esc = requests.put(f"{BASE_URL}/api/auth/me", json={"name": "Hacked Farmer", "role": "ADMIN"}, headers=headers)
    print(f"Status: {r_esc.status_code}, Body: {r_esc.json()}")
    assert r_esc.json()["role"] == "FARMER", "CRITICAL: Role should NOT have changed to ADMIN!"
    print("PASS: Role escalation via PUT /api/auth/me is prevented. User remains FARMER.")

    # 4. Test Cross-Tenant Machinery Modification
    print("\n4. Testing cross-tenant equipment listing edit...")
    # Owner 1 owns listing 1. Let's see if our new test farmer can modify listing 1.
    r_hack_listing = requests.put(f"{BASE_URL}/api/rentals/listings/1", json={"price_per_day": 10}, headers=headers)
    print(f"Status: {r_hack_listing.status_code}, Body: {r_hack_listing.text}")
    assert r_hack_listing.status_code in [401, 403], f"Expected 403 Forbidden, got {r_hack_listing.status_code}"
    print("PASS: Cross-tenant listing modification is blocked with 403 Forbidden.")

    # 5. Test Cross-Tenant Payment Record Snooping
    print("\n5. Testing cross-tenant rental payment inspection...")
    # Rental 8 belongs to farmer 2 and owner 2. Let's see if sec_farmer can snoop payment records for rental 8.
    r_snoop_payment = requests.get(f"{BASE_URL}/api/rentals/records/8/payments", headers=headers)
    print(f"Status: {r_snoop_payment.status_code}, Body: {r_snoop_payment.text}")
    assert r_snoop_payment.status_code in [401, 403], f"Expected 403 Forbidden, got {r_snoop_payment.status_code}"
    print("PASS: Cross-tenant payment snooping is blocked with 403 Forbidden.")

    print("\n=== ALL SECURITY VERIFICATION CHECKS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    test_security()

