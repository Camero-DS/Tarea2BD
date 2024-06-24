import { Elysia } from 'elysia';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = new Elysia();

app.post('/api/registrar', async (req) => {
    const { nombre, correo, clave, descripcion } = req.body;
    try {
        const user = await prisma.usuario.create({
            data: { nombre, direccion_correo: correo, clave, descripcion },
        });
        return { estado: 200, mensaje: 'Se realizo la peticion correctamente', user };
    } catch (error) {
        return { estado: 400, mensaje: 'Ha existido un error al realizar la peticion', error: error.message };
    }
});

app.post('/api/bloquear', async (req) => {
    const { correo, clave, correo_bloquear } = req.body;
    try {
        const user = await prisma.usuario.findUnique({
            where: { direccion_correo: correo },
        });

        if (user && user.clave === clave) {
            const bloqueado = await prisma.direcciones_bloqueadas.create({
                data: {
                    usuario_id: user.id,
                    direccion_bloqueada: correo_bloquear,
                },
            });
            return { estado: 200, mensaje: 'Usuario bloqueado correctamente' };
        } else {
            return { estado: 400, mensaje: 'Credenciales incorrectas' };
        }
    } catch (error) {
        return { estado: 400, mensaje: 'Ha existido un error al realizar la peticion', error: error.message };
    }
});

//Api para logearse

app.post('/api/login', async (req) => {
    const { correo, clave } = req.body;

    if (!correo || !clave) {
        return res.status(400).json({ estado: 400, mensaje: 'Faltan parámetros en la solicitud.' });
    }
    try {
        const user = await prisma.usuario.findUnique({
            where: { direccion_correo: correo },
        });

        if (!user) {
            return res.status(404).json({ estado: 404, mensaje: 'Usuario no encontrado.' });
        }

        if (user.clave !== clave) {
            return res.status(401).json({ estado: 401, mensaje: 'Contraseña incorrecta.' });
        }
        return { estado: 200, mensaje: 'Inicio de sesión exitoso.', userId: user.nombre };
    } catch (error) {
        return res.status(500).json({ estado: 500, mensaje: 'Ha existido un error al realizar la petición', error: error.message });
    }
});



//Api para enviar correos
app.post('/api/correos', async (req) => {
    const { remitente, destinatario, asunto, cuerpo } = req.body;

    if (!remitente || !destinatario || !asunto || !cuerpo) {
        return { estado: 400, mensaje: 'Faltan parámetros en la solicitud.' };
    }

    try {
        const user = await prisma.usuario.findUnique({
            where: { direccion_correo: remitente },
        });
        const user2 = await prisma.usuario.findUnique({
            where: { direccion_correo: destinatario },
        });
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
        return { estado: 400, mensaje: 'Ha existido un error al enviar el correo', error: error.message };
    }
});


app.get('/api/informacion/:correo', async (req) => {
    const { correo } = req.params;
    try {
        const user = await prisma.usuario.findUnique({
            where: { direccion_correo: correo },
        });

        if (user) {
            const { nombre, direccion_correo, descripcion } = user;
            return { estado: 200, nombre, correo: direccion_correo, descripcion };
        } else {
            return { estado: 400, mensaje: 'Usuario no encontrado' };
        }
    } catch (error) {
        return { estado: 400, mensaje: 'Ha existido un error al realizar la peticion', error: error.message };
    }
});

app.get('/api/correos/favoritos/:correo', async (req) => {
    const { correo } = req.params;

    try {
        const user = await prisma.usuario.findUnique({
            where: { direccion_correo: correo },
        });

        if (!user) {
            return { estado: 400, mensaje: 'Usuario no encontrado.' };
        }

        const direccionesFav = await prisma.direcciones_favoritas.findMany({
            where: { usuario_id: user.id },
            select: { direccion_favorita: true },
        });

        return direccionesFav.map(df => df.direccion_favorita);
    } catch (error) {
        return { estado: 400, mensaje: 'Ha existido un error al obtener los correos favoritos', error: error.message };
    }
});





app.post('/api/marcarcorreo', async (req) => {
    const { correo, clave, correo_favorito } = req.body;
    try {
        const user = await prisma.usuario.findUnique({
            where: { direccion_correo: correo },
        });

        if (user && user.clave === clave) {
            const favorito = await prisma.direcciones_favoritas.create({
                data: {
                    usuario_id: user.id,
                    direccion_favorita: correo_favorito,
                },
            });
            return { estado: 200, mensaje: 'Correo marcado como favorito correctamente' };
        } else {
            return { estado: 400, mensaje: 'Credenciales incorrectas' };
        }
    } catch (error) {
        return { estado: 400, mensaje: 'Ha existido un error al realizar la peticion', error: error.message };
    }
});

app.delete('/api/desmarcarcorreo', async (req) => {
    const { correo, clave, correo_favorito } = req.body;
    try {
        const user = await prisma.usuario.findUnique({
            where: { direccion_correo: correo },
        });

        if (user && user.clave === clave) {
            await prisma.direcciones_favoritas.deleteMany({
                where: {
                    usuario_id: user.id,
                    direccion_favorita: correo_favorito,
                },
            });
            return { estado: 200, mensaje: 'Correo desmarcado como favorito correctamente' };
        } else {
            return { estado: 400, mensaje: 'Credenciales incorrectas' };
        }
    } catch (error) {
        return { estado: 400, mensaje: 'Ha existido un error al realizar la peticion', error: error.message };
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
