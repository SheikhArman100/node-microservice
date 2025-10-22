// src/routes/ApplicationRouters.ts
import express, { RequestHandler } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../../config';
import { gatewayLogger } from '../../logger/logger';

const router = express.Router();

interface ServiceConfig {
  route: string;
  target: string;
}

// Define all microservices with public/private prefixes
const services: ServiceConfig[] = [
  // Public routes (no auth required)
  { route: '/public/users', target: config.user_service_url || '' },
  { route: '/public/products', target: config.product_service_url || '' },
  { route: '/public/orders', target: config.order_service_url || '' },

  // Private routes (auth required)
  { route: '/private/users', target: config.user_service_url || '' },
  { route: '/private/products', target: config.product_service_url || '' },
  { route: '/private/orders', target: config.order_service_url || '' },
];

/**
 * Creates a proxy middleware for a service.
 * Automatically prepends `/api/v1` on the microservice side.
 */
function createTypedProxy(target: string, route: string): RequestHandler {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path: string) => {
      // Since Express strips the route prefix, we just prepend /api/v1
      // /auth/signin -> /api/v1/auth/signin
      const rewritten = `/api/v1${path}`;
      return rewritten;
    },
    on: {
      proxyReq: (proxyReq, req) => {
        const expressReq = req as any;
        gatewayLogger.info('Gateway Route', {
          clientRequest: `${expressReq.method} ${expressReq.originalUrl}`,
          routedTo: target,
          serviceReceives: `${expressReq.method} ${proxyReq.path}`,
        });
      },
      error: (err, req) => {
        const expressReq = req as any;
        gatewayLogger.error('Proxy Error', {
          url: expressReq.originalUrl,
          error: err.message,
          target,
        });
      },
    },
  });
}

// Register all service proxies
services.forEach(({ route, target }) => {
  router.use(route, createTypedProxy(target, route));
});

export const ApplicationRouters = router;
