import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV,
  port: process.env.GATEWAY_PORT,
  user_service_url: process.env.USER_SERVICE_URL,
  product_service_url: process.env.PRODUCT_SERVICE_URL,
  order_service_url: process.env.ORDER_SERVICE_URL,
  client_url: process.env.CLIENT_URL,
  
  softograph_email: process.env.SOFTOGRAPH_EMAIL,
  softograph_pass: process.env.SOFTOGRAPH_PASS,
  
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET,
    gateway_secret: process.env.GATEWAY_SECRET,
  },
};
