Para iniciar correctamente la API
1. Instalar Bun en caso de no tenerlo instalado.
    curl https://bun.sh/install | bash

2. instalar dependecias con:
    bun install

3. Modificar el .env con la base de datos donde quiera utilziarlo copiando el siguiente texto y modificando en caso de ser necesario:
DATABASE_URL="postgresql://<usuario>:<contraseña>@localhost:<puerto>/<base_de_datos>"
usuario por defecto postgres
puerto por defecto 5432

4.  Iniciar la API.  
    bun run server.ts

La API estará disponible en `http://localhost:3000`.

Para probar el /api/registrar:
{
    "nombre": "Daniel",
    "direccion_correo": " daniel.duenas@usm.cl",
    "clave": "clavecita123",
    "descripcion": "Una descripcion que puede escribir el usuario "
}
