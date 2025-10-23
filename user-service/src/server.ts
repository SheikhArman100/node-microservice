import { Server } from 'http';

import app from './app';
import { prisma } from './client';
import config from './config/index';
import logger from './logger/logger';
import rabbitMQ from './shared/rabbitmq/rabbitmq';
import setupQueues from './shared/rabbitmq/queueSetup';
import { startEventConsumer } from './shared/rabbitmq/eventConsumer';

let server: Server;

/**
 * connect MySQL with Prisma and API
 */
async function main() {
  try {
    // Connect to MySQL using Prisma
    await prisma.$connect();
    console.log('Connected to MySQL database');
    logger.info('User server is connected with mysql successfully!!');

    // Connect to RabbitMQ
    await rabbitMQ.connect();
    console.log('Connected to RabbitMQ');
    logger.info('User server is connected with RabbitMQ successfully!!');

    // Setup RabbitMQ queues, exchanges, and bindings
    await setupQueues();

    // Start event consumer
    await startEventConsumer();

    server = app.listen(config.port, () => {
      console.log(`User Server started successfully on port ${config.port}`);
      logger.info(`User Server started successfully on port ${config.port}`);
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
        console.log('Server closed');
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
