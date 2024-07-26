import Router from '@koa/router';
import { CourseController } from '../controllers/course.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { deleteAuthMiddleware } from '../middleware/delete.auth.middleware';

const router = new Router();
const courseController = new CourseController();

router.post('/', authMiddleware, courseController.create);
router.get('/', courseController.getAll);
router.get('/:id', courseController.getById);
router.put('/:id', courseController.update);
router.delete('/:id', deleteAuthMiddleware, courseController.delete);

export default router;
