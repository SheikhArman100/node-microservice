import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { OrderController } from './order.controller';
import { OrderValidation } from './order.validation';
import authorize from '../../middleware/authorize';

const router = express.Router();

router.post(
  '/',
  authorize('create_order'),
  validateRequest(OrderValidation.createOrderZodSchema),
  OrderController.createOrder
);

router.get(
  '/',
  authorize('read_order'),
  OrderController.getAllOrders
);

router.get(
  '/:id',
  authorize('read_order'),
  OrderController.getOrderByID
);

router.patch(
  '/:id/status',
  authorize('update_order'),
  validateRequest(OrderValidation.updateOrderStatusZodSchema),
  OrderController.updateOrderStatus
);

router.delete(
  '/:id',
  authorize('delete_order'),
  OrderController.deleteOrder
);

export const OrderRoutes = router;
