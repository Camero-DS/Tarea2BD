import { Elysia } from 'elysia';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = new Elysia();


app.post('/api/registrar', async (req) => {
    const { nombre, direccion_correo, clave, descripcion } = req.body;
    try {
        const user = await prisma.usuario.create({
            data: { nombre, direccion_correo, clave, descripcion },
        });
        return { estado: 200, mensaje: 'Se realizo la peticion correctamente', user };
    } catch (error) {
        return { estado: 400, mensaje: 'Ha existido un error al realizar la peticion', error: error.message };
    }
});





app.post('/api/login', async (req) => {
    const { correo, clave } = await req.json();
    const user = await prisma.usuario.findUnique({
        where: { direccion_correo: correo },
    });
    if (user && user.clave === clave) {
        return { status: 'success' };
    }
    return { status: 'error', message: 'Invalid credentials' };
});

app.post('/api/correos', async (req) => {
    const { remitente, destinatario, asunto, cuerpo } = await req.json();
    const correo = await prisma.correo.create({
        data: {
            remitente_id: remitente,
            destinatario_id: destinatario,
            asunto,
            cuerpo,
        },
    });
    return correo;
});

app.get('/api/informacion/:correo', async (req) => {
    const { correo } = req.params;
    const user = await prisma.usuario.findUnique({
        where: { direccion_correo: correo },
    });
    if (user) {
        return user;
    }
    return { status: 'error', message: 'User not found' };
});

app.get('/api/correos/favoritos/:correo', async (req) => {
    const { correo } = req.params;
    const user = await prisma.usuario.findUnique({
        where: { direccion_correo: correo },
        include: {
            direccionesFavoritas: true,
        },
    });
    if (user) {
        return user.direccionesFavoritas;
    }
    return { status: 'error', message: 'User not found' };
});

app.post('/api/correos/marcarcorreo', async (req) => {
    const { correo, direccion_favorita } = await req.json();
    const user = await prisma.usuario.findUnique({
        where: { direccion_correo: correo },
    });
    if (user) {
        const favorita = await prisma.direccion_favoritas.create({
            data: {
                usuario_id: user.id,
                direccion_favorita,
            },
        });
        return favorita;
    }
    return { status: 'error', message: 'User not found' };
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
