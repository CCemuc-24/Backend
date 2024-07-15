import Koa from 'koa';
import Router from '@koa/router';
import { sequelize } from './models';

const app = new Koa();
const router = new Router();

router.get('/', (ctx) => {
  ctx.body = 'Hola Mundo con Koa, TypeScript y Sequelize!';
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    await sequelize.sync(); // Esto sincroniza los modelos con la base de datos
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();