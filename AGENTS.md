This are the instructions for the Full Stack Test, also read the .github/ folder to follow more instructions and skills each project (Frontend) and (Backend) has their own specific skills and instructions that you as an agent has to follow per each request.

For any changes, you have to documented in the README.md at the root.

Here is the full English translation:

---

# Technical Full-Stack Test: Commercial KPI Dashboard (Next.js + Node/Express + Postgres)

## Objective

Build a commercial dashboard to monitor sales performance (KPIs, trends, and rankings) with:

* **Frontend:** Next.js (TypeScript)
* **Backend:** Node.js + Express (TypeScript)
* **Database:** PostgreSQL
* **Infrastructure:** Docker Compose with 3 services (front, back, db)
* **ORM:** Required (Prisma or TypeORM)
* **Backend Architecture:** Hexagonal
* **Analytical Modeling:** Star schema
* **Data layers in Postgres:** `raw` (raw), `clean` (cleaned), `dwh` (star schema)

### Critical Rule

The backend **cannot query** `raw` or `clean`.
All API queries must originate from `dwh.fact_sales` (and if attributes are needed, you may JOIN to dimensions, but the “driving table” of every query must be the fact table).

---

# Dataset (Data Source)

Use the public dataset:

**Brazilian E-Commerce Public Dataset by Olist** (~100k orders, multiple tables: orders, order_items, products, customers, payments, etc.) (Kaggle)

---

# Required Ingestion

* Download the CSVs from the public GitHub mirror and load them into `raw.*`. (GitHub)
* You are not allowed to use invented “mock data” as a replacement (except for unit tests).

Note: The original dataset also exists on Kaggle; the GitHub mirror makes access easier without UI. (Kaggle)

---

# Required KPIs

The dashboard must support filtering by:

* Date range (by `order_purchase_timestamp`)
* At least 2 additional filters (e.g., `order_status`, `product_category_name`, `customer_state`, etc.)

---

## 1) GMV (Gross Merchandise Value)

**GMV = Σ item_price**

Sum of `order_items.price` for orders within the selected date range.

In Olist, `order_items.price` represents the item value; shipping can be shown separately. (Kaggle)

---

## 2) Revenue (Paid)

**Revenue = Σ payment_value** for orders with recorded payments (`order_payments.payment_value`). (Kaggle)

* If there are multiple payments per order, they must be summed.
* If there is a discrepancy between GMV and Revenue, the dashboard must display both.

---

## 3) Orders

**Orders = COUNT(DISTINCT order_id)** within the date range.

---

## 4) AOV (Average Order Value)

**AOV = Revenue / Orders**

If Orders = 0 → return 0.

---

## 5) Items per Order (IPO)

**IPO = COUNT(order_item_id) / Orders**

---

## 6) Cancellation Rate

**Cancel Rate = cancelled_orders / total_orders**

* `cancelled_orders`: orders with `order_status = 'canceled'`
* You may optionally include `'unavailable'`, but you must document it.

---

## 7) On-Time Delivery Rate

For delivered orders (`order_delivered_customer_date` not null):

**On-time = delivered_on_or_before_estimated / delivered_total**

Where:

`delivered_on_or_before_estimated` =
`order_delivered_customer_date <= order_estimated_delivery_date`

---

## 8) Top Products (Ranking)

Top N products by:

* GMV
* Revenue

(two separate rankings)

---

## 9) Revenue Trend (Time Series)

Daily or weekly time series of:

* Revenue
* Orders

---

# Data Modeling Requirements (Postgres)

## Mandatory Schemas

### raw

Tables reflecting the CSVs “as-is” (appropriate types, minimal constraints).

### clean

Cleaned/conformed data (correct types, null-handling, basic normalization, deduplication if needed).

### gold

Star schema for analytics.

---

# Minimum Star Schema in gold

## Fact Table (mandatory)

`gold.fact_sales`

### Required Grain

1 row per order item
(`order_id + order_item_id`)

This enables KPIs at item, product, category, and order aggregation level.

---

## Minimum Dimensions

* `gold.dim_date` (calendar)
* `gold.dim_customer` (customer_id + basic geo such as state/city)
* `gold.dim_product` (product_id + category)
* `gold.dim_order` (order_id + status + relevant timestamps)

---

## Recommended Measures in fact

