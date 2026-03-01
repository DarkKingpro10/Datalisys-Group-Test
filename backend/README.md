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
