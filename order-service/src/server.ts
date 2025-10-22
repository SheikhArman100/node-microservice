import { Server } from 'http';

import app from './app';
import { prisma } from './client';
import config from './config/index';
import logger from './logger/logger';
import rabbitMQ from './shared/rabbitmq/rabbitmq';
import setupQueues from './shared/rabbitmq/queueSetup';
import { startUserEventConsumer } from './shared/rabbitmq/userEventConsumer';

let server: Server;

/**
 * connect MySQL with Prisma and API
 */
async function main() {
  try {
    // Connect to MySQL using Prisma
    await prisma.$connect();
    console.log('Connected to MySQL database');
    logger.info('Order service is connected with postgres successfully');

    // Connect to RabbitMQ
    await rabbitMQ.connect();
    console.log('Connected to RabbitMQ');
    logger.info('Order service is connected with RabbitMQ successfully');

    // Setup RabbitMQ queues, exchanges, and bindings
    await setupQueues();

    // Start user event consumer
    await startUserEventConsumer();

    server = app.listen(config.port, () => {
      console.log(`Order service server started successfully on port ${config.port}`);
      logger.info(`Order service server started successfully on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to connect database or RabbitMQ', { error });
    logger.info('Failed to connect database or RabbitMQ', { error });
    throw error;
  }

  process.on('unhandledRejection', async error => {
    console.error('Unhandled Rejection', { error });
    logger.info('Unhandled Rejection', { error });
    await rabbitMQ.close();
    if (server) {
      server.close(() => {
        console.log('Server closed due to unhandled rejection', { error });
        logger.info('Server closed due to unhandled rejection', { error });
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received');
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
    console.error('Failed to start application', { error: err });
    logger.info('Failed to start application', { error: err });
    process.exit(1);
  }
};

start();
