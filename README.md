Proyecto: Commercial KPI Dashboard — inicialización Docker

Actualización frontend (marzo 2026)
----------------------------------
- Se implementó dark mode profesional y escalable en el frontend (`light` / `dark` / `system`).
- Se usa Zustand para el estado global de tema y persistencia de preferencia en `localStorage`.
- Se añadió un hook compartido `use-store` para evitar desajustes de hidratación de Zustand en componentes cliente renderizados por Next.js.
- Se añadió un `ThemeProvider` para hidratar estado, aplicar clase de tema en `html` y sincronizar cambios del sistema cuando el modo es `system`.
- Se migraron estilos globales a tokens semánticos en `frontend/src/app/globals.css` para facilitar consistencia visual futura en sidebar, cards, tablas y charts.
- Se creó un selector de tema reusable con Tabler Icons en `frontend/src/shared/components/theme-toggle.tsx`.
- Se actualizó `frontend/src/app/layout.tsx` para inicializar tema antes de hidratar y minimizar parpadeo visual.
- Se implementó shell de dashboard con sidebar y rutas `/overview` y `/rankings` bajo App Router.
- Se creó archivo central de rutas frontend en `frontend/src/features/dashboard/config/routes.ts`.
- Se agregó capa API tipada en `frontend/src/features/dashboard/api/dashboard-api.ts` para consumir `/kpis`, `/trend/revenue`, `/rankings/products`.
- Se implementaron filtros globales (rango de fechas + `customer_state` + `order_status`) con query params y `useActionState`.
- Se aplicó render con `Suspense` y skeletons (sin texto "cargando") para KPIs, tendencia y ranking.
- Se cambió `frontend/src/app/page.tsx` a redirección server-side hacia `/overview`.
- Se refactorizó la UI del dashboard a componentes por feature (`frontend/src/features/overview` y `frontend/src/features/rankings`) para mejorar screaming architecture.
- Se añadió tolerancia a fallos de API por bloque: si falla backend se muestra estado de error local sin tumbar toda la ruta.
- Se integró manejo de error por ruta en el segmento `frontend/src/app/(dashboard)/error.tsx` con panel ocultable y acción de reintento.
- Se ajustó el rango inicial de filtros del frontend para cargar datos desde `2016-08-31` hasta la fecha actual en la primera visita.
- Se amplió la validación de rango en backend para permitir consultas de hasta 11 años de diferencia.
- Se añadió modo de depuración temporal de API en frontend activable con `debug_api=1` para visualizar payload/error real de endpoints.
- Se integraron endpoints de metadata (`/meta/order-statuses`, `/meta/customer-states`, `/meta/product-categories`) para poblar selects de filtros y enviar `code` como valor.
- Se refactorizó frontend para screaming architecture más estricta: módulos de dominio en `frontend/src/features/dashboard/*` y `shared` solo para piezas transversales.
- Se implementó `use cache` + `cacheLife` + `cacheTag` para metadata de filtros y revalidación on-demand con `revalidateTag` mediante `POST /api/revalidate/dashboard-meta`.
- Se unificó la estrategia de caché de metadata: `use cache` + `cacheLife` + `cacheTag` sin combinar `fetch(...next.revalidate)` en esas funciones para evitar políticas ambiguas.
- Se añadió soporte de URL interna de backend para SSR en frontend (`NEXT_SERVER_API_URL`) para evitar errores al usar `localhost` cuando el frontend corre en Docker.
- Se corrigió la resolución de base URL en frontend para SSR/CSR (evitando lógica invertida server/client y URLs con doble `/`), eliminando fallos de conexión falsos hacia `localhost`.

Documentación relacionada:
- Frontend detallado: `frontend/README.md`
- Alcance general: este README

Resumen
-------
Configuración inicial para levantar los servicios esenciales del proyecto: `frontend`, `backend` y la base de datos `db` (Postgres). Este documento registra las decisiones y artefactos añadidos hasta la fecha.

Contexto del proyecto
----------------------
Este repositorio forma parte de la prueba técnica "Commercial KPI Dashboard". Resumen del alcance y requisitos principales:

- Frontend: Next.js (TypeScript).
- Backend: Node.js + Express (TypeScript).
- Base de datos: PostgreSQL.
- ORM: Prisma o TypeORM (requerido para el backend).
- Arquitectura backend: Hexagonal (Ports & Adapters).
- Infraestructura: Docker Compose con tres servicios (`frontend`, `backend`, `db`).
- Modelado analítico: Star Schema; se requieren capas de datos en Postgres: `raw`, `clean`, `gold`.
 - Modelado analítico: Star Schema; se requieren capas de datos en Postgres: `raw`, `clean`, `dwh`.
