-- ========================================================
-- AeroStore: PostgreSQL Relational Database Schema Blueprint
-- Optimized for Supabase PostgreSQL (Port 6543 / 5432)
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Identity & Access Layer
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- 2. Catalog & Component Taxonomy Layer (500+ SKUs)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories (slug);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  sku VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price_paise INTEGER NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_second_hand BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast catalog routing and typeahead searches
CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category_status ON products (category_id, status);
CREATE INDEX IF NOT EXISTS idx_products_price ON products (base_price_paise);
CREATE INDEX IF NOT EXISTS idx_products_second_hand ON products (is_second_hand) WHERE status = 'active';

-- 3. Hardware Engineering Attributes (1:1 Extension)
CREATE TABLE IF NOT EXISTS drone_specifications (
  product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  frame_size_mm INTEGER,
  weight_grams INTEGER,
  input_voltage_lipo VARCHAR(32),
  motor_kv VARCHAR(32),
  fc_firmware VARCHAR(64),
  esc_protocol VARCHAR(64),
  flight_time_minutes INTEGER,
  payload_capacity_grams INTEGER
);

-- 4. Pre-Owned Drone Certification Layer (1:1 Extension)
CREATE TABLE IF NOT EXISTS second_hand_details (
  product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  cosmetic_grade VARCHAR(1) NOT NULL CHECK (cosmetic_grade IN ('A', 'B', 'C')),
  flight_hours INTEGER,
  crash_history BOOLEAN NOT NULL DEFAULT false,
  battery_cycle_count INTEGER,
  included_accessories JSONB DEFAULT '[]'::jsonb,
  inspection_notes TEXT
);

-- 5. Hybrid Media Assets (Cloudflare R2 + Bunny.net Stream)
CREATE TABLE IF NOT EXISTS product_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
  storage_provider VARCHAR(20) NOT NULL CHECK (storage_provider IN ('r2', 'bunny')),
  url TEXT NOT NULL,
  playback_id VARCHAR(128),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_media_lookup ON product_media (product_id, display_order);

-- 6. Orders, UPI Settlement & Stock Holds
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_reference VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  total_amount_paise INTEGER NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_method VARCHAR(20) NOT NULL DEFAULT 'upi_qr' CHECK (payment_method IN ('upi_qr', 'bank_transfer')),
  payment_status VARCHAR(30) NOT NULL DEFAULT 'awaiting_verification' CHECK (payment_status IN ('awaiting_verification', 'paid', 'rejected')),
  upi_transaction_id VARCHAR(64) UNIQUE,
  payment_screenshot_url TEXT,
  order_status VARCHAR(30) NOT NULL DEFAULT 'placed' CHECK (order_status IN ('placed', 'processing', 'shipped', 'delivered', 'cancelled')),
  courier_partner VARCHAR(64),
  tracking_awb VARCHAR(64),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_upi_utr ON orders (upi_transaction_id) WHERE upi_transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders (user_id, order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price_paise INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  is_second_hand BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS stock_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  user_id UUID NOT NULL REFERENCES users(id),
  quantity INTEGER NOT NULL,
  reserved_until TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reservations_expiry ON stock_reservations (reserved_until);

-- 7. Administrative Audit Trail
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_name VARCHAR(50) NOT NULL,
  entity_id VARCHAR(64) NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
