This are the instructions for the Full Stack Test, also read the .github/ folder to follow more instructions and skills each project (Frontend) and (Backend) has their own specific skills and instructions that you as an agent has to follow per each request.

For any changes, you have to documented in the README.md at the root.

ALSO IN THE .agents THEIR IS SKILLS THAT YOU HAVE TO USE DEPENDS ON THE USER REQUEST

# SKILLS INDEX

- **backend-patterns**: Estructura y patrones para backend; usar al diseñar arquitectura hexagonal, puertos/adapters y diseño de APIs. Ruta: [.agents/skills/backend-patterns/SKILL.md](.agents/skills/backend-patterns/SKILL.md)

- **etl-sync-job-builder**: Patrones para ETL y sincronización (idempotencia, watermark, retries); llamar al diseñar o implementar jobs ETL y orquestación. Ruta: [.agents/skills/etl-sync-job-builder/SKILL.md](.agents/skills/etl-sync-job-builder/SKILL.md)

- **express-typescript**: Buenas prácticas para Express + TypeScript (middleware, routing, validación); usar al implementar controladores y adapters HTTP. Ruta: [.agents/skills/express-typescript/SKILL.md](.agents/skills/express-typescript/SKILL.md)

- **find-skills**: Guía para descubrir o instalar otras skills; usar cuando necesites localizar una skill adecuada. Ruta: [.agents/skills/find-skills/SKILL.md](.agents/skills/find-skills/SKILL.md)

- **prisma-client-api**: Referencia de Prisma Client (consultas, filtros, transacciones); usar al escribir queries o repositorios ORM. Ruta: [.agents/skills/prisma-client-api/SKILL.md](.agents/skills/prisma-client-api/SKILL.md) — referencias adicionales en [.agents/skills/prisma-client-api/references](.agents/skills/prisma-client-api/references)

- **vercel-react-best-practices**: Reglas y optimizaciones para Next.js/React; usar al optimizar rendimiento, data-fetching y componentes. Ruta: [.agents/skills/vercel-react-best-practices/SKILL.md](.agents/skills/vercel-react-best-practices/SKILL.md)

- **web-design-guidelines**: Directrices de UI/UX y accesibilidad; usar al revisar la interfaz y la experiencia de usuario. Ruta: [.agents/skills/web-design-guidelines/SKILL.md](.agents/skills/web-design-guidelines/SKILL.md)

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


## NEXTJS DOCUMENTATION


