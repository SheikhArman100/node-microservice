import { User } from '../../app/modules/user/user.model';
import rabbitMQ from './rabbitmq';
import logger, { eventLogger, dlqLogger } from '../../logger/logger';
import { handleMessageRetry } from './retryUtils';

export const startEventConsumer = async () => {
  try {
    const channel = await rabbitMQ.connect();

    logger.info('✅ Event consumer started, listening to product-events-queue');

    // Consume messages from the queue
    channel.consume('product-events-queue', async (msg: any) => {
      if (msg) {
        try {
          const message = JSON.parse(msg.content.toString());

          // Handle user events (for user caching in product service)
          if (message.user) {
            eventLogger.info('👤 Received user event:', message);
            const { event, user } = message;

            if (event === 'user.created' || event === 'user.updated') {
              // Upsert user data into cache
              await User.findOneAndUpdate(
                { _id: user.id },
                {
                  _id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  lastUpdated: new Date(),
                },
                { upsert: true, new: true }
              );

              eventLogger.info(`✅ Cached user ${user.id} (${event})`);
            } else if (event === 'user.deleted') {
              // Remove user from cache
              await User.findByIdAndDelete(user.id);
              eventLogger.info(`🗑️ Removed user ${user.id} from cache`);
            }
          }

          // Acknowledge the message
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