* `item_price`
* `freight_value`
* `payment_value_allocated` (see note)
* `is_delivered`
* `is_canceled`
* `is_on_time`
* Foreign keys to dimensions (surrogate keys optional but recommended)

---

## Important Note (Payments vs Items)

In Olist:

* Payments are at order level
* Items are at item level

To maintain the grain “1 row per item,” you must define and document a rule to allocate payments:

### Option A (simple and accepted – expected)

Allocate `payment_value` proportionally to each item based on its `item_price`.

### Option B

Keep `payment_value` only in one row per order (but this breaks item-level grain).

Option A is expected for analytical consistency.

---

# Backend Rules (Architecture & Data Access)

## Hexagonal Architecture (minimum expected)

Suggested structure:

```
src/domain
  Entities / Value Objects + repository contracts (ports)

src/application
  Use cases (e.g., GetKpis, GetRevenueTrend, GetTopProducts)

src/infrastructure
  Implementations (ORM repositories, DB client, migrations, seed)

src/adapters/http
  Controllers/routes + DTOs + validation
```

---

## Rules

* The HTTP controller calls a use case.
* The use case depends on ports (interfaces).
* Infrastructure implements ports using ORM/SQL.

---

## Minimum REST Endpoints (examples)

* `GET /health`
* `GET /kpis?from=YYYY-MM-DD&to=YYYY-MM-DD&...filters`
* `GET /trend/revenue?from=...&to=...&grain=day|week&...filters`
* `GET /rankings/products?from=...&to=...&metric=gmv|revenue&limit=10`
* `GET /debug/query-plan` (optional, to show explain/analysis if you want to stand out)

---

## Validation

Validate parameters:

* Required dates
* Valid date range
* Maximum limit
* Etc.

---

# Frontend Requirements (Next.js)

## Minimum Pages / Views

### Overview

Cards:

* GMV
* Revenue
* Orders
* AOV
* IPO
* Cancel Rate
* On-time Rate

Plus:

* One trend chart (Revenue + Orders)

---

### Rankings

Top products table with metric switch (GMV/Revenue)

---

## Global Filters

* Date range
* 2 additional filters (e.g., customer state, product category, order status)

---

## Technical Requirements

* TypeScript
* Loading/error state handling
* Clean UI (perfect design not required, but clarity and organization are evaluated)
* Consume backend API (no direct DB queries)

---

# Docker & Execution (Mandatory)

Docker Compose with 3 services:

* `db` (Postgres)
* `backend` (Node/Express)
* `frontend` (Next.js)

Must include:

* Environment variables
* Healthchecks (ideally)
* Postgres persistence volume
* One-shot or automatic command to:

  * Create schemas/tables
  * Load raw
  * Transform to clean
  * Build DWH (dimensions/fact)

---

# Transformations (ETL/ELT) — Expected Approach

You may implement:

* SQL migrations + `npm run etl`, or
* A Node job that executes steps (COPY, transforms, inserts), or
* A combination (recommended: SQL for transforms, Node for orchestration)

---

## Mandatory Documentation in README

* Which tables were loaded into `raw`
* Cleaning rules in `clean`
* Star schema definition (grain + keys)
* How `payment_value` was allocated at item level

---

# Quality Requirements

README must include:

* Installation instructions
* How to run
* Frontend & backend URLs

At least:

* 3 unit tests (domain or use cases)
* 1 simple API integration test (optional but adds value)
* Linting/formatting (eslint/prettier) recommended
* Proper error handling (consistent HTTP codes)

---

# Deliverables (to be presented live in interview)

Git repository (GitHub/GitLab) with:

* `/frontend` (Next.js)
* `/backend` (Express)
* `/docker-compose.yml`
* `README` including:

  * Setup and commands
  * Architecture (simple diagram is fine)
  * Star schema model (table with dims/fact and grain)
  * KPI definitions (as above, with your implementation)
  * Technical decisions and tradeoffs

---

# Avoid

* Backend querying `raw` or `clean`
* Calculating KPIs in the frontend (frontend only presents; backend calculates)
* Replacing the dataset with an invented one

You may use libraries (charts, validation, date handling, etc.).

---

# Hints

* Use `COPY` to load CSVs into `raw` (fast).
* Create `clean` with timestamp casts, normalization, and keys.
* Build `dim_date` with a calendar generator.
* For `payment_value_allocated`, aggregate total `item_price` by `order_id` and allocate proportionally.
