
  
  

  

# Ccemuc Backend



### Configuración del entorno

  

  

  

1. Crea un directorio `env/` en la raíz del proyecto backend.

  

  

  

2. Dentro del directorio `env/`, crea los siguientes archivos con sus respectivas variables de entorno:

  

  

  

a. `ccemuc-api.env`:

  

  

DB_HOST=

  

DB_NAME=

  

DB_USER=

  

DB_PASS=

  

DB_PORT=5432

  

PORT=3000

  
  

b. `db-ccemuc.env`:

  

  

POSTGRES_USER=

  

POSTGRES_PASSWORD=

  

POSTGRES_DB=

  

POSTGRES_PORT=5432

  

Estas variables deben ser las mismas especificadas en `ccemuc-api.env`.

  

  

### Ejecución del backend

  

  

  

Una vez que hayas configurado los archivos de entorno, sigue estos pasos para ejecutar el backend:

  

  

  

1. Asegúrate de tener Docker y Docker Compose instalados en tu sistema.

  

  

  

2. Desde la raíz del proyecto backend, ejecuta el siguiente comando para iniciar los servicios:

  

  

docker-compose up --build

 

  

  

3. Espera a que todos los servicios se inicien correctamente. Deberías ver logs indicando que los servicios están listos.

  

  

  

4. Una vez que todos los servicios estén en funcionamiento, el backend estará disponible en http://localhost:3000.

 

  

  

  

### Notas adicionales

  

  

  

- Asegúrate de que el puerto 3000 esté libre en tu sistema antes de iniciar los servicios del backend.

  

  

- Si necesitas detener los servicios, puedes usar `Ctrl+C` en la terminal donde ejecutaste `docker-compose up`, o ejecutar `docker-compose down` desde otra terminal en el mismo directorio.

  

  

- Para acceder a los logs de un servicio específico, puedes usar `docker-compose logs -f [nombre-del-servicio]`.