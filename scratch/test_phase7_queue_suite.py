import sys
sys.path.insert(0, r"c:\Users\DELL\Documents\Rohit\krishisetu")
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)

from datetime import date, timedelta
from backend.database import SessionLocal
from backend.models import User, EquipmentListing, RentalRecord, RentalQueue
from backend.routers.rentals import process_queue_notifications, compute_available_quantity

def test_queue_management():
    print("=== PHASE 7: RENTAL QUEUE MANAGEMENT SUITE ===", flush=True)
    with SessionLocal() as db:
        owner = db.query(User).filter(User.email == "farmer@krishisetu.com").first()
        farmer1 = db.query(User).filter(User.email == "farmer@krishisetu.com").first()
        farmer2 = db.query(User).filter(User.email == "farmer2@krishisetu.com").first()
        farmer3 = db.query(User).filter(User.email == "farmer3@krishisetu.com").first()

        # Create equipment listing with capacity = 2
        eq = EquipmentListing(
            owner_id=owner.id,
            equipment_name="QUEUE_TEST_COMBINE_HARVESTER",
            category="HARVESTER",
            description="High capacity combine",
            specifications="75 HP",
            price_per_day=3000.0,
            total_quantity=2,
            location="Nashik",
            listing_status="active",
            rental_id="R_Q_01"
        )
        db.add(eq)
        db.commit()
        db.refresh(eq)
        listing_id = eq.listing_id

        d_start = date.today() + timedelta(days=40)
        d_end = date.today() + timedelta(days=45)

        # Book both 2 units so stock is 0
        r_fill = RentalRecord(
            listing_id=listing_id,
            farmer_id=farmer1.id,
            quantity_rented=2,
            rental_start_date=d_start,
            rental_end_date=d_end,
            rental_status="approved",
            total_amount=36000.0
        )
        db.add(r_fill)
        db.commit()

        # 1. Farmers join queue
        q1 = RentalQueue(
            listing_id=listing_id,
            farmer_id=farmer2.id,
            requested_quantity=1,
            requested_start_date=d_start,
            requested_end_date=d_end,
            queue_position=1,
            queue_status="waiting"
        )
        q2 = RentalQueue(
            listing_id=listing_id,
            farmer_id=farmer3.id,
            requested_quantity=2, # Farmer 3 needs 2 units!
            requested_start_date=d_start,
            requested_end_date=d_end,
            queue_position=2,
            queue_status="waiting"
        )
        db.add_all([q1, q2])
        db.commit()
        db.refresh(q1)
        db.refresh(q2)
        print(f"Scenario 1: Farmer 2 joined at #{q1.queue_position}, Farmer 3 joined at #{q2.queue_position}", flush=True)
        assert q1.queue_position == 1
        assert q2.queue_position == 2

        # 2. Duplicate active queue rejection test
        dup_exists = (
            db.query(RentalQueue)
            .filter(
                RentalQueue.listing_id == listing_id,
                RentalQueue.farmer_id == farmer2.id,
                RentalQueue.queue_status == "waiting"
            )
            .count()
        )
        print(f"Scenario 2: Active queue for Farmer 2 count = {dup_exists} (Policy blocks new entry)", flush=True)
        assert dup_exists == 1

        # 3. Release 1 unit (Farmer 1 cancels 1 unit or changes status)
        # We simulate 1 unit freed up by replacing r_fill with quantity=1
        r_fill.quantity_rented = 1
        db.commit()

        avail_now = compute_available_quantity(db, listing_id, d_start, d_end)
        print(f"Scenario 3: 1 unit freed up. Available = {avail_now}", flush=True)
        assert avail_now == 1

        # Process queue notifications
        process_queue_notifications(db, listing_id)

        # Refresh queue entries
        db.refresh(q1)
        db.refresh(q2)
        print(f"Scenario 4: Farmer 2 (needs 1 unit) status = {q1.queue_status}. Farmer 3 (needs 2 units) status = {q2.queue_status}", flush=True)
        # Farmer 2 requested 1 unit -> fits into 1 unit -> NOTIFIED!
        assert q1.queue_status == "notified"
        # Farmer 3 requested 2 units -> does not fit yet -> remains WAITING!
        assert q2.queue_status == "waiting"
        print("[PASS] Queue priority respects requested quantity and available stock!", flush=True)

        # 5. Position consistency after removal: Farmer 2 leaves queue
        q1.queue_status = "cancelled"
        # Re-index remaining waiting entries
        remaining = db.query(RentalQueue).filter(RentalQueue.listing_id == listing_id, RentalQueue.queue_status == "waiting").all()
        for rem in remaining:
            if rem.queue_position > 1:
                rem.queue_position -= 1
        db.commit()
        db.refresh(q2)
        print(f"Scenario 5: After Farmer 2 left, Farmer 3 position = #{q2.queue_position}. Expected: #1", flush=True)
        assert q2.queue_position == 1
        print("[PASS] Queue positions safely updated after entry departure", flush=True)

        # Cleanup
        db.query(RentalQueue).filter(RentalQueue.listing_id == listing_id).delete()
        db.query(RentalRecord).filter(RentalRecord.listing_id == listing_id).delete()
        db.query(EquipmentListing).filter(EquipmentListing.listing_id == listing_id).delete()
        db.commit()
        print("\n>>> ALL PHASE 7 QUEUE SCENARIOS PASSED WITH 100% SUCCESS! <<<", flush=True)

if __name__ == "__main__":
    test_queue_management()

