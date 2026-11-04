"""Initial database schema for Krishisetu

Revision ID: 001_initial
Revises: 
Create Date: 2026-09-10 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=30), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('is_equipment_owner', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('location', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # Products table
    op.create_table(
        'products',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('product_id', sa.String(length=20), nullable=False, unique=True),
        sa.Column('vendor_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('stock', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('availability_status', sa.String(length=50), nullable=False, server_default='IN_STOCK'),
        sa.Column('image_url', sa.String(length=500), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    op.create_index('ix_products_product_id', 'products', ['product_id'], unique=True)
    op.create_index('ix_products_category', 'products', ['category'], unique=False)
    op.create_index('ix_products_name', 'products', ['name'], unique=False)

    # Cart Items table
    op.create_table(
        'cart_items',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('farmer_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id'), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    # Orders table
    op.create_table(
        'orders',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('farmer_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('total_amount', sa.Float(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='PLACED'),
        sa.Column('delivery_address', sa.String(length=500), nullable=False, server_default='Registered Farm Address'),
        sa.Column('razorpay_order_id', sa.String(length=255), nullable=True),
        sa.Column('razorpay_payment_id', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    # Order Items table
    op.create_table(
        'order_items',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('order_id', sa.Integer(), sa.ForeignKey('orders.id'), nullable=False),
        sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id'), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('price_at_purchase', sa.Float(), nullable=False),
    )

    # Equipment table
    op.create_table(
        'equipment',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('rental_id', sa.String(length=20), nullable=False, unique=True),
        sa.Column('owner_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('specifications', sa.Text(), nullable=False),
        sa.Column('rate', sa.Float(), nullable=False),
        sa.Column('rate_unit', sa.String(length=20), nullable=False, server_default='HOUR'),
        sa.Column('location', sa.String(length=255), nullable=False),
        sa.Column('stock_quantity', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('availability_status', sa.String(length=50), nullable=False, server_default='AVAILABLE'),
        sa.Column('image_url', sa.String(length=500), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    op.create_index('ix_equipment_rental_id', 'equipment', ['rental_id'], unique=True)
    op.create_index('ix_equipment_type', 'equipment', ['type'], unique=False)
    op.create_index('ix_equipment_location', 'equipment', ['location'], unique=False)

    # Booking Requests table (FCFS)
    op.create_table(
        'booking_requests',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('farmer_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('equipment_id', sa.Integer(), sa.ForeignKey('equipment.id'), nullable=False),
        sa.Column('start_date', sa.DateTime(), nullable=False),
        sa.Column('end_date', sa.DateTime(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='CONFIRMATION_PENDING'),
        sa.Column('queue_position', sa.Integer(), nullable=True),
        sa.Column('confirmation_deadline', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    op.create_index('ix_booking_requests_status', 'booking_requests', ['status'], unique=False)

def downgrade() -> None:
    op.drop_table('booking_requests')
    op.drop_table('equipment')
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_table('cart_items')
    op.drop_table('products')
    op.drop_table('users')

