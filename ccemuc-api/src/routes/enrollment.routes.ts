import Router from '@koa/router';
import { EnrollmentController } from '../controllers/enrollment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = new Router();
const enrollmentController = new EnrollmentController();

router.post('/', enrollmentController.create);
router.get('/', enrollmentController.getAll);
router.get('/:id', enrollmentController.getById);
router.put('/:id', enrollmentController.update);
router.delete('/:id', authMiddleware, enrollmentController.delete);

export default router;