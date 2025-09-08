import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  rabbitmq_url: process.env.RABBITMQ_URL,
  mongodb_uri: process.env.MONGODB_URI,
  product_service_grpc: process.env.PRODUCT_SERVICE_GRPC,
  user_service_grpc: process.env.USER_SERVICE_GRPC,
  order_service_grpc: process.env.ORDER_SERVICE_GRPC,
  gateway_secret:process.env.GATEWAY_SECRET,
  softograph_email: process.env.SOFTOGRAPH_EMAIL,
  softograph_pass: process.env.SOFTOGRAPH_PASS,
};
