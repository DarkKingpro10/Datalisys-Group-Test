-- 4. Creación de la capa dwh (star schema)
-- Esquema: dwh
CREATE SCHEMA IF NOT EXISTS dwh;

-- Dimensión de fechas
CREATE TABLE IF NOT EXISTS dwh.dim_date (
    date DATE PRIMARY KEY,
    year INTEGER,
    month INTEGER,
    day INTEGER,
    week INTEGER,
    quarter INTEGER,
    is_weekend BOOLEAN
);
INSERT INTO dwh.dim_date (date, year, month, day, week, quarter, is_weekend)
SELECT DISTINCT
    order_purchase_timestamp::date AS date,
    EXTRACT(YEAR FROM order_purchase_timestamp::date)::int AS year,
    EXTRACT(MONTH FROM order_purchase_timestamp::date)::int AS month,
    EXTRACT(DAY FROM order_purchase_timestamp::date)::int AS day,
    EXTRACT(WEEK FROM order_purchase_timestamp::date)::int AS week,
    EXTRACT(QUARTER FROM order_purchase_timestamp::date)::int AS quarter,
    (EXTRACT(DOW FROM order_purchase_timestamp::date) IN (0,6)) AS is_weekend
FROM clean.orders
WHERE order_purchase_timestamp IS NOT NULL
ON CONFLICT (date) DO NOTHING;

-- Dimensión cliente
CREATE TABLE IF NOT EXISTS dwh.dim_customer (
    customer_id VARCHAR(50) PRIMARY KEY,
    customer_unique_id VARCHAR(50),
    customer_city VARCHAR(100),
    customer_state VARCHAR(2)
);
INSERT INTO dwh.dim_customer (customer_id, customer_unique_id, customer_city, customer_state)
SELECT DISTINCT customer_id, customer_unique_id, customer_city, customer_state
FROM clean.customers
ON CONFLICT (customer_id) DO NOTHING;

-- Dimensión producto
CREATE TABLE IF NOT EXISTS dwh.dim_product (
    product_id VARCHAR(50) PRIMARY KEY,
    product_category_name VARCHAR(100)
);
INSERT INTO dwh.dim_product (product_id, product_category_name)
SELECT DISTINCT product_id, product_category_name
FROM clean.products
ON CONFLICT (product_id) DO NOTHING;

-- Dimensión orden
CREATE TABLE IF NOT EXISTS dwh.dim_order (
    order_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50),
    order_status VARCHAR(20),
    order_purchase_timestamp TIMESTAMP,
    order_approved_at TIMESTAMP,
    order_delivered_customer_date TIMESTAMP,
    order_estimated_delivery_date TIMESTAMP
);
INSERT INTO dwh.dim_order (order_id, customer_id, order_status, order_purchase_timestamp, order_approved_at, order_delivered_customer_date, order_estimated_delivery_date)
SELECT DISTINCT
    o.order_id,
    o.customer_id,
    o.order_status,
    o.order_purchase_timestamp,
    o.order_approved_at,
    o.order_delivered_customer_date,
    o.order_estimated_delivery_date
FROM clean.orders o
ON CONFLICT (order_id) DO NOTHING;

-- Tabla de hechos: grain = 1 fila por item (order_id + order_item_id)
CREATE TABLE IF NOT EXISTS dwh.fact_sales (
    order_id VARCHAR(50),
    order_item_id INTEGER,
    purchase_date DATE,
    product_id VARCHAR(50),
    customer_id VARCHAR(50),
    seller_id VARCHAR(50),
    item_price NUMERIC(10,2),
    freight_value NUMERIC(10,2),
    payment_value_allocated NUMERIC(10,2),
    is_delivered BOOLEAN,
    is_canceled BOOLEAN,
    is_on_time BOOLEAN,
    PRIMARY KEY (order_id, order_item_id)
);

-- Poblar fact_sales: asignación proporcional de pagos a items por order_id
-- Regla: payment_value se reparte por (item_price / sum(item_price) por orden)
WITH
    s AS (
        SELECT order_id, SUM(price::numeric) AS order_total_price
        FROM clean.order_items
        GROUP BY order_id
    ),
    p AS (
        SELECT order_id, SUM(payment_value::numeric) AS pay_total
        FROM clean.order_payments
        GROUP BY order_id
    ),
    items AS (
        SELECT
            oi.order_id,
            oi.order_item_id,
            o.order_purchase_timestamp::date AS purchase_date,
            oi.product_id,
            o.customer_id,
            oi.seller_id,
            oi.price::numeric(10,2) AS item_price,
            oi.freight_value::numeric(10,2) AS freight_value,
            COALESCE(p.pay_total, 0) AS pay_total,
            s.order_total_price,
            -- allocation base redondeada a 2 decimales para evitar problemas de precisión
            ROUND(COALESCE(p.pay_total,0) * (oi.price::numeric / NULLIF(s.order_total_price,0)), 2) AS base_alloc,
            -- sumar el redondeo de allocations para cada orden para luego ajustar el último item y asegurar que sumen exactamente pay_total
            SUM(ROUND(COALESCE(p.pay_total,0) * (oi.price::numeric / NULLIF(s.order_total_price,0)), 2)) OVER (PARTITION BY oi.order_id) AS sum_allocs,
            ROW_NUMBER() OVER (PARTITION BY oi.order_id ORDER BY oi.order_item_id DESC) AS rn, -- Ordenamos por cual es el ultimo item
            (o.order_delivered_customer_date IS NOT NULL) AS is_delivered,
            (o.order_status = 'canceled') AS is_canceled,
            CASE WHEN o.order_delivered_customer_date IS NOT NULL AND o.order_estimated_delivery_date IS NOT NULL
                     THEN o.order_delivered_customer_date <= o.order_estimated_delivery_date
                     ELSE NULL
            END AS is_on_time
        FROM clean.order_items oi
        JOIN clean.orders o ON o.order_id = oi.order_id
        LEFT JOIN s ON s.order_id = oi.order_id
        LEFT JOIN p ON p.order_id = oi.order_id
    )
INSERT INTO dwh.fact_sales (
    order_id,
    order_item_id,
    purchase_date,
    product_id,
    customer_id,
    seller_id,
    item_price,
    freight_value,
    payment_value_allocated,
    is_delivered,
    is_canceled,
    is_on_time
)
SELECT
    order_id,
    order_item_id,
    purchase_date,
    product_id,
    customer_id,
    seller_id,
    item_price,
    freight_value,
    -- Primero asignamos importes redondeados y luego el residuo (Diferencia entre pay_total) y la suma de los redondeos
    (base_alloc + CASE WHEN rn = 1 THEN (pay_total - sum_allocs) ELSE 0 END)::numeric(10,2) AS payment_value_allocated,
    is_delivered,
    is_canceled,
    is_on_time
FROM items
ON CONFLICT (order_id, order_item_id) DO NOTHING;

-- Fin 04-dwh_tables.sql
