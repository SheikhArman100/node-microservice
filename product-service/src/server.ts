import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config';
import logger from './app/middleware/logger';

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.mongodb_uri as string);
    console.log(`Product service is connected with mongoDB`);

    server = app.listen(config.port, () => {
      console.log(`Product service listening on port ${config.port}`);
    });
  } catch (error) {
    console.log(`Failed to connect database, ${error}`);
    logger.error(`Failed to connect database, ${error}`)
  }

  process.on('unhandledRejection', error => {
    if (server) {
      server.close(() => {
        console.log(error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

main();
