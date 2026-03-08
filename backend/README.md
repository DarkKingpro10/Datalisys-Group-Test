## Commercial KPI Dashboard — Backend

Este backend implementa una API REST en Node.js + TypeScript, diseñada para exponer KPIs comerciales y servicios analíticos sobre una capa de datos modelada en estrella (star schema) y poblada por un proceso ETL reproducible. El backend es la única fuente de verdad para métricas y rankings consumidos por el frontend.

### Stack tecnológico
- Node.js 18+
- TypeScript
- Express
- Prisma ORM (PostgreSQL)
- PostgreSQL (capas: raw, clean, dwh)

### Decisiones de negocio y arquitectura
- Todas las consultas analíticas provienen exclusivamente de `dwh.fact_sales` (grain: 1 fila por `order_id + order_item_id`).
- El modelo analítico se materializa en SQL sobre la capa `dwh` para facilitar auditoría y reproducibilidad.
- La arquitectura hexagonal separa casos de uso, controladores, repositorios y modelos de dominio.
- Paginación basada en `offset/limit` para endpoints de auditoría, priorizando mantenibilidad y ordenamiento multi-columna.

### Estructura del proyecto
- `src/adapters/http`: controladores y rutas HTTP
- `src/application`: casos de uso (reglas de negocio)
- `src/domain`: modelos y contratos
- `src/infrastructure/prisma`: repositorios ORM (lectura desde `dwh`)
- `src/etl` y `sql/`: scripts y orquestación ETL

### Archivos CSV utilizados
Ubicados en `/data/raw`:
- olist_customers_dataset.csv
- olist_geolocation_dataset.csv
- olist_orders_dataset.csv
- olist_order_items_dataset.csv
- olist_order_payments_dataset.csv
- olist_order_reviews_dataset.csv
- olist_products_dataset.csv
- olist_sellers_dataset.csv
- product_category_name_translation.csv

## Proceso de creación de la capa raw
Se definieron las tablas raw en el archivo `backend/sql/raw_tables.sql`, reflejando fielmente la estructura de los archivos CSV originales. Se agregaron comandos `COPY` para cargar los datos desde los archivos CSV ubicados en `/data/raw` hacia las tablas raw correspondientes. Cada tabla usa `CREATE TABLE IF NOT EXISTS` para asegurar idempotencia y evitar duplicados al reiniciar el proceso. Los scripts SQL están preparados para ejecutarse en PostgreSQL, ajustando las rutas según la configuración del contenedor o entorno.

### Ejemplo de carga de datos
```sql
COPY raw_customers FROM '/data/raw/olist_customers_dataset.csv' DELIMITER ',' CSV HEADER;
```

Los scripts contienen instrucciones `COPY` como ejemplo de cómo cargar CSVs en las tablas `raw`, pero esas instrucciones deben ejecutarse dentro de Postgres (por ejemplo, como scripts de inicialización en el contenedor `db` o mediante un job que ejecute SQL contra la base). El servicio `etl` NO debe montar ni leer los CSVs directamente; su responsabilidad es ejecutar las transformaciones SQL (`clean` y `dwh`) contra la base de datos.
## Documentación técnica: Data layers y decisiones de modelado
Esta sección documenta, de forma técnica, las decisiones y el flujo de datos entre las capas `raw`, `clean` y `dwh` implementadas en los scripts SQL de `backend/sql`.

1) Capa `raw` (entrada — réplica del origen)
- Propósito: almacenar una réplica fiel de los CSV originales sin transformación, con tipos conservadores (TEXT) y sin restricciones que bloqueen la carga.
- Operación de carga: las tablas `raw.*` se recargan mediante `TRUNCATE` seguido de `COPY` desde `/data/raw/*.csv` para garantizar una recarga limpia y reproducible en entornos de ingestión inicial o refresh.
- Justificación: al mantener la capa cruda sin constraints se facilita la ingestión masiva y la auditoría; cualquier limpieza o validación se realiza en la capa `clean`.

