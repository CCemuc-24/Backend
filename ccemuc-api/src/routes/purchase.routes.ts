import Router from '@koa/router';
import { PurchaseController } from '../controllers/purchase.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { deleteAuthMiddleware } from '../middleware/delete.auth.middleware';

const router = new Router();
const purchaseController = new PurchaseController();

router.post('/', authMiddleware, purchaseController.create);
router.get('/', purchaseController.getAll);
router.get('/:id', purchaseController.getById);
router.put('/:id', purchaseController.update);
router.delete('/:id', deleteAuthMiddleware, purchaseController.delete);
router.post('/confirm/:id', authMiddleware, purchaseController.confirm);
router.get('/statusToken/:token', purchaseController.statusToken);

export default router;
