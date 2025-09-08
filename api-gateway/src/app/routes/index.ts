import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../../config';

const router = express.Router();

// User Service Proxy
router.use(
  '/users',
  createProxyMiddleware({
    target: config.user_service_url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/users': '/api/v1/users',
    },
  }),
);

// Product Service Proxy
router.use(
  '/products',
  createProxyMiddleware({
    target: config.product_service_url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/products': '/api/v1/products',
    },
  }),
);

// Order Service Proxy
router.use(
  '/orders',
  createProxyMiddleware({
    target: config.order_service_url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/orders': '/api/v1/orders',
    },
  }),
);

export const ApplicationRouters = router;