2) Capa `clean` (conformación — calidad y deduplicación)
- Propósito: normalizar tipos, limpiar formatos, cast de timestamps, manejo de nulos y deduplicación básica.
- Transformaciones aplicadas:
	- Cast de timestamps (por ejemplo `order_purchase_timestamp::timestamp`).
	- Cast de tipos numéricos (`price::numeric`).
	- Normalización de texto (`TRIM`, `LOWER`, `UPPER`).
	- Eliminación de duplicados mediante `SELECT DISTINCT`.
- Idempotencia y estrategia anti-duplicados:
	- Para evitar duplicados en `clean.*` se usan `INSERT ... ON CONFLICT (...) DO NOTHING` sobre claves naturales/PRIMARY KEY definidas en las tablas `clean` (por ejemplo `customer_id`, `order_id`, `(order_id, order_item_id)`, `product_id`, `review_id`).
	- Donde procede, los scripts crean claves primarias o exclusivas antes de insertar para que `ON CONFLICT` funcione correctamente.
	- Alternativa técnica: cuando se requiere una carga temporal para preprocesamiento, se emplean tablas temporales (`CREATE TEMP TABLE ...`) y luego `INSERT ... ON CONFLICT` desde la temporal.

3) Capa `dwh` (star schema — capa analítica)
- Propósito: proveer la capa única de consulta para el backend y consumo analítico con modelo estrella (fact + dims).
- Nomenclatura: el repositorio unifica la capa analítica como `dwh` en el correo al inicio la menciona como gold más sinembargo se dan algunos ejemplos de el nombre dwh por lo que decidi usar dwh
- Componentes implementados:
	- `dwh.dim_date` (calendario creado a partir de `order_purchase_timestamp`).
	- `dwh.dim_customer` (customer + geo mínimo).
	- `dwh.dim_product` (product_id + categoría).
	- `dwh.dim_order` (order-level attributes y timestamps).
	- `dwh.fact_sales` (grain: 1 fila por `order_id + order_item_id`).
- Keys y grain:
	- Fact: `PRIMARY KEY (order_id, order_item_id)`.
	- Dimensiones: `PRIMARY KEY` en sus identificadores naturales.

4) Asignación de `payment_value` (regla documentada y reproducible)
- Contexto: en el dataset Olist los pagos se registran a nivel de orden, mientras que la fact tiene grano a nivel de item.
- Regla aplicada (implementada en `backend/sql/04-dwh_tables.sql`):

	payment_value_allocated_item = payment_total_order * (item_price / SUM(item_price) por order_id)

- Consideraciones técnicas:
	- Se usa `NULLIF(s.order_total_price,0)` para evitar división por cero.
	- Si no hay pagos registrados (`pay_total` es NULL), se utiliza `COALESCE(pay_total,0)` quedando la asignación en 0.
	- Tipo: la columna `payment_value_allocated` está definida como `NUMERIC` para preservar precisión monetaria; en entornos productivos se recomienda además aplicar redondeo a 2 decimales y una corrección del residual para que la suma de allocations por orden iguale exactamente `pay_total`.

5) Idempotencia y buenas prácticas de ETL
- Carga de `raw`: `TRUNCATE` + `COPY` (carga snapshot reproducible).
- Carga de `clean` y `dwh`: cargas incrementales/idempotentes con tablas temporales + `INSERT ... ON CONFLICT DO NOTHING`.
- Orden de ejecución recomendado en el job ETL:
	1. Cargar `raw` (TRUNCATE + COPY).
	2. Ejecutar transformaciones `clean` (inserciones idempotentes desde `raw`).
	3. Ejecutar construcción `dwh` (dimensiones luego la `fact_sales`).

6) Reglas de acceso y arquitectura
- Regla crítica del proyecto: el backend sólo debe consultar `dwh.fact_sales`. Cualquier atributo adicional puede obtenerse mediante JOIN a las dimensiones, pero la consulta debe tener a la fact como tabla conductora.
- Esto soporta la arquitectura hexagonal requerida: la capa de infraestructura (repositorios/ORM) expone métodos que leen exclusivamente de `dwh`.

