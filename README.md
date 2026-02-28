Proyecto: Commercial KPI Dashboard — inicialización Docker

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
1. Obtener imágenes y construir servicios:

```powershell
docker compose pull
docker compose build --pull
```

2. Levantar en segundo plano:

```powershell
docker compose up -d
```

3. Consultar logs del contenedor de base de datos:

```powershell
docker compose logs -f db
```

Servicios implementados
-----------------------
- `frontend`: imagen construida desde `./frontend`. Puerto expuesto: `3000`.
- `backend`: imagen construida desde `./backend`. Puerto expuesto: `8000`. Variable `DATABASE_URL` configurada en `docker-compose.yml`.
- `db`: Postgres sobre imagen DHI hardened (`dhi/postgres:18-debian13`). Volumen persistente `db-data` y carpeta `db/init` montada en `/docker-entrypoint-initdb.d`.

Decisión sobre la base de datos
------------------------------
- Imagen elegida: `dhi/postgres:18-debian13`.
- Razonamiento: balance entre compatibilidad (Debian) y hardening integrado proporcionado por DHI.
- Inicialización: los archivos en `db/init/` se ejecutan automáticamente la primera vez que se crea el volumen de datos.

Artefactos añadidos
-------------------
- `docker-compose.yml`: servicios `frontend`, `backend` y `db` con `container_name`, políticas `restart`, variables de entorno mínimas y volúmenes.
- `frontend/Dockerfile` y `backend/Dockerfile`: basadas en `node:24.14.0-bookworm-slim` con actualización segura del sistema durante la build.
- `db/init/01_create_schemas.sql`: crea esquemas `raw`, `clean`, `gold` y concede `USAGE` y `CREATE` a `kpi_user`.

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

Estado actual (resumen)
-----------------------
- Infra básica en `docker-compose.yml` y Dockerfiles para frontend/backend.
- Servicio Postgres DHI configurado con inicialización de esquemas.
- No se incluyeron datos (CSV) ni un job de carga; esos artefactos se generarán cuando se disponga de los CSV.

Notas operativas
----------------
- Credenciales en `docker-compose.yml` (temporal):
  - Usuario: `kpi_user`
  - Contraseña: `kpi_pass`
  - Base: `kpi_db`
- Las agregue por ser una prueba técnica deberian de estar en un archivo .env

Referencias
----------
- DHI Postgres guides: https://hub.docker.com/hardened-images/catalog/dhi/postgres/guides


