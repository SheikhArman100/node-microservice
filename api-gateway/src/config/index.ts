import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

// Validation function to check required environment variables
const validateEnvVar = (key: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
};

// Validate all required environment variables
validateEnvVar('NODE_ENV', process.env.NODE_ENV);
validateEnvVar('GATEWAY_PORT', process.env.GATEWAY_PORT);
validateEnvVar('USER_SERVICE_URL', process.env.USER_SERVICE_URL);
validateEnvVar('PRODUCT_SERVICE_URL', process.env.PRODUCT_SERVICE_URL);
validateEnvVar('ORDER_SERVICE_URL', process.env.ORDER_SERVICE_URL);
validateEnvVar('CLIENT_URL', process.env.CLIENT_URL);
validateEnvVar('JWT_ACCESS_SECRET', process.env.JWT_ACCESS_SECRET);

export default {
  env: process.env.NODE_ENV,
  port: process.env.GATEWAY_PORT,
  user_service_url: process.env.USER_SERVICE_URL,
  product_service_url: process.env.PRODUCT_SERVICE_URL ,
  order_service_url: process.env.ORDER_SERVICE_URL ,
  client_url: process.env.CLIENT_URL,
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET,
  },
};
