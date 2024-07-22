import Router from '@koa/router';
import userRoutes from './routes/user.routes';
import courseRoutes from './routes/course.routes';
import purchaseRoutes from './routes/purchase.routes';

const router = new Router();

router.use('/users', userRoutes.routes(), userRoutes.allowedMethods());
router.use('/courses', courseRoutes.routes(), courseRoutes.allowedMethods());
router.use('/purchases', purchaseRoutes.routes(), purchaseRoutes.allowedMethods());

export default router;