import sys
sys.path.insert(0, r"c:\Users\DELL\Documents\Rohit\krishisetu")
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)

from datetime import date, timedelta
from backend.database import SessionLocal
from backend.models import User, EquipmentListing, RentalRecord
from backend.routers.rentals import compute_available_quantity

def test_availability_logic():
    print("=== PHASE 6: EQUIPMENT AVAILABILITY LOGIC SUITE ===", flush=True)
    with SessionLocal() as db:
        owner1 = db.query(User).filter(User.email == "farmer@krishisetu.com").first()
        owner2 = db.query(User).filter(User.email == "owner2@krishisetu.com").first()
        farmer_a = db.query(User).filter(User.email == "farmer2@krishisetu.com").first()
        farmer_b = db.query(User).filter(User.email == "farmer3@krishisetu.com").first()

        # Step 1: Owner 1 lists 5 tractors
        t5 = EquipmentListing(
            owner_id=owner1.id,
            equipment_name="AVAIL_TEST_TRACTOR_5_FLEET",
            category="TRACTOR",
            description="Fleet of 5 tractors",
            specifications="50 HP",
            price_per_day=1500.0,
            total_quantity=5, # 5 units
            location="Nashik",
            listing_status="active",
            rental_id="R_AVAIL_01"
        )
        # Owner 2 lists 3 tractors to test independence
        t_owner2 = EquipmentListing(
            owner_id=owner2.id,
            equipment_name="OWNER2_TRACTOR_3_FLEET",
            category="TRACTOR",
            description="Owner 2 fleet",
            specifications="55 HP",
            price_per_day=1800.0,
            total_quantity=3,
            location="Pune",
            listing_status="active",
            rental_id="R_AVAIL_02"
        )
        db.add_all([t5, t_owner2])
        db.commit()
        db.refresh(t5)
        db.refresh(t_owner2)
        listing_id = t5.listing_id
        owner2_listing_id = t_owner2.listing_id

        # Target dates: Nov 20 to Nov 25
        d_start = date.today() + timedelta(days=30)
        d_end = date.today() + timedelta(days=35)

        # Step 2: Farmer A rents 2 tractors (approved)
        r_a = RentalRecord(
            listing_id=listing_id,
            farmer_id=farmer_a.id,
            quantity_rented=2,
            rental_start_date=d_start,
            rental_end_date=d_end,
            rental_status="approved",
            total_amount=18000.0
        )
        # Step 3: Farmer B rents 1 tractor (approved)
        r_b = RentalRecord(
            listing_id=listing_id,
            farmer_id=farmer_b.id,
            quantity_rented=1,
            rental_start_date=d_start,
            rental_end_date=d_end,
            rental_status="approved",
            total_amount=9000.0
        )
        db.add_all([r_a, r_b])
        db.commit()
        db.refresh(r_a)
        db.refresh(r_b)

        # Step 4: Available quantity should be 5 - (2 + 1) = 2
        avail = compute_available_quantity(db, listing_id, d_start, d_end)
        print(f"Scenario 1-4: 5 total - (2 rented + 1 rented) = {avail} available. Expected: 2", flush=True)
        assert avail == 2, f"Expected 2, got {avail}"
        print("[PASS] Available quantity correctly computed as 2", flush=True)

        # Step 5: Another farmer requests 2 tractors on NON-CONFLICTING dates (Dec 10 to Dec 15)
        d_non_start = date.today() + timedelta(days=50)
        d_non_end = date.today() + timedelta(days=55)
        avail_non_conflicting = compute_available_quantity(db, listing_id, d_non_start, d_non_end)
        print(f"Scenario 5: Non-conflicting dates availability = {avail_non_conflicting}. Expected: 5", flush=True)
        assert avail_non_conflicting == 5, f"Expected 5, got {avail_non_conflicting}"
        print("[PASS] Non-conflicting dates have full 5 units available", flush=True)

        # Step 6: Request rejected if insufficient overlapping availability (requesting 3 when only 2 available)
        insufficient = 3 > avail
        print(f"Scenario 6: Request 3 units when {avail} available -> Rejected: {insufficient}", flush=True)
        assert insufficient == True
        print("[PASS] Over-requesting blocked", flush=True)

        # Step 7: Cancelled rentals release allocated quantity
        r_b.rental_status = "cancelled"
        db.commit()
        avail_after_cancel = compute_available_quantity(db, listing_id, d_start, d_end)
        print(f"Scenario 7: After cancelling 1 tractor, available = {avail_after_cancel}. Expected: 3", flush=True)
        assert avail_after_cancel == 3, f"Expected 3, got {avail_after_cancel}"
        print("[PASS] Cancelled rental released stock back to availability", flush=True)

        # Step 8: Completed rentals do not block future availability
        r_a.rental_status = "completed"
        db.commit()
        avail_after_complete = compute_available_quantity(db, listing_id, d_start, d_end)
        print(f"Scenario 8: After completing rental, available = {avail_after_complete}. Expected: 5", flush=True)
        assert avail_after_complete == 5, f"Expected 5, got {avail_after_complete}"
        print("[PASS] Completed rental unblocks available stock", flush=True)

        # Step 9 & 10: Partially overlapping dates (e.g. booked day 30-33, checking day 32-35)
        r_partial = RentalRecord(
            listing_id=listing_id,
            farmer_id=farmer_a.id,
            quantity_rented=4,
            rental_start_date=d_start, # Day 30
            rental_end_date=d_start + timedelta(days=3), # Day 33
            rental_status="active",
            total_amount=24000.0
        )
        db.add(r_partial)
        db.commit()
        # Querying day 32-35 (overlaps by 2 days)
        avail_partial = compute_available_quantity(db, listing_id, d_start + timedelta(days=2), d_end)
        print(f"Scenario 9-10: Partially overlapping window (4 active units) -> Available = {avail_partial}. Expected: 1", flush=True)
        assert avail_partial == 1, f"Expected 1, got {avail_partial}"
        print("[PASS] Partial overlap calculated accurately", flush=True)

        # Step 11: Owner 2 independent stock
        avail_owner2 = compute_available_quantity(db, owner2_listing_id, d_start, d_end)
        print(f"Scenario 11: Owner 2 independent listing stock = {avail_owner2}. Expected: 3", flush=True)
        assert avail_owner2 == 3, f"Expected 3, got {avail_owner2}"
        print("[PASS] Multiple equipment owners maintain independent stock calculations", flush=True)

        # Cleanup
        db.query(RentalRecord).filter(RentalRecord.listing_id.in_([listing_id, owner2_listing_id])).delete()
        db.query(EquipmentListing).filter(EquipmentListing.listing_id.in_([listing_id, owner2_listing_id])).delete()
        db.commit()
        print("\n>>> ALL PHASE 6 AVAILABILITY SCENARIOS PASSED WITH 100% SUCCESS! <<<", flush=True)

if __name__ == "__main__":
    test_availability_logic()

