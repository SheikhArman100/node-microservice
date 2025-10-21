import { Server } from 'http';

import app from './app';
import { prisma } from './client';
import config from './config/index';
import logger from './shared/logger';
import rabbitMQ from './shared/rabbitmq';

let server: Server;

/**
 * connect MySQL with Prisma and API
 */
async function main() {
  try {
    // Connect to MySQL using Prisma
    await prisma.$connect();
    logger.info('User server is connected with mysql successfully!!');

    // Connect to RabbitMQ
    await rabbitMQ.connect();
    logger.info('User server is connected with RabbitMQ successfully!!');

    server = app.listen(config.port, () => {
      logger.info(`User Server started successfully on port ${config.port}`);
    });
  } catch (error) {
    logger.info('Failed to connect database or RabbitMQ', { error });
    throw error;
  }

  process.on('unhandledRejection', async error => {
    logger.info('Unhandled Rejection', { error });
    await rabbitMQ.close();
    if (server) {
      server.close(() => {
        logger.info('Server closed due to unhandled rejection', { error });
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received');
    await rabbitMQ.close();
    if (server) {
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    }
  });
}

const start = async (): Promise<void> => {
  try {
    await main();
  } catch (err) {
    logger.info('Failed to start application', { error: err });
    process.exit(1);
  }
};

start();
