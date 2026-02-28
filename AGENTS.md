This are the instructions for the Full Stack Test, also read the .github/ folder to follow more instructions and skills each project (Frontend) and (Backend) has their own specific skills and instructions that you as an agent has to follow per each request.

For any changes, you have to documented in the README.md at the root.

# 🧪 Full-Stack Technical Test: Commercial KPI Dashboard  
**Stack:** Next.js (TypeScript) + Node.js/Express (TypeScript) + PostgreSQL  
**ORM:** Prisma or TypeORM  
**Architecture:** Hexagonal (Ports & Adapters)  
**Infra:** Docker Compose (frontend, backend, db)  
**Analytical Modeling:** Star Schema  
**Data Layers:** raw, clean, gold  
**Dataset:** Brazilian E-Commerce Public Dataset by Olist  

---

# 📌 Objective

Build a commercial dashboard to monitor sales performance (KPIs, trends, and rankings).

The solution must include:

- **Frontend:** Next.js (TypeScript)
- **Backend:** Node.js + Express (TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma or TypeORM (required)
- **Architecture:** Hexagonal (backend)
- **Docker Compose:** 3 services (front, back, db)
- **Analytical Modeling:** Star Schema
- **Data Layers in Postgres:** raw, clean, gold

---

# 🚨 Critical Rule

The backend **MUST NOT** query `raw` or `clean`.

All API queries **must originate from `gold.fact_sales`**.  
You may `JOIN` dimensions, but the driving table must always be the fact table.

---

# 📊 Dataset

Use the public dataset:

**Brazilian E-Commerce Public Dataset by Olist**

Contains ~100k orders across multiple tables:
- orders
- order_items
- order_payments
- products
- customers
- etc.

CSV files must be downloaded from the GitHub mirror and loaded into `raw.*`.

❌ No mock data allowed (except for unit tests).

---

# 📈 Required KPIs

All endpoints must support:

- Date range filter (`order_purchase_timestamp`)
- At least 2 additional filters (e.g., `order_status`, `product_category_name`, `customer_state`)

---

## 1️⃣ GMV (Gross Merchandise Value)