<!-- NEXT-AGENTS-MD-START -->[Next.js Docs Index]|root: ./.next-docs|STOP. What you remember about Next.js is WRONG for this project. Always search docs and read before any task.|If docs missing, run this command first: npx @next/codemod agents-md --output AGENTS.md|01-app:{04-glossary.mdx}|01-app/01-getting-started:{01-installation.mdx,02-project-structure.mdx,03-layouts-and-pages.mdx,04-linking-and-navigating.mdx,05-server-and-client-components.mdx,06-cache-components.mdx,07-fetching-data.mdx,08-updating-data.mdx,09-caching-and-revalidating.mdx,10-error-handling.mdx,11-css.mdx,12-images.mdx,13-fonts.mdx,14-metadata-and-og-images.mdx,15-route-handlers.mdx,16-proxy.mdx,17-deploying.mdx,18-upgrading.mdx}|01-app/02-guides:{analytics.mdx,authentication.mdx,backend-for-frontend.mdx,caching.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,data-security.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,json-ld.mdx,lazy-loading.mdx,local-development.mdx,mcp.mdx,mdx.mdx,memory-usage.mdx,multi-tenant.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,prefetching.mdx,production-checklist.mdx,progressive-web-apps.mdx,public-static-pages.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,single-page-applications.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx,videos.mdx}|01-app/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|01-app/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|01-app/02-guides/upgrading:{codemods.mdx,version-14.mdx,version-15.mdx,version-16.mdx}|01-app/03-api-reference:{07-edge.mdx,08-turbopack.mdx}|01-app/03-api-reference/01-directives:{use-cache-private.mdx,use-cache-remote.mdx,use-cache.mdx,use-client.mdx,use-server.mdx}|01-app/03-api-reference/02-components:{font.mdx,form.mdx,image.mdx,link.mdx,script.mdx}|01-app/03-api-reference/03-file-conventions/01-metadata:{app-icons.mdx,manifest.mdx,opengraph-image.mdx,robots.mdx,sitemap.mdx}|01-app/03-api-reference/03-file-conventions:{default.mdx,dynamic-routes.mdx,error.mdx,forbidden.mdx,instrumentation-client.mdx,instrumentation.mdx,intercepting-routes.mdx,layout.mdx,loading.mdx,mdx-components.mdx,not-found.mdx,page.mdx,parallel-routes.mdx,proxy.mdx,public-folder.mdx,route-groups.mdx,route-segment-config.mdx,route.mdx,src-folder.mdx,template.mdx,unauthorized.mdx}|01-app/03-api-reference/04-functions:{after.mdx,cacheLife.mdx,cacheTag.mdx,connection.mdx,cookies.mdx,draft-mode.mdx,fetch.mdx,forbidden.mdx,generate-image-metadata.mdx,generate-metadata.mdx,generate-sitemaps.mdx,generate-static-params.mdx,generate-viewport.mdx,headers.mdx,image-response.mdx,next-request.mdx,next-response.mdx,not-found.mdx,permanentRedirect.mdx,redirect.mdx,refresh.mdx,revalidatePath.mdx,revalidateTag.mdx,unauthorized.mdx,unstable_cache.mdx,unstable_noStore.mdx,unstable_rethrow.mdx,updateTag.mdx,use-link-status.mdx,use-params.mdx,use-pathname.mdx,use-report-web-vitals.mdx,use-router.mdx,use-search-params.mdx,use-selected-layout-segment.mdx,use-selected-layout-segments.mdx,userAgent.mdx}|01-app/03-api-reference/05-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,appDir.mdx,assetPrefix.mdx,authInterrupts.mdx,basePath.mdx,browserDebugInfoInTerminal.mdx,cacheComponents.mdx,cacheHandlers.mdx,cacheLife.mdx,compress.mdx,crossOrigin.mdx,cssChunking.mdx,devIndicators.mdx,distDir.mdx,env.mdx,expireTime.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,htmlLimitedBots.mdx,httpAgentOptions.mdx,images.mdx,incrementalCacheHandlerPath.mdx,inlineCss.mdx,isolatedDevBuild.mdx,logging.mdx,mdxRs.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactCompiler.mdx,reactMaxHeadersLength.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,sassOptions.mdx,serverActions.mdx,serverComponentsHmrCache.mdx,serverExternalPackages.mdx,staleTimes.mdx,staticGeneration.mdx,taint.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,turbopackFileSystemCache.mdx,typedRoutes.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,viewTransition.mdx,webVitalsAttribution.mdx,webpack.mdx}|01-app/03-api-reference/05-config:{02-typescript.mdx,03-eslint.mdx}|01-app/03-api-reference/06-cli:{create-next-app.mdx,next.mdx}|02-pages/01-getting-started:{01-installation.mdx,02-project-structure.mdx,04-images.mdx,05-fonts.mdx,06-css.mdx,11-deploying.mdx}|02-pages/02-guides:{analytics.mdx,authentication.mdx,babel.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,lazy-loading.mdx,mdx.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,post-css.mdx,preview-mode.mdx,production-checklist.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx}|02-pages/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|02-pages/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|02-pages/02-guides/upgrading:{codemods.mdx,version-10.mdx,version-11.mdx,version-12.mdx,version-13.mdx,version-14.mdx,version-9.mdx}|02-pages/03-building-your-application/01-routing:{01-pages-and-layouts.mdx,02-dynamic-routes.mdx,03-linking-and-navigating.mdx,05-custom-app.mdx,06-custom-document.mdx,07-api-routes.mdx,08-custom-error.mdx}|02-pages/03-building-your-application/02-rendering:{01-server-side-rendering.mdx,02-static-site-generation.mdx,04-automatic-static-optimization.mdx,05-client-side-rendering.mdx}|02-pages/03-building-your-application/03-data-fetching:{01-get-static-props.mdx,02-get-static-paths.mdx,03-forms-and-mutations.mdx,03-get-server-side-props.mdx,05-client-side.mdx}|02-pages/03-building-your-application/06-configuring:{12-error-handling.mdx}|02-pages/04-api-reference:{06-edge.mdx,08-turbopack.mdx}|02-pages/04-api-reference/01-components:{font.mdx,form.mdx,head.mdx,image-legacy.mdx,image.mdx,link.mdx,script.mdx}|02-pages/04-api-reference/02-file-conventions:{instrumentation.mdx,proxy.mdx,public-folder.mdx,src-folder.mdx}|02-pages/04-api-reference/03-functions:{get-initial-props.mdx,get-server-side-props.mdx,get-static-paths.mdx,get-static-props.mdx,next-request.mdx,next-response.mdx,use-params.mdx,use-report-web-vitals.mdx,use-router.mdx,use-search-params.mdx,userAgent.mdx}|02-pages/04-api-reference/04-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,assetPrefix.mdx,basePath.mdx,bundlePagesRouterDependencies.mdx,compress.mdx,crossOrigin.mdx,devIndicators.mdx,distDir.mdx,env.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,httpAgentOptions.mdx,images.mdx,isolatedDevBuild.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,serverExternalPackages.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,webVitalsAttribution.mdx,webpack.mdx}|02-pages/04-api-reference/04-config:{01-typescript.mdx,02-eslint.mdx}|02-pages/04-api-reference/05-cli:{create-next-app.mdx,next.mdx}|03-architecture:{accessibility.mdx,fast-refresh.mdx,nextjs-compiler.mdx,supported-browsers.mdx}|04-community:{01-contribution-guide.mdx,02-rspack.mdx}<!-- NEXT-AGENTS-MD-END -->
