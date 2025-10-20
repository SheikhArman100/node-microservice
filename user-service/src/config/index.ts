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
validateEnvVar('ADMIN_CLIENT_URL', process.env.ADMIN_CLIENT_URL);
validateEnvVar('BCRYPT_SALT_ROUNDS', process.env.BCRYPT_SALT_ROUNDS);
validateEnvVar('RABBITMQ_URL', process.env.RABBITMQ_URL);
validateEnvVar('MYSQL_URI', process.env.MYSQL_URI);
validateEnvVar('JWT_ACCESS_SECRET', process.env.JWT_ACCESS_SECRET);
validateEnvVar('JWT_ACCESS_EXPIRES_IN', process.env.JWT_ACCESS_EXPIRES_IN);
validateEnvVar('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET);
validateEnvVar('JWT_REFRESH_EXPIRES_IN', process.env.JWT_REFRESH_EXPIRES_IN);
validateEnvVar('JWT_FORGET_PASSWORD_SECRET', process.env.JWT_FORGET_PASSWORD_SECRET);
validateEnvVar('JWT_FORGET_PASSWORD_EXPIRES_IN', process.env.JWT_FORGET_PASSWORD_EXPIRES_IN);
validateEnvVar('JWT_EMAIL_VERIFY_SECRET', process.env.JWT_EMAIL_VERIFY_SECRET);
validateEnvVar('JWT_EMAIL_VERIFY_EXPIRES_IN', process.env.JWT_EMAIL_VERIFY_EXPIRES_IN);
validateEnvVar('SOFTOGRAPH_EMAIL', process.env.SOFTOGRAPH_EMAIL);
validateEnvVar('SOFTOGRAPH_PASS', process.env.SOFTOGRAPH_PASS);

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  admin_client_url:process.env.ADMIN_CLIENT_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  rabbitmq_url: process.env.RABBITMQ_URL,
  mysql_uri: process.env.MYSQL_URI,
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
    forget_password_secret: process.env.JWT_FORGET_PASSWORD_SECRET,
    forget_password_expires_in: process.env.JWT_FORGET_PASSWORD_EXPIRES_IN,
    email_verify_secret: process.env.JWT_EMAIL_VERIFY_SECRET,
    email_verify_expires_in: process.env.JWT_EMAIL_VERIFY_EXPIRES_IN,
  },
  softograph_email: process.env.SOFTOGRAPH_EMAIL,
  softograph_pass: process.env.SOFTOGRAPH_PASS,
};
