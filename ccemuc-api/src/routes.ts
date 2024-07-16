import Router from '@koa/router';
import userRoutes from './routes/user.routes';
import courseRoutes from './routes/course.routes';

const router = new Router();

router.use('/users', userRoutes.routes(), userRoutes.allowedMethods());
router.use('/courses', courseRoutes.routes(), courseRoutes.allowedMethods());

export default router;