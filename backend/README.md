# Backend

Este backend está preparado para trabajar con Node.js, TypeScript y Express, siguiendo buenas prácticas de arquitectura y modularidad.

## Tecnologías utilizadas
- **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- **TypeScript**: Superset de JavaScript que añade tipado estático y ayuda a mantener el código robusto y escalable.
- **Express**: Framework minimalista para la creación de APIs REST y manejo de rutas HTTP.

## Estructura de carpetas
- `/src`: Código fuente principal del backend.
- `/etl`: Scripts de orquestación ETL (Extracción, Transformación y Carga).
- `/sql`: Scripts SQL para la creación y carga de datos en la base de datos.

## Proceso de creación de la capa raw
Se definieron las tablas raw en el archivo `backend/sql/raw_tables.sql`, reflejando fielmente la estructura de los archivos CSV originales. Se agregaron comandos `COPY` para cargar los datos desde los archivos CSV ubicados en `/data/raw` hacia las tablas raw correspondientes. Cada tabla usa `CREATE TABLE IF NOT EXISTS` para asegurar idempotencia y evitar duplicados al reiniciar el proceso. Los scripts SQL están preparados para ejecutarse en PostgreSQL, ajustando las rutas según la configuración del contenedor o entorno.

### Archivos CSV utilizados
- olist_customers_dataset.csv
- olist_geolocation_dataset.csv
- olist_orders_dataset.csv
- olist_order_items_dataset.csv
- olist_order_payments_dataset.csv
- olist_order_reviews_dataset.csv
- olist_products_dataset.csv
- olist_sellers_dataset.csv
- product_category_name_translation.csv

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

La documentación técnica anterior debe mantenerse sincronizada con los scripts en `backend/sql` y cualquier modificación del ETL.

## Política de rango de fechas y utilidades compartidas

Sección añadida: documentación sobre cómo el backend maneja parámetros de rango de fechas recibidos desde el frontend.

- Ubicación de la utilidad: `backend/src/shared/utils/dateRange.ts`.
- Propósito: centralizar la lógica de defaults y validaciones para rangos de fecha (`from`, `to`).

Comportamiento por defecto implementado:

- Si `to` no se proporciona, se asume `to = ahora` (fecha actual en la máquina que ejecuta el backend).
- Si `from` no se proporciona, se asume `from = to - 30 días`.
- Si ambos faltan, el rango por defecto es últimos 30 días.
- La función valida que `from <= to` y aplica un límite máximo configurable (por defecto 365 días). Si el rango excede el máximo, se lanza un error de validación.

Interfaz y opciones:

- `normalizeDateRange(from?: unknown, to?: unknown, opts?: { defaultDays?: number; maxDays?: number })` → `{ from: Date; to: Date }`.
- `from` y `to` aceptan `unknown` porque los valores vienen de `req.query`; la función hace parsing seguro y devuelve objetos `Date` o lanza errores claros.

Responsabilidad por capas:

- Validación ligera de tipos (p. ej. que `from` y `to` sean fechas parseables) se realiza con Zod en `backend/src/shared/validation/kpis.schema.ts`.
- Decisiones de negocio (defaults, límites de rango) se implementan en la utilidad `dateRange.ts` y son aplicadas por los controladores (`kpis.controller.ts`, `trend.controller.ts`, `rankings.controller.ts`).
- Si se requiere garantía adicional, el caso de uso (`application`) puede volver a aplicar la misma utilidad antes de llamar al repositorio.

Notas sobre tipado y seguridad del código

- No se usa `any` en la implementación de la utilidad: se acepta `unknown` y se valida/parsea explícitamente.
- El esquema Zod valida y normaliza inputs básicos; la utilidad aplica los defaults y lanza errores de negocio si el rango es inválido o demasiado grande.
- Documentar la zona horaria: por defecto se usan objetos `Date` del entorno del servidor; recomendamos documentar y acordar usar UTC si la consistencia es importante entre frontend/backend.

Ejemplo de uso (controlador):

```ts
const parsed = KpisQuerySchema.parse(req.query)
const range = normalizeDateRange(parsed.from, parsed.to)
// range.from y range.to son objetos Date listos para pasar a la capa de aplicación
```

Cambios realizados en el repositorio:

- Añadida `backend/src/shared/utils/dateRange.ts` con la implementación y documentación en español.
- Actualizados controladores para usar `normalizeDateRange` en lugar de normalizadores dispersos.
- `backend/src/shared/validation/kpis.schema.ts` revertido a validación pura (sin defaults).

 
Ejecución del ETL por separado
--------------------------------
Decisión operativa: en desarrollo el `backend` arranca con dependencia únicamente de la base de datos (`db`). El job ETL se ejecuta de forma independiente cuando se desee (por ejemplo, para ejecutar las transformaciones `clean` y construir `dwh`). Importante: el `etl` está diseñado para ejecutar SQL contra la base de datos; NO debe leer ni montar archivos CSV desde su propio contenedor. Cargas iniciales de `raw` (por ejemplo `COPY` desde CSV) deben realizarse dentro de la instancia de Postgres (scripts de init o un job separado con acceso a los CSV).

Comandos rápidos:

- Levantar DB + backend + frontend (en background):

```bash
docker compose up -d --build db backend frontend
```

- Ejecutar el job ETL (foreground):

```bash
docker compose up --build etl
```

- Ejecutar ETL una sola vez y eliminar contenedor al terminar:

```bash
docker compose run --rm etl
```

- Ver logs del ETL:

```bash
docker compose logs -f etl
```

Notas:

- Como el servicio `etl` no se reinicia automáticamente (`restart: "no"`), para volver a ejecutar la carga lanza de nuevo `docker compose up --build etl`.

## Swagger / OpenAPI

Se añadió documentación interactiva OpenAPI usando `swagger-jsdoc` + `swagger-ui-express`.

- URL local (development): `http://localhost:8000/api/docs`
- La UI carga un spec generado por JSDoc/`swagger-jsdoc`. Para añadir descripciones por endpoint, puede colocarse JSDoc compatible en los controladores en `src/adapters/http/`.

Nota: la documentación muestra las rutas registradas y cualquier anotación OpenAPI encontrada en los controladores. Es recomendable añadir JSDoc para los parámetros y respuestas críticas.
