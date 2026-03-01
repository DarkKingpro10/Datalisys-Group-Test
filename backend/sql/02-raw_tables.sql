-- 1. Definición de tablas raw

-- Tabla customers
CREATE TABLE IF NOT EXISTS raw.customers (
    customer_id TEXT,
    customer_unique_id TEXT,
    customer_zip_code_prefix TEXT,
    customer_city TEXT,
    customer_state TEXT
);

-- Tabla geolocation
CREATE TABLE IF NOT EXISTS raw.geolocation (
    geolocation_zip_code_prefix TEXT,
    geolocation_lat TEXT,
    geolocation_lng TEXT,
    geolocation_city TEXT,
    geolocation_state TEXT
);

-- Tabla orders
CREATE TABLE IF NOT EXISTS raw.orders (
    order_id TEXT,
    customer_id TEXT,
    order_status TEXT,
    order_purchase_timestamp TEXT,
    order_approved_at TEXT,
    order_delivered_carrier_date TEXT,
    order_delivered_customer_date TEXT,
    order_estimated_delivery_date TEXT
);

-- Tabla order_items
CREATE TABLE IF NOT EXISTS raw.order_items (
    order_id TEXT,
    order_item_id TEXT,
    product_id TEXT,
    seller_id TEXT,
    shipping_limit_date TEXT,
    price TEXT,
    freight_value TEXT
);

-- Tabla order_payments
CREATE TABLE IF NOT EXISTS raw.order_payments (
    order_id TEXT,
    payment_sequential TEXT,
    payment_type TEXT,
    payment_installments TEXT,
    payment_value TEXT
);

-- Tabla order_reviews
CREATE TABLE IF NOT EXISTS raw.order_reviews (
    review_id TEXT,
    order_id TEXT,
    review_score TEXT,
    review_comment_title TEXT,
    review_comment_message TEXT,
    review_creation_date TEXT,
    review_answer_timestamp TEXT
);

-- Tabla products
CREATE TABLE IF NOT EXISTS raw.products (
    product_id TEXT,
    product_category_name TEXT,
    product_name_lenght TEXT,
    product_description_lenght TEXT,
    product_photos_qty TEXT,
    product_weight_g TEXT,
    product_length_cm TEXT,
    product_height_cm TEXT,
    product_width_cm TEXT
);

-- Tabla sellers
CREATE TABLE IF NOT EXISTS raw.sellers (
    seller_id TEXT,
    seller_zip_code_prefix TEXT,
    seller_city TEXT,
    seller_state TEXT
);

-- Tabla product_category_name_translation
CREATE TABLE IF NOT EXISTS raw.product_category_name_translation (
    product_category_name TEXT,
    product_category_name_english TEXT
);

-- 2. Carga de datos desde los CSV
-- Clientes
COPY raw.customers FROM '/data/raw/olist_customers_dataset.csv' DELIMITER ',' CSV HEADER;
-- Geolocalización
COPY raw.geolocation FROM '/data/raw/olist_geolocation_dataset.csv' DELIMITER ',' CSV HEADER;
-- Órdenes
COPY raw.orders FROM '/data/raw/olist_orders_dataset.csv' DELIMITER ',' CSV HEADER;
-- Ítems de orden
COPY raw.order_items FROM '/data/raw/olist_order_items_dataset.csv' DELIMITER ',' CSV HEADER;
-- Pagos
COPY raw.order_payments FROM '/data/raw/olist_order_payments_dataset.csv' DELIMITER ',' CSV HEADER;
-- Reseñas
COPY raw.order_reviews FROM '/data/raw/olist_order_reviews_dataset.csv' DELIMITER ',' CSV HEADER;
-- Productos
COPY raw.products FROM '/data/raw/olist_products_dataset.csv' DELIMITER ',' CSV HEADER;
-- Vendedores
COPY raw.sellers FROM '/data/raw/olist_sellers_dataset.csv' DELIMITER ',' CSV HEADER;
-- Traducción de categorías
COPY raw.product_category_name_translation FROM '/data/raw/product_category_name_translation.csv' DELIMITER ',' CSV HEADER;
