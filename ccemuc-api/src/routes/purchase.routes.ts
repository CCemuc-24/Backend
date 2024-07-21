import Router from '@koa/router';
import { PurchaseController } from '../controllers/purchase.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = new Router();
const purchaseController = new PurchaseController();

router.post('/', purchaseController.create);
router.get('/', purchaseController.getAll);
router.get('/:id', purchaseController.getById);
router.put('/:id', purchaseController.update);
router.delete('/:id', authMiddleware, purchaseController.delete);
router.post('/confirm/:id', purchaseController.confirm);

export default router;
