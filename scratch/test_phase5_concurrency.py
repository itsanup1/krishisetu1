import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
sys.path.insert(0, r"c:\Users\DELL\Documents\Rohit\krishisetu")
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)

from datetime import date, timedelta
from backend.database import SessionLocal
from backend.models import User, EquipmentListing, RentalRecord, RentalQueue, RentalPayment
from backend.routers.rentals import compute_available_quantity

def test_concurrency_race():
    print("=== PHASE 5 CONCURRENCY TESTING: SIMULTANEOUS BOOKING & APPROVAL ===", flush=True)
    
    with SessionLocal() as db:
        owner = db.query(User).filter(User.email == "farmer@krishisetu.com").first()
        farmer_a = db.query(User).filter(User.email == "farmer2@krishisetu.com").first()
        farmer_b = db.query(User).filter(User.email == "farmer3@krishisetu.com").first()

        # Create a test listing with ONLY 1 TRACTOR
        test_listing = EquipmentListing(
            owner_id=owner.id,
            equipment_name="CONCURRENCY_TEST_TRACTOR_1_UNIT",
            category="TRACTOR",
            description="Testing race conditions with 1 unit capacity",
            specifications="50 HP 4WD",
            price_per_day=1000.0,
            total_quantity=1, # Exactly 1 machine
            location="Nashik",
            listing_status="active",
            rental_id="R_RACE_01"
        )
        db.add(test_listing)
        db.commit()
        db.refresh(test_listing)
        listing_id = test_listing.listing_id

        # Setup 2 pending rental requests for the EXACT SAME dates
        start_date = date.today() + timedelta(days=20)
        end_date = date.today() + timedelta(days=23)

        rental_a = RentalRecord(
            listing_id=listing_id,
            farmer_id=farmer_a.id,
            quantity_rented=1,
            rental_start_date=start_date,
            rental_end_date=end_date,
            rental_status="pending",
            total_amount=4000.0
        )
        rental_b = RentalRecord(
            listing_id=listing_id,
            farmer_id=farmer_b.id,
            quantity_rented=1,
            rental_start_date=start_date,
            rental_end_date=end_date,
            rental_status="pending",
            total_amount=4000.0
        )
        db.add_all([rental_a, rental_b])
        db.commit()
        db.refresh(rental_a)
        db.refresh(rental_b)
        rental_a_id = rental_a.rental_id
        rental_b_id = rental_b.rental_id

    print(f"Created Test Listing #{listing_id} with Total Quantity = 1", flush=True)
    print(f"Created Pending Rental A #{rental_a_id} and Rental B #{rental_b_id} for identical dates", flush=True)

    # Function executed concurrently by 2 worker threads simulating simultaneous approvals
    barrier = threading.Barrier(2)

    def attempt_approve(rental_id, worker_name):
        barrier.wait() # Synchronize threads so they hit the database at the exact same millisecond
        with SessionLocal() as session:
            try:
                # Row lock listing
                locked_listing = (
                    session.query(EquipmentListing)
                    .filter(EquipmentListing.listing_id == listing_id)
                    .with_for_update()
                    .first()
                )
                r = session.query(RentalRecord).filter(RentalRecord.rental_id == rental_id).first()
                avail = compute_available_quantity(
                    session, listing_id, r.rental_start_date, r.rental_end_date
                )
                if r.quantity_rented > avail:
                    return {
                        "worker": worker_name,
                        "rental_id": rental_id,
                        "success": False,
                        "error": f"Rejected: available quantity ({avail}) < requested ({r.quantity_rented})",
                        "available": avail
                    }

                r.rental_status = "approved"
                session.commit()
                return {
                    "worker": worker_name,
                    "rental_id": rental_id,
                    "success": True,
                    "message": "Approved successfully",
                    "available": avail
                }
            except Exception as exc:
                session.rollback()
                return {"worker": worker_name, "rental_id": rental_id, "success": False, "error": str(exc)}

    print("\nLaunching 2 simultaneous approval transactions via ThreadPoolExecutor...", flush=True)
    with ThreadPoolExecutor(max_workers=2) as executor:
        f1 = executor.submit(attempt_approve, rental_a_id, "Worker_A")
        f2 = executor.submit(attempt_approve, rental_b_id, "Worker_B")
        results = [f1.result(), f2.result()]

    print("\nConcurrent Execution Results:")
    for res in results:
        print(f"  [{res['worker']}] Rental #{res['rental_id']}: Success = {res['success']} -> {res.get('message') or res.get('error')}", flush=True)

    # Verification checks
    success_count = sum(1 for r in results if r["success"])
    failure_count = sum(1 for r in results if not r["success"])

    with SessionLocal() as db:
        final_avail = compute_available_quantity(db, listing_id, start_date, end_date)
        approved_count = (
            db.query(RentalRecord)
            .filter(
                RentalRecord.listing_id == listing_id,
                RentalRecord.rental_status == "approved"
            )
            .count()
        )
        print(f"\nFinal State Verification:")
        print(f"  - Total Approvals: {approved_count} (Expected: exactly 1)")
        print(f"  - Final Available Quantity: {final_avail} (Expected: exactly 0, never negative)")
        
        # Cleanup
        db.query(RentalRecord).filter(RentalRecord.listing_id == listing_id).delete()
        db.query(EquipmentListing).filter(EquipmentListing.listing_id == listing_id).delete()
        db.commit()

    assert success_count == 1, f"Expected 1 success, got {success_count}"
    assert failure_count == 1, f"Expected 1 failure, got {failure_count}"
    assert approved_count == 1, f"Expected 1 approved record, got {approved_count}"
    assert final_avail == 0, f"Expected 0 available, got {final_avail}"
    print("\n[PASS] CONCURRENCY & ROW-LOCKING VERIFICATION COMPLETED WITH 100% SUCCESS!", flush=True)

if __name__ == "__main__":
    test_concurrency_race()