- Dataset: Brazilian E-Commerce Public Dataset by Olist (CSV desde mirror de GitHub).

Regla crítica del enunciado: el backend NO debe consultar las capas `raw` o `clean` directamente. Todas las consultas deben originarse desde `gold.fact_sales` (se permite hacer JOIN con dimensiones, pero la tabla de hecho `gold.fact_sales` debe ser la tabla conductora).

No se permite el uso de datos mock para la implementación (excepto pruebas unitarias); los CSV deben descargarse y cargarse en `raw` por ende no lo cagare con Prisma sino con una query que configurare para
que al cargar el contenedor se corra.

Requisitos
----------
- Docker Desktop (Windows) con soporte para contenedores Linux
- Docker Compose v2+ (comando `docker compose`)

Cómo levantar el entorno
------------------------

## Desarrollo
Para entorno de desarrollo, ejecuta:

```bash
docker compose up -d --build
```

Esto usará únicamente el archivo `docker-compose.yml` y las variables de entorno de `.env`. Los volúmenes locales se montan para desarrollo interactivo y hot reload.

## Producción
Para entorno de producción, ejecuta:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

Esto combina la configuración base y la de producción, sobreescribiendo comandos, variables y volúmenes según sea necesario para despliegue. En producción no se montan volúmenes locales y los servicios ejecutan el build y luego el start.

## Logs y verificación
Para consultar logs del contenedor de base de datos:

```bash
docker compose logs -f db
```

Servicios implementados
-----------------------
- `frontend`: imagen construida desde `./frontend`. Puerto expuesto: `3000`.
- `backend`: imagen construida desde `./backend`. Puerto expuesto: `8000`. Variable `DATABASE_URL` configurada en `docker-compose.yml`.
- `db`: Postgres oficial (`postgres:18`). Volumen persistente `postgres_data` y la carpeta local `./data/raw` se monta en el contenedor en `/data/raw` para facilitar la carga de CSVs.

Decisión sobre la base de datos
------------------------------
- Imagen elegida: `postgres:18` (imagen oficial).
- Razonamiento: la imagen oficial de Postgres está públicamente disponible y evita problemas al intentar acceder a imágenes privadas; mantiene compatibilidad con Postgres 18.

Artefactos añadidos
-------------------
- `docker-compose.yml`: servicios `frontend`, `backend` y `db` con `container_name`, políticas `restart`, variables de entorno mínimas y volúmenes.
- `frontend/Dockerfile` y `backend/Dockerfile`: basadas en `node:24.14.0-bookworm-slim` con actualización segura del sistema durante la build.
- `db/init/01_create_schemas.sql`: crea esquemas `raw`, `clean`, `gold` y concede `USAGE` y `CREATE` a `kpi_user`.
 - `db/init/01_create_schemas.sql`: crea esquemas `raw`, `clean`, `dwh` y concede `USAGE` y `CREATE` a `kpi_user`.

DWH / Star schema
------------------
- Esquema: `dwh` (el proyecto usa `dwh` como nombre de capa analítica; en la documentación antigua aparece `gold`/`golden` pero se unificó a `dwh`).
- Grain: la tabla de hechos `dwh.fact_sales` tiene grano por ítem (1 fila por `order_id + order_item_id`).
- Dimensiones implementadas: `dwh.dim_date`, `dwh.dim_customer`, `dwh.dim_product`, `dwh.dim_order`.
- Keys: dimensiones con `PRIMARY KEY` (por ejemplo `dim_product.product_id`, `dim_customer.customer_id`, `dim_date.date`, `dim_order.order_id`). La tabla `dwh.fact_sales` tiene `PRIMARY KEY (order_id, order_item_id)`.

Asignación de `payment_value` a nivel ítem
-----------------------------------------
- Problema: en Olist los pagos están a nivel de orden y los items a nivel ítem. Para mantener el grano de hecho (1 fila por item) se aplica una regla documentada y reproducible.
- Regla aplicada (implementada en `backend/sql/04-dwh_tables.sql`): cada `payment_value` por `order_id` se asigna proporcionalmente a cada item según su `item_price`:

  payment_value_allocated_item = payment_total_order * (item_price / SUM(item_price) por order_id)

- Detalles y excepciones:
  - Si la suma de `item_price` por orden es 0, se asigna `0` (se evita división por cero usando `NULLIF`).
  - Si no hay pagos registrados para la orden, `payment_value_allocated` será 0.

Regla crítica del enunciado (recordatorio)
-----------------------------------------
- El backend no debe consultar las capas `raw` ni `clean`. Todas las consultas del API deben originarse desde `dwh.fact_sales` (la fact es la tabla conductora). Si se requieren atributos adicionales, se permiten `JOIN` a dimensiones.

