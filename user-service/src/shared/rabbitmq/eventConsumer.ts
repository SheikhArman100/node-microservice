import rabbitMQ from './rabbitmq';
import logger, { eventLogger, dlqLogger } from '../../logger/logger';
import { handleMessageRetry } from './retryUtils';

export const startEventConsumer = async () => {
  try {
    const channel = await rabbitMQ.connect();

    logger.info('✅ Event consumer started, listening to user-events-queue');

    // Consume messages from the queue
    channel.consume('user-events-queue', async (msg: any) => {
      if (msg) {
        try {
          const message = JSON.parse(msg.content.toString());

          // User-service is the source of user events, so it typically doesn't consume them
          // This consumer can be extended later if needed for cross-service communication

          eventLogger.info('📨 Received event (user-service):', message);

          // For now, just acknowledge all messages
          channel.ack(msg);
        } catch (error) {
          handleMessageRetry(channel, msg, error, logger, dlqLogger, 2);
        }
      }
    });

  } catch (error) {
    logger.error('❌ Failed to start event consumer:', error);
    throw error;
  }
};
