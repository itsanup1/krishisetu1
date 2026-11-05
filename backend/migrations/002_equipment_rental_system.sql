-- ====================================================================
-- MIGRATION: 002_equipment_rental_system.sql
-- Description: Implement complete 4-table agricultural equipment rental module
-- Author: Krishisetu Engineering Team
-- ====================================================================

-- 1. TABLE: equipment_listings
CREATE TABLE IF NOT EXISTS equipment_listings (
    listing_id BIGSERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    equipment_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    specifications TEXT,
    price_per_day NUMERIC(10, 2) NOT NULL CHECK (price_per_day >= 0),
    total_quantity INTEGER NOT NULL CHECK (total_quantity > 0),
    location VARCHAR(255),
    listing_status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (listing_status IN ('active', 'deactivated', 'inactive')),
    image_url VARCHAR(500),
    rental_id VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_listings_owner_id ON equipment_listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_equipment_listings_category ON equipment_listings(category);
CREATE INDEX IF NOT EXISTS idx_equipment_listings_status ON equipment_listings(listing_status);
CREATE INDEX IF NOT EXISTS idx_equipment_listings_location ON equipment_listings(location);

-- 2. TABLE: rental_records
CREATE TABLE IF NOT EXISTS rental_records (
    rental_id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL REFERENCES equipment_listings(listing_id) ON DELETE RESTRICT,
    farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    quantity_rented INTEGER NOT NULL CHECK (quantity_rented > 0),
    rental_start_date DATE NOT NULL,
    rental_end_date DATE NOT NULL,
    rental_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (rental_status IN ('pending', 'approved', 'active', 'completed', 'cancelled', 'rejected')),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_rental_dates CHECK (rental_end_date >= rental_start_date)
);

CREATE INDEX IF NOT EXISTS idx_rental_records_listing_id ON rental_records(listing_id);
CREATE INDEX IF NOT EXISTS idx_rental_records_farmer_id ON rental_records(farmer_id);
CREATE INDEX IF NOT EXISTS idx_rental_records_status ON rental_records(rental_status);
CREATE INDEX IF NOT EXISTS idx_rental_records_dates ON rental_records(rental_start_date, rental_end_date);

-- 3. TABLE: rental_payments
CREATE TABLE IF NOT EXISTS rental_payments (
    payment_id BIGSERIAL PRIMARY KEY,
    rental_id BIGINT NOT NULL REFERENCES rental_records(rental_id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) DEFAULT 'CASH',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'successful', 'failed', 'refunded')),
    transaction_reference VARCHAR(255) UNIQUE,
    payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rental_payments_rental_id ON rental_payments(rental_id);
CREATE INDEX IF NOT EXISTS idx_rental_payments_status ON rental_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_rental_payments_tx_ref ON rental_payments(transaction_reference);

