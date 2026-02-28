Inicialización de la base de datos

Colocare aquí los scripts SQL o shell que deban ejecutarse al primer arranque del contenedor Postgres.

Notas:
- Los archivos dentro de esta carpeta serán montados en `/docker-entrypoint-initdb.d` y ejecutados sólo la primera vez que se inicialice la base de datos.
