-- 3. Creación de tablas clean y limpieza de datos
-- Tabla customers
CREATE TABLE IF NOT EXISTS clean.customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    customer_unique_id VARCHAR(50),
    customer_zip_code_prefix VARCHAR(10),
    customer_city VARCHAR(100),
    customer_state VARCHAR(2)
);
INSERT INTO clean.customers
SELECT DISTINCT
    customer_id,
    customer_unique_id,
    customer_zip_code_prefix,
    TRIM(LOWER(customer_city)),
    UPPER(customer_state)
FROM raw.customers;
ON CONFLICT (customer_id) DO NOTHING;

-- Tabla geolocation
CREATE TABLE IF NOT EXISTS clean.geolocation (
    geolocation_zip_code_prefix VARCHAR(10),
    geolocation_lat FLOAT,
    geolocation_lng FLOAT,
    geolocation_city VARCHAR(100),
    geolocation_state VARCHAR(2)
);
ALTER TABLE IF EXISTS clean.geolocation DROP CONSTRAINT IF EXISTS clean_geolocation_pkey;
CREATE TABLE IF NOT EXISTS clean.geolocation (
    geolocation_zip_code_prefix VARCHAR(10) PRIMARY KEY,
    geolocation_lat FLOAT,
    geolocation_lng FLOAT,
    geolocation_city VARCHAR(100),
    geolocation_state VARCHAR(2)
);
INSERT INTO clean.geolocation
SELECT DISTINCT
    geolocation_zip_code_prefix,
    CAST(geolocation_lat AS FLOAT),
    CAST(geolocation_lng AS FLOAT),
    TRIM(LOWER(geolocation_city)),
    UPPER(geolocation_state)
FROM raw.geolocation;
ON CONFLICT (geolocation_zip_code_prefix) DO NOTHING;

-- Tabla orders
CREATE TABLE IF NOT EXISTS clean.orders (
    order_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50),
    order_status VARCHAR(20),
    order_purchase_timestamp TIMESTAMP,
    order_approved_at TIMESTAMP,
    order_delivered_carrier_date TIMESTAMP,
    order_delivered_customer_date TIMESTAMP,
    order_estimated_delivery_date TIMESTAMP
);
INSERT INTO clean.orders
SELECT DISTINCT
    order_id,
    customer_id,
    order_status,
    order_purchase_timestamp::timestamp,
    order_approved_at::timestamp,
    order_delivered_carrier_date::timestamp,
    order_delivered_customer_date::timestamp,
    order_estimated_delivery_date::timestamp
FROM raw.orders;
ON CONFLICT (order_id) DO NOTHING;

-- Tabla order_items
CREATE TABLE IF NOT EXISTS clean.order_items (
    order_id VARCHAR(50),
    order_item_id INTEGER,
    product_id VARCHAR(50),
    seller_id VARCHAR(50),
    shipping_limit_date TIMESTAMP,
    price NUMERIC,
    freight_value NUMERIC,
    PRIMARY KEY (order_id, order_item_id)
);
INSERT INTO clean.order_items
SELECT DISTINCT
    order_id,
    CAST(order_item_id AS INTEGER),
    product_id,
    seller_id,
    shipping_limit_date::timestamp,
    price::numeric,
    freight_value::numeric
FROM raw.order_items;
ON CONFLICT (order_id, order_item_id) DO NOTHING;

-- Tabla order_payments
ALTER TABLE IF EXISTS clean.order_payments DROP CONSTRAINT IF EXISTS clean_order_payments_pkey;
CREATE TABLE IF NOT EXISTS clean.order_payments (
    order_id VARCHAR(50),
    payment_sequential INTEGER,
    payment_type VARCHAR(20),
    payment_installments INTEGER,
    payment_value NUMERIC,
    PRIMARY KEY (order_id, payment_sequential)
);
INSERT INTO clean.order_payments
SELECT DISTINCT
    order_id,
    CAST(payment_sequential AS INTEGER),
    payment_type,
    CAST(payment_installments AS INTEGER),
    payment_value::numeric
FROM raw.order_payments
ON CONFLICT (order_id, payment_sequential) DO NOTHING;

-- Tabla order_reviews
CREATE TABLE IF NOT EXISTS clean.order_reviews (
    review_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50),
    review_score INTEGER,
    review_comment_title TEXT,
    review_comment_message TEXT,
    review_creation_date TIMESTAMP,
    review_answer_timestamp TIMESTAMP
);
INSERT INTO clean.order_reviews
SELECT DISTINCT
    review_id,
    order_id,
    CAST(review_score AS INTEGER),
    review_comment_title,
    review_comment_message,
    review_creation_date::timestamp,
    review_answer_timestamp::timestamp
FROM raw.order_reviews;
ON CONFLICT (review_id) DO NOTHING;

-- Tabla products
CREATE TABLE IF NOT EXISTS clean.products (
    product_id VARCHAR(50) PRIMARY KEY,
    product_category_name VARCHAR(100),
    product_name_lenght INTEGER,
    product_description_lenght INTEGER,
    product_photos_qty INTEGER,
    product_weight_g INTEGER,
    product_length_cm INTEGER,
    product_height_cm INTEGER,
    product_width_cm INTEGER
);
INSERT INTO clean.products
SELECT DISTINCT
    product_id,
    product_category_name,
    CAST(product_name_lenght AS INTEGER),
    CAST(product_description_lenght AS INTEGER),
    CAST(product_photos_qty AS INTEGER),
    CAST(product_weight_g AS INTEGER),
    CAST(product_length_cm AS INTEGER),
    CAST(product_height_cm AS INTEGER),
    CAST(product_width_cm AS INTEGER)
FROM raw.products;
ON CONFLICT (product_id) DO NOTHING;

-- Tabla sellers
CREATE TABLE IF NOT EXISTS clean.sellers (
    seller_id VARCHAR(50) PRIMARY KEY,
    seller_zip_code_prefix VARCHAR(10),
    seller_city VARCHAR(100),
    seller_state VARCHAR(2)
);
INSERT INTO clean.sellers
SELECT DISTINCT
    seller_id,
    seller_zip_code_prefix,
    TRIM(LOWER(seller_city)),
    UPPER(seller_state)
FROM raw.sellers;
ON CONFLICT (seller_id) DO NOTHING;

-- Tabla product_category_name_translation
CREATE TABLE IF NOT EXISTS clean.product_category_name_translation (
    product_category_name VARCHAR(100) PRIMARY KEY,
    product_category_name_english VARCHAR(100)
);
INSERT INTO clean.product_category_name_translation
SELECT DISTINCT
    product_category_name,
    product_category_name_english
FROM raw.product_category_name_translation
ON CONFLICT (product_category_name) DO NOTHING;
