import { Server } from 'http';
import app from './app';
import config from './config';
import { appLogger } from './app/middleware/logger';

let server: Server;

async function main() {
  try {
    server = app.listen(config.port, () => {
      console.log(`Api Gateway listening on port ${config.port}`)
      appLogger.info(`Api Gateway listening on port ${config.port}`);
    });
  } catch (error) {
    appLogger.error(`Failed to start server`, { error: error instanceof Error ? error.message : String(error) });
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
