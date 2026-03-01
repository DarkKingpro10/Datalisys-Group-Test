-- 3. Creación de tablas clean y limpieza de datos
-- Tabla clean_customers
CREATE TABLE IF NOT EXISTS clean_customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    customer_unique_id VARCHAR(50),
    customer_zip_code_prefix VARCHAR(10),
    customer_city VARCHAR(100),
    customer_state VARCHAR(2)
);
INSERT INTO clean_customers
SELECT DISTINCT
    customer_id,
    customer_unique_id,
    customer_zip_code_prefix,
    TRIM(LOWER(customer_city)),
    UPPER(customer_state)
FROM raw_customers;

-- Tabla clean_geolocation
CREATE TABLE IF NOT EXISTS clean_geolocation (
    geolocation_zip_code_prefix VARCHAR(10),
    geolocation_lat FLOAT,
    geolocation_lng FLOAT,
    geolocation_city VARCHAR(100),
    geolocation_state VARCHAR(2)
);
INSERT INTO clean_geolocation
SELECT DISTINCT
    geolocation_zip_code_prefix,
    CAST(geolocation_lat AS FLOAT),
    CAST(geolocation_lng AS FLOAT),
    TRIM(LOWER(geolocation_city)),
    UPPER(geolocation_state)
FROM raw_geolocation;

-- Tabla clean_orders
CREATE TABLE IF NOT EXISTS clean_orders (
    order_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50),
    order_status VARCHAR(20),
    order_purchase_timestamp TIMESTAMP,
    order_approved_at TIMESTAMP,
    order_delivered_carrier_date TIMESTAMP,
    order_delivered_customer_date TIMESTAMP,
    order_estimated_delivery_date TIMESTAMP
);
INSERT INTO clean_orders
SELECT DISTINCT
    order_id,
    customer_id,
    order_status,
    order_purchase_timestamp::timestamp,
    order_approved_at::timestamp,
    order_delivered_carrier_date::timestamp,
    order_delivered_customer_date::timestamp,
    order_estimated_delivery_date::timestamp
FROM raw_orders;

-- Tabla clean_order_items
CREATE TABLE IF NOT EXISTS clean_order_items (
    order_id VARCHAR(50),
    order_item_id INTEGER,
    product_id VARCHAR(50),
    seller_id VARCHAR(50),
    shipping_limit_date TIMESTAMP,
    price NUMERIC,
    freight_value NUMERIC,
    PRIMARY KEY (order_id, order_item_id)
);
INSERT INTO clean_order_items
SELECT DISTINCT
    order_id,
    CAST(order_item_id AS INTEGER),
    product_id,
    seller_id,
    shipping_limit_date::timestamp,
    price::numeric,
    freight_value::numeric
FROM raw_order_items;

-- Tabla clean_order_payments
CREATE TABLE IF NOT EXISTS clean_order_payments (
    order_id VARCHAR(50),
    payment_sequential INTEGER,
    payment_type VARCHAR(20),
    payment_installments INTEGER,
    payment_value NUMERIC
);
INSERT INTO clean_order_payments
SELECT DISTINCT
    order_id,
    CAST(payment_sequential AS INTEGER),
    payment_type,
    CAST(payment_installments AS INTEGER),
    payment_value::numeric
FROM raw_order_payments;

-- Tabla clean_order_reviews
CREATE TABLE IF NOT EXISTS clean_order_reviews (
    review_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50),
    review_score INTEGER,
    review_comment_title TEXT,
    review_comment_message TEXT,
    review_creation_date TIMESTAMP,
    review_answer_timestamp TIMESTAMP
);
INSERT INTO clean_order_reviews
SELECT DISTINCT
    review_id,
    order_id,
    CAST(review_score AS INTEGER),
    review_comment_title,
    review_comment_message,
    review_creation_date::timestamp,
    review_answer_timestamp::timestamp
FROM raw_order_reviews;

-- Tabla clean_products
CREATE TABLE IF NOT EXISTS clean_products (
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
INSERT INTO clean_products
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
FROM raw_products;

-- Tabla clean_sellers
CREATE TABLE IF NOT EXISTS clean_sellers (
    seller_id VARCHAR(50) PRIMARY KEY,
    seller_zip_code_prefix VARCHAR(10),
    seller_city VARCHAR(100),
    seller_state VARCHAR(2)
);
INSERT INTO clean_sellers
SELECT DISTINCT
    seller_id,
    seller_zip_code_prefix,
    TRIM(LOWER(seller_city)),
    UPPER(seller_state)
FROM raw_sellers;

-- Tabla clean_product_category_name_translation
CREATE TABLE IF NOT EXISTS clean_product_category_name_translation (
    product_category_name VARCHAR(100) PRIMARY KEY,
    product_category_name_english VARCHAR(100)
);
INSERT INTO clean_product_category_name_translation
SELECT DISTINCT
    product_category_name,
    product_category_name_english
FROM raw_product_category_name_translation;
