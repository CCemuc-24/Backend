import Router from '@koa/router';
import { EnrollmentController } from '../controllers/enrollment.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { deleteAuthMiddleware } from '../middleware/delete.auth.middleware';

const router = new Router();
const enrollmentController = new EnrollmentController();

router.post('/', authMiddleware, enrollmentController.create);
router.get('/', enrollmentController.getAll);
router.get('/:id', enrollmentController.getById);
router.put('/:id', enrollmentController.update);
router.delete('/:id', deleteAuthMiddleware, enrollmentController.delete);

export default router;