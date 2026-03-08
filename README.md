# Arquitectura Docker Compose

El proyecto utiliza Docker Compose para orquestar los servicios principales: base de datos, ETL, backend y frontend. A continuación se explica cómo se construyen y activan:

## Servicios y sus imágenes

- **db**: Utiliza la imagen oficial `postgres:18` desde Docker Hub. Es el primer servicio en levantarse y cuenta con un healthcheck para asegurar que esté listo antes de que otros servicios dependientes arranquen. Monta volúmenes para persistencia y para cargar los datos raw.
- **etl**: Se construye desde el Dockerfile en la carpeta `backend` usando el target `deps`. Este servicio depende de que la base de datos esté saludable (`condition: service_healthy`). Ejecuta el job ETL para cargar y transformar los datos con el comando `pnpm etl:dev` y se apaga al terminar (`restart: "no"`).
- **backend**: También se construye desde el Dockerfile en `backend` usando el target `deps`. Depende de la base de datos (`condition: service_healthy`). Expone el puerto 8000 y ejecuta el comando `pnpm dev` para levantar el servidor Express. Monta el código fuente y los módulos.
- **frontend**: Se construye desde el Dockerfile en `frontend` usando el target `deps`. Depende del backend (no de la base de datos directamente). Expone el puerto 3000 y ejecuta `pnpm dev --webpack` para levantar Next.js. Monta el código fuente y los módulos.

## Activación secuencial

1. Primero se levanta la base de datos (`db`).
2. Cuando el healthcheck confirma que está lista, se activan los servicios `etl` y `backend`.
3. El servicio `frontend` espera a que el backend esté listo.

Esta secuencia garantiza que los datos estén disponibles y el backend listo antes de exponer la interfaz frontend.
## Commercial KPI Dashboard

Dashboard comercial para monitoreo de KPIs, tendencias y rankings de ventas. Stack: Next.js (frontend), Node.js/Express (backend), PostgreSQL.

### Recomendación de ejecución
Por recomendación del autor, siempre inicia el entorno en modo desarrollo:

```bash
docker compose up -d --build
```
Esto levanta los servicios `frontend`, `backend` y `db` con volúmenes locales para hot reload y desarrollo interactivo.

---

### Estructura del proyecto
- **Frontend:** Next.js 16, Tailwind, TanStack Table, Recharts, Zustand. Arquitectura screaming, filtros globales, cacheo de metadata, tolerancia a fallos, dark mode persistente.
- **Backend:** Node.js, Express, Prisma, arquitectura hexagonal. API REST, modelo analítico en star schema (`dwh.fact_sales`), paginación, validación, Swagger/OpenAPI.

---

### Orquestación ETL y carga de CSV
El backend implementa un proceso ETL reproducible y auditable, basado en capas de datos:

**Flujo de orquestación:**
1. **Carga de CSV en capa `raw`:**
	- Los archivos CSV originales (ubicados en `/data/raw`) se cargan en tablas `raw.*` usando comandos `COPY` dentro de Postgres.
	- Ejemplo:
	  ```sql
	  COPY raw_customers FROM '/data/raw/olist_customers_dataset.csv' DELIMITER ',' CSV HEADER;
	  ```
	- La carga es idempotente: se usa `TRUNCATE` antes de cada `COPY` para evitar duplicados.

2. **Normalización y deduplicación en capa `clean`:**
	- Se transforman tipos, se limpian nulos y se eliminan duplicados.
	- Se usan `INSERT ... ON CONFLICT DO NOTHING` sobre claves naturales para asegurar calidad y evitar duplicados.

3. **Construcción de modelo analítico en `dwh` (star schema):**
	- Se generan dimensiones (`dim_date`, `dim_customer`, `dim_product`, `dim_order`) y la tabla de hechos `fact_sales` (grain: 1 fila por `order_id + order_item_id`).
	- Asignación de `payment_value` proporcional por ítem:
	  ```sql
	  payment_value_allocated_item = payment_total_order * (item_price / SUM(item_price) por order_id)
	  ```
	- Si la suma de `item_price` es 0, se asigna 0; si no hay pagos, se asigna 0.

**Comandos para orquestación ETL:**
```bash
docker compose up --build etl        # ejecuta el job ETL en foreground
docker compose run --rm etl          # ejecuta ETL una vez y elimina contenedor
docker compose logs -f etl           # ver logs del ETL
```

**Notas técnicas:**
- El servicio `etl` ejecuta los scripts SQL secuencialmente (`01-schemas.sql`, `02-raw_tables.sql`, `03-clean_tables.sql`, `04-dwh_tables.sql`).
- Los CSV deben estar disponibles en la instancia de Postgres (montados en `/data/raw`).
- El backend solo consulta `dwh.fact_sales` (regla crítica). Si se requieren atributos adicionales, se permite JOIN a dimensiones.

---

### Documentación específica
Para detalles avanzados (endpoints, modelo analítico, decisiones técnicas, estructura de carpetas, comandos de frontend/backend, manejo de errores, variables de entorno, etc.), consulta los README de:
- `backend/README.md`
- `frontend/README.md`

---
Este README es la guía central. Para cualquier tarea específica, revisa la documentación de cada subproyecto.

---

## Comando para producción

Si necesitas levantar el entorno en modo producción, ejecuta:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

**Nota:** Se recomienda usar el entorno de desarrollo (`docker compose up -d --build`) ya que es el flujo principal trabajado y probado en este proyecto debido a que da un error por no poder generar las páginas de nextjs debido a la falta de variables.


