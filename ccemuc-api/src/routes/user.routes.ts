import Router from '@koa/router';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { deleteAuthMiddleware } from '../middleware/delete.auth.middleware';

const router = new Router();
const userController = new UserController();

router.post('/', authMiddleware, userController.create);
router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.get('/rut/:rut', userController.getByRut);
router.put('/:id', userController.update);
router.delete('/:id', deleteAuthMiddleware, userController.delete);

export default router;