-- ====================================================================
-- AgriShop Agriculture Inventory System - Supabase Postgres Schema
-- Creates all tables, relationships, indexes, and triggers
-- ====================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'staff')),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STOREROOMS TABLE
CREATE TABLE IF NOT EXISTS storerooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    location TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
    brand VARCHAR(255),
    product_type VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'Bag',
    pack_size VARCHAR(100),
    purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    min_stock INT DEFAULT 10,
    supplier_id VARCHAR(50) REFERENCES suppliers(id) ON DELETE SET NULL,
    batch_no VARCHAR(100),
    expiry_date DATE,
    photo_url TEXT,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. STOCK TABLE (Per Product Per Storeroom)
CREATE TABLE IF NOT EXISTS stock (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    storeroom_id VARCHAR(50) REFERENCES storerooms(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, storeroom_id)
);

-- 7. PURCHASES TABLE
CREATE TABLE IF NOT EXISTS purchases (
    id VARCHAR(50) PRIMARY KEY,
    purchase_date DATE NOT NULL,
    supplier_id VARCHAR(50) REFERENCES suppliers(id),
    invoice_no VARCHAR(100) NOT NULL,
    storeroom_id VARCHAR(50) REFERENCES storerooms(id),
    total NUMERIC(12, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PURCHASE ITEMS TABLE
CREATE TABLE IF NOT EXISTS purchase_items (
    id VARCHAR(50) PRIMARY KEY,
    purchase_id VARCHAR(50) REFERENCES purchases(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id),
    quantity INT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    batch_no VARCHAR(100),
    expiry_date DATE,
    subtotal NUMERIC(12, 2) NOT NULL
);

-- 9. SALES TABLE
CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(50) PRIMARY KEY,
    sale_date DATE NOT NULL,
    storeroom_id VARCHAR(50) REFERENCES storerooms(id),
    invoice_no VARCHAR(100) NOT NULL UNIQUE,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    payment_method VARCHAR(100) DEFAULT 'Cash',
    staff_id UUID REFERENCES users(id),
    total NUMERIC(12, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SALE ITEMS TABLE
CREATE TABLE IF NOT EXISTS sale_items (
    id VARCHAR(50) PRIMARY KEY,
    sale_id VARCHAR(50) REFERENCES sales(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id),
    quantity INT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL
);

-- 11. STOCK TRANSFERS TABLE
CREATE TABLE IF NOT EXISTS stock_transfers (
    id VARCHAR(50) PRIMARY KEY,
    transfer_date DATE NOT NULL,
    from_storeroom_id VARCHAR(50) REFERENCES storerooms(id),
    to_storeroom_id VARCHAR(50) REFERENCES storerooms(id),
    product_id VARCHAR(50) REFERENCES products(id),
    quantity INT NOT NULL,
    staff_id UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. STOCK ADJUSTMENTS TABLE
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id VARCHAR(50) PRIMARY KEY,
    adjustment_date DATE NOT NULL,
    storeroom_id VARCHAR(50) REFERENCES storerooms(id),
    product_id VARCHAR(50) REFERENCES products(id),
    reason VARCHAR(100) NOT NULL CHECK (reason IN ('Damaged', 'Expired', 'Lost', 'Audit Correction')),
    quantity INT NOT NULL,
    staff_id UUID REFERENCES users(id),
    notes TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. INVENTORY HISTORY (Audit Trail Ledger)
CREATE TABLE IF NOT EXISTS stock_transactions (
    id VARCHAR(50) PRIMARY KEY,
    tx_date DATE NOT NULL,
    tx_time TIME NOT NULL,
    product_id VARCHAR(50) REFERENCES products(id),
    storeroom_id VARCHAR(50) REFERENCES storerooms(id),
    transaction_type VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    direction VARCHAR(1) CHECK (direction IN ('+', '-')),
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    user_id UUID REFERENCES users(id),
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEED DEFAULT STOREROOMS
INSERT INTO storerooms (id, name, code, location) VALUES
('sr1', 'Main Store', 'SR1', 'Main Building'),
('sr2', 'Store Room 2', 'SR2', 'Block B'),
('sr3', 'Store Room 3', 'SR3', 'Block C')
ON CONFLICT (id) DO NOTHING;

-- SEED CATEGORIES
INSERT INTO categories (id, name) VALUES
('cat1', 'Fertilizers'),
('cat2', 'Pesticides'),
('cat3', 'Seeds'),
('cat4', 'Other Agriculture Products')
ON CONFLICT (id) DO NOTHING;