-- 4. TABLE: rental_queue
CREATE TABLE IF NOT EXISTS rental_queue (
    queue_id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL REFERENCES equipment_listings(listing_id) ON DELETE RESTRICT,
    farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    requested_quantity INTEGER NOT NULL CHECK (requested_quantity > 0),
    requested_start_date DATE NOT NULL,
    requested_end_date DATE NOT NULL,
    queue_position INTEGER NOT NULL DEFAULT 1,
    queue_status VARCHAR(50) NOT NULL DEFAULT 'waiting' CHECK (queue_status IN ('waiting', 'notified', 'fulfilled', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_queue_dates CHECK (requested_end_date >= requested_start_date)
);

CREATE INDEX IF NOT EXISTS idx_rental_queue_listing_id ON rental_queue(listing_id);
CREATE INDEX IF NOT EXISTS idx_rental_queue_farmer_id ON rental_queue(farmer_id);
CREATE INDEX IF NOT EXISTS idx_rental_queue_status ON rental_queue(queue_status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_queue ON rental_queue (listing_id, farmer_id) WHERE queue_status = 'waiting';

-- 5. FUNCTION & TRIGGER: updated_at auto-maintenance
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_equipment_listings_updated_at ON equipment_listings;
CREATE TRIGGER trg_equipment_listings_updated_at
BEFORE UPDATE ON equipment_listings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_rental_records_updated_at ON rental_records;
CREATE TRIGGER trg_rental_records_updated_at
BEFORE UPDATE ON rental_records
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- 6. FUNCTION: Dynamic Equipment Availability Calculation
CREATE OR REPLACE FUNCTION get_available_equipment_quantity(
    p_listing_id BIGINT,
    p_start_date DATE,
    p_end_date DATE
) RETURNS INTEGER AS $$
DECLARE
    v_total INTEGER;
    v_booked INTEGER;
BEGIN
    SELECT total_quantity INTO v_total
    FROM equipment_listings
    WHERE listing_id = p_listing_id;

    IF v_total IS NULL THEN
        RETURN 0;
    END IF;

    SELECT COALESCE(SUM(quantity_rented), 0) INTO v_booked
    FROM rental_records
    WHERE listing_id = p_listing_id
      AND rental_status IN ('approved', 'active')
      AND rental_start_date <= p_end_date
      AND rental_end_date >= p_start_date;

    RETURN GREATEST(0, v_total - v_booked);
END;
$$ LANGUAGE plpgsql;

-- 7. MIGRATE EXISTING EQUIPMENT TO equipment_listings (preserving existing 14 items)
INSERT INTO equipment_listings (
    listing_id,
    owner_id,
    equipment_name,
    category,
    description,
    specifications,
    price_per_day,
    total_quantity,
    location,
    listing_status,
    image_url,
    rental_id,
    created_at,
    updated_at
)
SELECT
    id,
    owner_id,
    name,
    type::text,
    description,
    specifications,
    rate::numeric(10,2),
    COALESCE(stock_quantity, 1),
    location,
    CASE WHEN availability_status = 'AVAILABLE' THEN 'active' ELSE 'inactive' END,
    image_url,
    COALESCE(rental_id, product_id, 'R0' || id::text),
    created_at,
    COALESCE(updated_at, NOW())
FROM equipment
ON CONFLICT (listing_id) DO NOTHING;

-- Synchronize sequence for equipment_listings
SELECT setval(
    pg_get_serial_sequence('equipment_listings', 'listing_id'),
    COALESCE((SELECT MAX(listing_id) FROM equipment_listings), 1),
    true
);

-- 8. MIGRATE EXISTING BOOKINGS TO rental_records
INSERT INTO rental_records (
    rental_id,
    listing_id,
    farmer_id,
    quantity_rented,
    rental_start_date,
    rental_end_date,
    rental_status,
    total_amount,
    created_at,
    updated_at
)
SELECT
    b.id,
    b.equipment_id,
    b.farmer_id,
    1,
    b.start_date::date,
    b.end_date::date,
    CASE 
        WHEN b.status::text = 'CONFIRMED' THEN 'approved'
        WHEN b.status::text = 'CANCELLED' THEN 'cancelled'
        ELSE 'pending'
    END,
    GREATEST(100.00, ROUND(COALESCE(e.price_per_day, 500.0) * GREATEST(1, (b.end_date::date - b.start_date::date))::numeric, 2)),
    b.created_at,
    COALESCE(b.updated_at, NOW())
FROM booking_requests b
JOIN equipment_listings e ON b.equipment_id = e.listing_id
ON CONFLICT (rental_id) DO NOTHING;

-- Synchronize sequence for rental_records
SELECT setval(
    pg_get_serial_sequence('rental_records', 'rental_id'),
    COALESCE((SELECT MAX(rental_id) FROM rental_records), 1),
    true
);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE equipment_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_queue ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if any
DROP POLICY IF EXISTS "Public can view active equipment listings" ON equipment_listings;
DROP POLICY IF EXISTS "Owners can view own listings" ON equipment_listings;
DROP POLICY IF EXISTS "Owners can insert own listings" ON equipment_listings;
DROP POLICY IF EXISTS "Owners can update own listings" ON equipment_listings;
DROP POLICY IF EXISTS "Allow backend full access to equipment_listings" ON equipment_listings;

-- Service role / postgres has full access
CREATE POLICY "Allow backend full access to equipment_listings"
ON equipment_listings FOR ALL
TO postgres, service_role
USING (true) WITH CHECK (true);

-- Authenticated & public can view active listings
CREATE POLICY "Public can view active equipment listings"
ON equipment_listings FOR SELECT
USING (listing_status = 'active');

DROP POLICY IF EXISTS "Allow backend full access to rental_records" ON rental_records;
CREATE POLICY "Allow backend full access to rental_records"
ON rental_records FOR ALL
TO postgres, service_role
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow backend full access to rental_payments" ON rental_payments;
CREATE POLICY "Allow backend full access to rental_payments"
ON rental_payments FOR ALL
TO postgres, service_role
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow backend full access to rental_queue" ON rental_queue;
CREATE POLICY "Allow backend full access to rental_queue"
ON rental_queue FOR ALL
TO postgres, service_role
USING (true) WITH CHECK (true);
