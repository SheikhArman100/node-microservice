import { Server } from 'http';
import app from './app';
import config from './config';
import logger from './app/middleware/logger';

let server: Server;

async function main() {
  try {
    server = app.listen(config.port, () => {
      console.log(`Api Gateway listening on port ${config.port}`);
    });
  } catch (error) {
    logger.error(`Failed to start server, ${error}`)
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
