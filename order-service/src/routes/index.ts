import express from 'express';
import { OrderRoutes } from '../modules/order/order.route';

const router = express.Router();

interface Route {
  path: string;
  route: express.Router;
}

const moduleRoutes: Route[] = [
  {
    path: '/orders',
    route: OrderRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export const ApplicationRouters = router;
