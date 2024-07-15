import Router from '@koa/router';
import userRoutes from './routes/user.routes';

const router = new Router();

router.use('/users', userRoutes.routes(), userRoutes.allowedMethods());

export default router;