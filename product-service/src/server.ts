import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config';
import logger from './logger/logger';
import rabbitMQ from './shared/rabbitmq/rabbitmq';
import setupQueues from './shared/rabbitmq/queueSetup';
import { startUserEventConsumer } from './shared/rabbitmq/userEventConsumer';

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.mongodb_uri as string);
    console.log('Connected to mongoDB');
    logger.info('Product service is connected with mongoDB');

    // Connect to RabbitMQ
    await rabbitMQ.connect();
    console.log('Connected to RabbitMQ');
    logger.info('Product service is connected with RabbitMQ');

    // Setup RabbitMQ queues, exchanges, and bindings
    await setupQueues();

    // Start user event consumer
    await startUserEventConsumer();

    server = app.listen(config.port, () => {
      console.log(`Product service listening on port ${config.port}`);
      logger.info(`Product service listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to connect database or RabbitMQ', { error });
    logger.error('Failed to connect database or RabbitMQ', { error });
    throw error;
  }

  process.on('unhandledRejection', async error => {
    console.error('Unhandled Rejection', { error });
    logger.error('Unhandled Rejection', { error });
    await rabbitMQ.close();
    if (server) {
      server.close(() => {
        console.log('Server closed due to unhandled rejection', { error });
        logger.error('Server closed due to unhandled rejection', { error });
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

main();
