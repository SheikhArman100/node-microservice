import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config';
import logger from './app/middleware/logger';
import rabbitMQ from './shared/rabbitmq';

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.mongodb_uri as string);
    console.log(`Product service is connected with mongoDB`);

    // Connect to RabbitMQ
    await rabbitMQ.connect();
    console.log(`Product service is connected with RabbitMQ`);

    server = app.listen(config.port, () => {
      console.log(`Product service listening on port ${config.port}`);
    });
  } catch (error) {
    console.log(`Failed to connect database or RabbitMQ, ${error}`);
    logger.error(`Failed to connect database or RabbitMQ, ${error}`)
  }

  process.on('unhandledRejection', async error => {
    console.log('Unhandled Rejection', error);
    await rabbitMQ.close();
    if (server) {
      server.close(() => {
        console.log(error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received');
    await rabbitMQ.close();
    if (server) {
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    }
  });
}

main();
