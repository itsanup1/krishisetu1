import sys
sys.path.insert(0, r"c:\Users\DELL\Documents\Rohit\krishisetu")
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)

from datetime import date, timedelta, datetime
from backend.database import SessionLocal
from backend.models import User, EquipmentListing, RentalRecord, RentalPayment
from sqlalchemy.exc import IntegrityError

def test_payment_management():
    print("=== PHASE 8: PAYMENT MANAGEMENT SUITE ===", flush=True)
    with SessionLocal() as db:
        owner = db.query(User).filter(User.email == "farmer@krishisetu.com").first()
        farmer = db.query(User).filter(User.email == "farmer2@krishisetu.com").first()

        eq = EquipmentListing(
            owner_id=owner.id,
            equipment_name="PAYMENT_TEST_TRACTOR",
            category="TRACTOR",
            description="Testing payment integrity",
            specifications="50 HP",
            price_per_day=2000.0,
            total_quantity=1,
            location="Nashik",
            listing_status="active",
            rental_id="R_PAY_01"
        )
        db.add(eq)
        db.commit()
        db.refresh(eq)

        r = RentalRecord(
            listing_id=eq.listing_id,
            farmer_id=farmer.id,
            quantity_rented=1,
            rental_start_date=date.today() + timedelta(days=60),
            rental_end_date=date.today() + timedelta(days=62),
            rental_status="approved",
            total_amount=6000.0
        )
        db.add(r)
        db.commit()
        db.refresh(r)

        # 1. Valid Payment Record Creation
        tx_ref_1 = f"TXN_VERIFY_{eq.listing_id}_{int(datetime.utcnow().timestamp())}"
        pay1 = RentalPayment(
            rental_id=r.rental_id,
            amount=6000.0,
            payment_method="RAZORPAY",
            payment_status="successful",
            transaction_reference=tx_ref_1,
            payment_date=datetime.utcnow()
        )
        db.add(pay1)
        db.commit()
        db.refresh(pay1)
        print(f"Scenario 1: Payment #{pay1.payment_id} created for Rental #{r.rental_id}, Amount: INR {pay1.amount}", flush=True)
        assert pay1.payment_id is not None
        assert pay1.amount == 6000.0
        print("[PASS] Payment references valid rental with correct amount", flush=True)

        # 2. Duplicate transaction reference prevented
        dup_pay = RentalPayment(
            rental_id=r.rental_id,
            amount=6000.0,
            payment_method="RAZORPAY",
            payment_status="successful",
            transaction_reference=tx_ref_1 # DUPLICATE!
        )
        db.add(dup_pay)
        try:
            db.commit()
            raise AssertionError("Duplicate transaction reference should have failed!")
        except IntegrityError:
            db.rollback()
            print("[PASS] Unique constraint blocked duplicate transaction reference", flush=True)

        # 3. Foreign key enforcement: Payment with non-existent rental_id
        invalid_pay = RentalPayment(
            rental_id=99999999, # Non-existent rental
            amount=1000.0,
            payment_method="CASH",
            payment_status="pending",
            transaction_reference="TXN_INVALID"
        )
        db.add(invalid_pay)
        try:
            db.commit()
            raise AssertionError("Foreign key violation should have triggered!")
        except IntegrityError:
            db.rollback()
            print("[PASS] Foreign key constraint prevented orphaned payment record", flush=True)

        # Cleanup
        db.query(RentalPayment).filter(RentalPayment.rental_id == r.rental_id).delete()
        db.query(RentalRecord).filter(RentalRecord.rental_id == r.rental_id).delete()
        db.query(EquipmentListing).filter(EquipmentListing.listing_id == eq.listing_id).delete()
        db.commit()
        print("\n>>> ALL PHASE 8 PAYMENT SCENARIOS PASSED WITH 100% SUCCESS! <<<", flush=True)

if __name__ == "__main__":
    test_payment_management()
