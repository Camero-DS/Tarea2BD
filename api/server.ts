import { Elysia } from 'elysia';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = new Elysia();

app.post('/api/registrar', async (req) => {
    const { nombre, correo, clave, descripcion } = await req.json();
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
    const { correo, clave, correo_bloquear } = await req.json();
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

app.post('/api/marcarcorreo', async (req) => {
    const { correo, clave, id_correo_favorito } = await req.json();
    try {
        const user = await prisma.usuario.findUnique({
            where: { direccion_correo: correo },
        });

        if (user && user.clave === clave) {
            const favorito = await prisma.direcciones_favoritas.create({
                data: {
                    usuario_id: user.id,
                    direccion_favorita: id_correo_favorito.toString(),
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
    const { correo, clave, id_correo_favorito } = await req.json();
    try {
        const user = await prisma.usuario.findUnique({
            where: { direccion_correo: correo },
        });

        if (user && user.clave === clave) {
            await prisma.direcciones_favoritas.deleteMany({
                where: {
                    usuario_id: user.id,
                    direccion_favorita: id_correo_favorito.toString(),
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
