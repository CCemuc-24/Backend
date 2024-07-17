import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { sequelize } from './models';
import router from './routes';

const app = new Koa();

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    // await sequelize.sync(); // En producción, es mejor usar migraciones
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

start();