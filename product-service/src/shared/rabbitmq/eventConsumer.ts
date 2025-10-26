import { User } from '../../app/modules/user/user.model';
import { Product } from '../../app/modules/product/product.model';
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

          // Handle order events (for stock updates in product service)
          else if (message.order) {
            eventLogger.info('📦 Received order event:', message);
            const { event, order } = message;

            if (event === 'order.created') {
              // Update product stock when order is created
              for (const item of order.orderItems) {
                try {
                  await Product.findByIdAndUpdate(
                    item.productId,
                    { $inc: { stock: -item.quantity } }
                  );
                  eventLogger.info(`📊 Reduced stock for product ${item.productId} by ${item.quantity}`);
                } catch (stockError) {
                  eventLogger.error(`❌ Failed to update stock for product ${item.productId}:`, stockError);
                  throw stockError; // This will trigger retry
                }
              }
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
