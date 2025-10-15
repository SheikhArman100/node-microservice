import express, { Request, Response } from 'express';
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import config from '../../config';
import { gatewayLogger } from '../middleware/logger';

const router = express.Router();

interface ServiceConfig {
  route: string;
  target: string;
}

const services: ServiceConfig[] = [
  { route: '/users', target: config.user_service_url || '' },
  { route: '/products', target: config.product_service_url || '' },
  { route: '/orders', target: config.order_service_url || '' },
];

function createTypedProxy(target: string, route: string): RequestHandler {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path: string) => {
      // Remove only the route prefix, keep everything else
      const newPath = path.replace(route, '');
      return newPath;
    },

    on: {
      proxyReq: (proxyReq, req, res) => {
        const expressReq = req as any;
        gatewayLogger.info(`Gateway Route`, {
          clientRequest: `${expressReq.method} ${expressReq.originalUrl}`,
          routedTo: target,
          serviceReceives: `${expressReq.method} ${proxyReq.path}`,
        });
      },
      error: (err, req, res) => {
        const expressReq = req as any;
        gatewayLogger.error(`Proxy Error`, {
          url: expressReq.originalUrl,
          error: err.message,
          target,
        });
        
        
      },
    },
  });
}

services.forEach(({ route, target }) => {
  router.use(route, createTypedProxy(target, route));
});

export const ApplicationRouters = router;