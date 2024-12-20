import express from 'express';
import { auth } from '../middleware/auth.js';
import { 
  getOrders, 
  getOrder, 
  s_createOrder, 
  generateOrderInvoice 
} from '../controllers/orders.js';

const router = express.Router();

router.use(auth);

router.get('/', getOrders);
router.get('/:orderId', getOrder);
router.post('/', s_createOrder);
router.get('/:orderId/invoice', generateOrderInvoice);

export default router;