Cumplimiento del enunciado
-------------------------
- El backend debe leer únicamente desde `gold.fact_sales`. Para apoyar esto se creó el esquema `gold` y se documentó la necesidad de usar nombres de esquema cualificados desde la aplicación.

Verificación y comandos útiles
----------------------------
Listar bases y esquemas:

```powershell
docker compose exec db psql -U postgres -c "\l"
docker compose exec db psql -U kpi_user -d kpi_db -c "\dn"
```

Comprobar usuario de sesión:

```powershell
docker compose exec db psql -U kpi_user -d kpi_db -c "SELECT current_user, session_user;"
```

- Estado actual (resumen)
-----------------------
- Infra básica en `docker-compose.yml` y Dockerfiles para frontend/backend.
- Servicio Postgres (imagen oficial `postgres:18`) configurado; la inicialización de esquemas se gestiona mediante migraciones/ETL o scripts montados en `/docker-entrypoint-initdb.d`.
- No se incluyeron datos (CSV) ni un job de carga; esos artefactos se generarán cuando se disponga de los CSV.
 - No se incluyeron datos (CSV) ni un job de carga; esos artefactos se generarán cuando se disponga de los CSV.
 - Nota sobre `etl`: el servicio `etl` ejecuta las transformaciones y migraciones mediante SQL contra la base de datos (`dwh`/`gold`), no debe leer los CSV desde el contenedor. Los CSV deben estar disponibles en la instancia de Postgres (montados en `/data/raw`) o cargados en la tabla `raw` por procesos de inicialización fuera del contenedor `etl`.

Notas operativas
----------------
- Credenciales en `docker-compose.yml` (temporal):
  - Usuario: `kpi_user`
  - Contraseña: `kpi_pass`
  - Base: `kpi_db`
- Las agregue por ser una prueba técnica deberian de estar en un archivo .env

Nota sobre Postgres 18+ y montaje de datos
----------------------------------------
- A partir de Postgres 18 la imagen oficial almacena datos en subdirectorios específicos por versión (p. ej. `/var/lib/postgresql/18`). Para evitar problemas de compatibilidad y facilitar actualizaciones con `pg_upgrade`, se recomienda montar el directorio padre `/var/lib/postgresql` en lugar de `/var/lib/postgresql/data`.
- Si ya existe un volumen creado con datos antiguos montados en `/var/lib/postgresql/data`, ese contenido puede quedar fuera del nuevo layout y provocar fallos al arrancar. Opciones:
  - Hacer backup del volumen antes de cualquier cambio.
  - Reprovisionar (eliminar y recrear) el volumen si no necesitas conservar los datos.
  - Realizar una migración con `pg_upgrade` si necesitas preservar datos entre versiones (requiere ambos binarios/contenedores de versión y pasos adicionales).
- Comando rápido para recrear el stack (esto BORRA datos del volumen):

```powershell
docker compose down
docker volume rm postgres_data
docker compose up -d --build
```

Ejemplo para hacer backup del volumen antes (Linux/macOS example — en Windows adapta paths):

```bash
docker run --rm -v postgres_data:/var/lib/postgresql -v "$PWD"/backup:/backup alpine \
  tar -czf /backup/postgres_data-backup.tar -C /var/lib/postgresql .
```

Si los datos son críticos, haz un backup y considera seguir un flujo de `pg_upgrade` en lugar de eliminar el volumen.

Referencias
----------
- Postgres official image: https://hub.docker.com/_/postgres

# Ejecución de entornos con Docker Compose

## Desarrollo

Para levantar el entorno de desarrollo:

```bash
docker compose up -d --build
```

Esto usará únicamente el archivo `docker-compose.yml` y las variables de entorno de `.env`. Se montan los volúmenes locales para hot reload y desarrollo interactivo.

## Producción

Para levantar el entorno de producción, se combinan los archivos base y de producción:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

Esto aplica las configuraciones adicionales y sobreescribe lo necesario para producción (comandos, variables, volúmenes, etc). En producción, los servicios ejecutan el build y luego el start, y no montan volúmenes locales.

## Estructura recomendada
- `docker-compose.yml`: archivo base, define servicios y configuración común para todos los entornos.
- `docker-compose.prod.yml`: archivo de overrides, solo incluye los cambios necesarios para producción (comando de build/start, variables, volúmenes vacíos, etc).
- `.env`: variables de entorno compartidas, puedes sobreescribirlas en el compose de producción si lo necesitas.

## Notas
- El backend usa multi-stage build en el Dockerfile para optimizar la imagen final.
- La forma recomendada para producción es siempre combinar ambos archivos con el comando mostrado arriba.
- Mantén las credenciales y variables sensibles en `.env` y nunca en los archivos compose directamente.


