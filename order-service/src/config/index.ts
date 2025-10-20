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
validateEnvVar('PORT', process.env.PORT);
validateEnvVar('BCRYPT_SALT_ROUNDS', process.env.BCRYPT_SALT_ROUNDS);
validateEnvVar('RABBITMQ_URL', process.env.RABBITMQ_URL);
validateEnvVar('POSTGRESQL_URI', process.env.POSTGRESQL_URI);
validateEnvVar('ORDER_SERVICE_GRPC', process.env.ORDER_SERVICE_GRPC);
validateEnvVar('USER_SERVICE_GRPC', process.env.USER_SERVICE_GRPC);
validateEnvVar('PRODUCT_SERVICE_GRPC', process.env.PRODUCT_SERVICE_GRPC);
validateEnvVar('GATEWAY_SECRET', process.env.GATEWAY_SECRET);
validateEnvVar('SOFTOGRAPH_EMAIL', process.env.SOFTOGRAPH_EMAIL);
validateEnvVar('SOFTOGRAPH_PASS', process.env.SOFTOGRAPH_PASS);

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  rabbitmq_url: process.env.RABBITMQ_URL,
  postgresql_uri: process.env.POSTGRESQL_URI,
  order_service_grpc: process.env.ORDER_SERVICE_GRPC,
  user_service_grpc: process.env.USER_SERVICE_GRPC,
  product_service_grpc: process.env.PRODUCT_SERVICE_GRPC,
  gateway_secret:process.env.GATEWAY_SECRET,
  softograph_email: process.env.SOFTOGRAPH_EMAIL,
  softograph_pass: process.env.SOFTOGRAPH_PASS,
};
