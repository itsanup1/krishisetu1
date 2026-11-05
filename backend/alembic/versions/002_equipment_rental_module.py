"""Equipment rental module with 4 normalized tables, dynamic availability, and RLS

Revision ID: 002_equipment_rental_module
Revises: 001_initial
Create Date: 2026-11-05 09:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '002_equipment_rental_module'
down_revision = '001_initial'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. equipment_listings
    op.create_table(
        'equipment_listings',
        sa.Column('listing_id', sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column('owner_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('equipment_name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('specifications', sa.Text(), nullable=True),
        sa.Column('price_per_day', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('total_quantity', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('listing_status', sa.String(length=50), nullable=False, server_default='active'),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('rental_id', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
    )
    op.create_index('idx_equipment_listings_owner_id', 'equipment_listings', ['owner_id'])
    op.create_index('idx_equipment_listings_category', 'equipment_listings', ['category'])
    op.create_index('idx_equipment_listings_status', 'equipment_listings', ['listing_status'])

    # 2. rental_records
    op.create_table(
        'rental_records',
        sa.Column('rental_id', sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column('listing_id', sa.BigInteger(), sa.ForeignKey('equipment_listings.listing_id', ondelete='RESTRICT'), nullable=False),
        sa.Column('farmer_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('quantity_rented', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('rental_start_date', sa.Date(), nullable=False),
        sa.Column('rental_end_date', sa.Date(), nullable=False),
        sa.Column('rental_status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('total_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
    )
    op.create_index('idx_rental_records_listing_id', 'rental_records', ['listing_id'])
    op.create_index('idx_rental_records_farmer_id', 'rental_records', ['farmer_id'])
    op.create_index('idx_rental_records_status', 'rental_records', ['rental_status'])

    # 3. rental_payments
    op.create_table(
        'rental_payments',
        sa.Column('payment_id', sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column('rental_id', sa.BigInteger(), sa.ForeignKey('rental_records.rental_id', ondelete='RESTRICT'), nullable=False),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('payment_method', sa.String(length=50), server_default='CASH'),
        sa.Column('payment_status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('transaction_reference', sa.String(length=255), unique=True, nullable=True),
        sa.Column('payment_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
    )
    op.create_index('idx_rental_payments_rental_id', 'rental_payments', ['rental_id'])
    op.create_index('idx_rental_payments_status', 'rental_payments', ['payment_status'])

    # 4. rental_queue
    op.create_table(
        'rental_queue',
        sa.Column('queue_id', sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column('listing_id', sa.BigInteger(), sa.ForeignKey('equipment_listings.listing_id', ondelete='RESTRICT'), nullable=False),
        sa.Column('farmer_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('requested_quantity', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('requested_start_date', sa.Date(), nullable=False),
        sa.Column('requested_end_date', sa.Date(), nullable=False),
        sa.Column('queue_position', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('queue_status', sa.String(length=50), nullable=False, server_default='waiting'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
    )
    op.create_index('idx_rental_queue_listing_id', 'rental_queue', ['listing_id'])
    op.create_index('idx_rental_queue_farmer_id', 'rental_queue', ['farmer_id'])
    op.create_index('idx_rental_queue_status', 'rental_queue', ['queue_status'])

def downgrade() -> None:
    op.drop_table('rental_queue')
    op.drop_table('rental_payments')
    op.drop_table('rental_records')
    op.drop_table('equipment_listings')

