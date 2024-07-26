import Router from '@koa/router';
import userRoutes from './routes/user.routes';
import courseRoutes from './routes/course.routes';
import purchaseRoutes from './routes/purchase.routes';
import enrollmentRoutes from './routes/enrollment.routes';

const router = new Router();

router.use('/users', userRoutes.routes(), userRoutes.allowedMethods());
router.use('/courses', courseRoutes.routes(), courseRoutes.allowedMethods());
router.use('/purchases', purchaseRoutes.routes(), purchaseRoutes.allowedMethods());
router.use('/enrollments', enrollmentRoutes.routes(), enrollmentRoutes.allowedMethods());

export default router;