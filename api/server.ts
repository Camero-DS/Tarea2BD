import { Elysia } from 'elysia';
import { PrismaClient } from '@prisma/client';

// Inicialización del cliente Prisma para interactuar con la base de datos
const prisma = new PrismaClient();
// Inicialización de la aplicación Elysia
const app = new Elysia();

// Endpoint para registrar un nuevo usuario
app.post('/api/registrar', async (req) => {
    const { nombre, correo, clave, descripcion } = req.body;
    try {
        // Creación de un nuevo usuario en la base de datos
        const user = await prisma.usuario.create({
            data: { nombre, direccion_correo: correo, clave, descripcion },
        });
        return { estado: 200, mensaje: 'Se realizo la peticion correctamente', user };
    } catch (error) {
        // Manejo de errores
        return { estado: 400, mensaje: 'Ha existido un error al realizar la peticion', error: error.message };
    }
});

// Endpoint para bloquear a un usuario
app.post('/api/bloquear', async (req) => {
    const { correo, clave, correo_bloquear } = req.body;
    try {
        // Búsqueda del usuario que quiere bloquear a otro
        const user = await prisma.usuario.findUnique({
            where: { direccion_correo: correo },
        });

        if (user && user.clave === clave) {
            // Si las credenciales son correctas, se bloquea la dirección especificada
            const bloqueado = await prisma.direcciones_bloqueadas.create({
                data: {
                    usuario_id: user.id,
                    direccion_bloqueada: correo_bloquear,
                },
            });
            return { estado: 200, mensaje: 'Usuario bloqueado correctamente' };
        } else {
            // Si las credenciales son incorrectas
            return { estado: 400, mensaje: 'Credenciales incorrectas' };
        }
    } catch (error) {
        // Manejo de errores
        return { estado: 400, mensaje: 'Ha existido un error al realizar la peticion', error: error.message };
    }
});

// Endpoint para logearse
app.post('/api/login', async (req) => {
    const { correo, clave } = req.body;

    if (!correo || !clave) {
        // Verificación de que los parámetros necesarios estén presentes
        return res.status(400).json({ estado: 400, mensaje: 'Faltan parámetros en la solicitud.' });
    }
    try {
        // Búsqueda del usuario por su correo electrónico
        const user = await prisma.usuario.findUnique({
            where: { direccion_correo: correo },
        });

        if (!user) {
            // Si el usuario no es encontrado
            return res.status(404).json({ estado: 404, mensaje: 'Usuario no encontrado.' });
        }

        if (user.clave !== clave) {
            // Si la contraseña es incorrecta
            return res.status(401).json({ estado: 401, mensaje: 'Contraseña incorrecta.' });
        }
        return { estado: 200, mensaje: 'Inicio de sesión exitoso.', userId: user.nombre };
    } catch (error) {
        // Manejo de errores
        return res.status(500).json({ estado: 500, mensaje: 'Ha existido un error al realizar la petición', error: error.message });
    }
});

// Endpoint para enviar correos
app.post('/api/correos', async (req) => {
    const { remitente, destinatario, asunto, cuerpo } = req.body;

    if (!remitente || !destinatario || !asunto || !cuerpo) {
        // Verificación de que los parámetros necesarios estén presentes
        return { estado: 400, mensaje: 'Faltan parámetros en la solicitud.' };
    }

    try {
        // Búsqueda del remitente y destinatario en la base de datos
        const user = await prisma.usuario.findUnique({
            where: { direccion_correo: remitente },
        });
        const user2 = await prisma.usuario.findUnique({
            where: { direccion_correo: destinatario },
        });
        // Creación del correo en la base de datos
        const correo = await prisma.correo.create({
            data: {
                remitente_id: user.id,
                destinatario_id: user2.id,
                asunto,
                cuerpo,
            },
        });
        return { estado: 200, mensaje: 'Correo enviado exitosamente.' };
    } catch (error) {
        // Manejo de errores
        return { estado: 400, mensaje: 'Ha existido un error al enviar el correo', error: error.message };
    }
});

// Endpoint para obtener información de un usuario
app.get('/api/informacion/:correo', async (req) => {
    const { correo } = req.params;
    try {
        // Búsqueda del usuario por su correo electrónico
        const user = await prisma.usuario.findUnique({
            where: { direccion_correo: correo },
        });

        if (user) {
            // Si el usuario es encontrado, se devuelven sus datos
            const { nombre, direccion_correo, descripcion } = user;
            return { estado: 200, nombre, correo: direccion_correo, descripcion };
        } else {
            // Si el usuario no es encontrado
            return { estado: 400, mensaje: 'Usuario no encontrado' };
        }
    } catch (error) {
        // Manejo de errores
        return { estado: 400, mensaje: 'Ha existido un error al realizar la peticion', error: error.message };
    }
});

// Endpoint para obtener las direcciones de correo favoritas de un usuario
app.get('/api/correos/favoritos/:correo', async (req) => {
    const { correo } = req.params;

    try {
        // Búsqueda del usuario por su correo electrónico
        const user = await prisma.usuario.findUnique({
            where: { direccion_correo: correo },
        });

        if (!user) {
            // Si el usuario no es encontrado
            return { estado: 400, mensaje: 'Usuario no encontrado.' };
        }
        // Búsqueda de las direcciones favoritas del usuario
        const direccionesFav = await prisma.direcciones_favoritas.findMany({
            where: { usuario_id: user.id },
            select: { direccion_favorita: true },
        });

        return direccionesFav.map(df => df.direccion_favorita);
    } catch (error) {
        // Manejo de errores
        return { estado: 400, mensaje: 'Ha existido un error al obtener los correos favoritos', error: error.message };
    }
});

// Endpoint para marcar un correo como favorito
app.post('/api/marcarcorreo', async (req) => {
    const { correo, clave, correo_favorito } = req.body;
    try {
        // Búsqueda del usuario por su correo electrónico
        const user = await prisma.usuario.findUnique({
            where: { direccion_correo: correo },
        });

        if (user && user.clave === clave) {
            // Si las credenciales son correctas, se marca la dirección como favorita
            const favorito = await prisma.direcciones_favoritas.create({
                data: {
                    usuario_id: user.id,
                    direccion_favorita: correo_favorito,
                },
            });
            return { estado: 200, mensaje: 'Correo marcado como favorito correctamente' };
        } else {
            // Si las credenciales son incorrectas
            return { estado: 400, mensaje: 'Credenciales incorrectas' };
        }
    } catch (error) {
        // Manejo de errores
        return { estado: 400, mensaje: 'Ha existido un error al realizar la peticion', error: error.message };
    }
});

// Endpoint para desmarcar un correo como favorito
app.delete('/api/desmarcarcorreo', async (req) => {
    const { correo, clave, correo_favorito } = req.body;
    try {
        // Búsqueda del usuario por su correo electrónico
        const user = await prisma.usuario.findUnique({
            where: { direccion_correo: correo },
        });

        if (user && user.clave === clave) {
            // Si las credenciales son correctas, se desmarca la dirección como favorita
            await prisma.direcciones_favoritas.deleteMany({
                where: {
                    usuario_id: user.id,
                    direccion_favorita: correo_favorito,
                },
            });
            return { estado: 200, mensaje: 'Correo desmarcado como favorito correctamente' };
        } else {
            // Si las credenciales son incorrectas
            return { estado: 400, mensaje: 'Credenciales incorrectas' };
        }
    } catch (error) {
        // Manejo de errores
        return { estado: 400, mensaje: 'Ha existido un error al realizar la peticion', error: error.message };
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
