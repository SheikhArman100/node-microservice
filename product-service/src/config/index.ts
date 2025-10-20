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
validateEnvVar('RABBITMQ_URL', process.env.RABBITMQ_URL);
validateEnvVar('MONGODB_URI', process.env.MONGODB_URI);
validateEnvVar('SOFTOGRAPH_EMAIL', process.env.SOFTOGRAPH_EMAIL);
validateEnvVar('SOFTOGRAPH_PASS', process.env.SOFTOGRAPH_PASS);

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  rabbitmq_url: process.env.RABBITMQ_URL,
  mongodb_uri: process.env.MONGODB_URI,
  softograph_email: process.env.SOFTOGRAPH_EMAIL,
  softograph_pass: process.env.SOFTOGRAPH_PASS,
};
