import Router from '@koa/router';
import { CourseController } from '../controllers/course.controller';

const router = new Router();
const courseController = new CourseController();

router.post('/', courseController.create);
router.get('/', courseController.getAll);
router.get('/:id', courseController.getById);
router.put('/:id', courseController.update);
router.delete('/:id', courseController.delete);

export default router;