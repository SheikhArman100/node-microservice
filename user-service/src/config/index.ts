import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  rabbitmq_url: process.env.RABBITMQ_URL,
  mysql_uri: process.env.MYSQL_URI,
  user_service_grpc: process.env.USER_SERVICE_GRPC,
  product_service_grpc: process.env.PRODUCT_SERVICE_GRPC,
  order_service_grpc: process.env.ORDER_SERVICE_GRPC,
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
    forget_password_secret: process.env.JWT_FORGET_PASSWORD_SECRET,
    forget_password_expires_in: process.env.JWT_FORGET_PASSWORD_EXPIRES_IN,
    email_verify_secret: process.env.JWT_EMAIL_VERIFY_SECRET,
    email_verify_expires_in: process.env.JWT_EMAIL_VERIFY_EXPIRES_IN,
    gateway_secret: process.env.GATEWAY_SECRET,
  },
  softograph_email: process.env.SOFTOGRAPH_EMAIL,
  softograph_pass: process.env.SOFTOGRAPH_PASS,
};