7) Notas operativas y mejoras sugeridas
- Redondeo y residual: para evitar pequeñas diferencias entre `SUM(payment_value_allocated)` y `payment_total_order`, es recomendable aplicar un ajuste (por ejemplo, asignar el residual al último ítem de la orden).
- Validaciones: añadir un job de QA que verifique que para cada orden `ABS(SUM(payment_value_allocated) - pay_total) < 0.01`.
- Observabilidad: registrar en logs/metrics el número de filas insertadas por etapa y órdenes sin pagos.

4. **Orquestación ETL:**
	 - El job ETL ejecuta secuencialmente los scripts SQL (`01-schemas.sql`, `02-raw_tables.sql`, `03-clean_tables.sql`, `04-dwh_tables.sql`).
	 - Comandos útiles:
		 ```bash
		 docker compose up -d --build db backend frontend
		 docker compose up --build etl        # ejecuta el job ETL en foreground
		 docker compose run --rm etl         # ejecutar ETL una vez y eliminar contenedor
		 docker compose logs -f etl          # ver logs del ETL
		 ```

### Endpoints principales
Todos los endpoints devuelven JSON y validan entradas (Zod + utilidades internas):

- **GET /health**
	- Comprobación básica del servicio.
- **GET /kpis**
	- KPIs agregados: GMV, Revenue, Orders, AOV, IPO, Cancel Rate, On-time Rate.
	- Parámetros: `from`, `to`, `order_status`, `product_category_name`, `customer_state`.
	- Consulta a `dwh.fact_sales` (JOINs a dimensiones según filtros).
- **GET /trend/revenue**
	- Serie temporal (day|week) de revenue y orders.
	- Parámetros: `from`, `to`, `grain=day|week`.
- **GET /rankings/products**
	- Ranking de productos por GMV o Revenue.
	- Parámetros: `from`, `to`, `metric=gmv|revenue`, `limit`.
	- Valores permitidos para `sortBy`: `detected_at`, `total_payments`, `payments_count`, `order_id`.
	- Valores permitidos para `sortDirection`: `asc`, `desc`.

### Observabilidad y calidad
- Tests de integración en `src/integration/__tests__`.
- Ejecución:
	```bash

### Contribución y mantenimiento
- Cambios en el modelo analítico: actualizar `backend/sql/04-dwh_tables.sql` y documentar la decisión.
- Cambios en la API: actualizar controladores, casos de uso y pruebas.
- Alteraciones en la ingesta de CSV: documentar archivos y columnas afectadas.

---




**Proceso ETL (resumen operativo)**
1. Cargar los CSV en `raw.*` (ej.: ejecutar `COPY` dentro de Postgres o usar scripts de inicialización del contenedor DB).
2. Ejecutar scripts de `clean` para normalizar tipos, limpiar nulos y deduplicar (`INSERT ... ON CONFLICT DO NOTHING`).
3. Generar `dwh` (dimensiones y `fact_sales`) aplicando la regla de asignación de pagos.

Comandos útiles (desde la raíz del proyecto, con Docker Compose):

```bash
docker compose up -d --build db backend frontend
docker compose up --build etl        # ejecuta el job ETL en foreground
docker compose run --rm etl         # ejecutar ETL una vez y eliminar contenedor
docker compose logs -f etl          # ver logs del ETL
```

Nota operativa: las instrucciones `COPY` en los scripts SQL deben ejecutarse dentro de la instancia de Postgres (por ejemplo, volumen con `/data/raw` montado), no por el contenedor `etl` leyendo directamente CSVs.

**OpenAPI / Swagger**
- UI interactiva disponible en `http://localhost:8000/api/docs` cuando el servidor corre en modo development.
- El spec se genera a partir de JSDoc en los controladores (`src/adapters/http`). Añadir/actualizar JSDoc para exponer parámetros y respuestas correctamente.