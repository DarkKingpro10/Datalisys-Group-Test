-- Crear esquemas requeridos por la arquitectura de la prueba técnica
-- Ejecutado automáticamente por el entrypoint de Postgres al inicializar la base de datos

CREATE SCHEMA IF NOT EXISTS raw AUTHORIZATION kpi_user;
CREATE SCHEMA IF NOT EXISTS clean AUTHORIZATION kpi_user;
CREATE SCHEMA IF NOT EXISTS gold AUTHORIZATION kpi_user;

GRANT USAGE ON SCHEMA raw, clean, gold TO kpi_user;
GRANT CREATE ON SCHEMA raw, clean, gold TO kpi_user;
