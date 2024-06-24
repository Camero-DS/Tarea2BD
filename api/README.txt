Para iniciar correctamente la API
1. Instalar Bun en caso de no tenerlo instalado.
    curl https://bun.sh/install | bash

2. instalar dependecias con:
    bun install
    bun install elysia
    bun install @prisma/client

3. Modificar el .env con la base de datos donde quiera utilziarlo copiando el siguiente texto y modificando en caso de ser necesario:
DATABASE_URL="postgresql://<usuario>:<contraseña>@localhost:<puerto>/<base_de_datos>"
usuario por defecto postgres
puerto por defecto 5432

4. Hacer la migracion a sql
    npx prisma migrate dev --name init


5.  Iniciar la API.  
    bun run server.ts

La API estará disponible en `http://localhost:3000`.

El marcar correos y desmarcar corresponde a los email por ende si necesita probar su funcionamiento 
{
    "correo" : "daniel.duenas@usm.cl",
    "clave" : "clavecita123",
    "correo_favorito" : fernando.banz@sansano.usm.cl
}