
import { prisma } from '../../client';
import rabbitMQ from './rabbitmq';
import logger, { eventLogger, dlqLogger } from '../../logger/logger';
import { handleMessageRetry } from './retryUtils';

export const startEventConsumer = async () => {
  try {
    const channel = await rabbitMQ.connect();

    logger.info('✅ Event consumer started, listening to order-events-queue');

    // Consume messages from the queue
    channel.consume('order-events-queue', async (msg: any) => {
      if (msg) {
        try {
          const message = JSON.parse(msg.content.toString());

          // Handle user events
          if (message.user) {
            eventLogger.info('👤 Received user event:', message);
            const { event, user } = message;

            if (event === 'user.created' || event === 'user.updated') {
              // Upsert user data into cache
              await prisma.user.upsert({
                where: { id: user.id.toString() },
                create: {
                  id: user.id.toString(),
                  name: user.name,
                  email: user.email,
                  role: user.role,
                },
                update: {
                  name: user.name,
                  email: user.email,
                  role: user.role,
                }
              });

              eventLogger.info(`✅ Cached user ${user.id} (${event})`);
            } else if (event === 'user.deleted') {
              // Remove user from cache
              await prisma.user.delete({ where: { id: user.id.toString() } });
              eventLogger.info(`🗑️ Removed user ${user.id} from cache`);
            }
          }

          // Handle product events
          else if (message.product) {
            eventLogger.info('📦 Received product event:', message);
            const { event, product } = message;

            if (event === 'product.created' || event === 'product.updated') {
              // Upsert product data into cache
              try {
                await prisma.product.upsert({
                  where: { id: product.id },
                  create: {
                    id: product.id,
                    name: product.name,
                    imagelink: product.imagelink,
                    stock: product.stock,
                    category: product.category,
                    createdBy: product.createdBy,
                    updatedBy: product.updatedBy,
                  },
                  update: {
                    name: product.name,
                    imagelink: product.imagelink,
                    stock: product.stock,
                    category: product.category,
                    updatedBy: product.updatedBy,
                  }
                });

                eventLogger.info(`✅ Cached product ${product.id} (${event})`);
              } catch (dbError) {
                eventLogger.error(`❌ Failed to upsert product ${product.id}:`, dbError);
                throw dbError; // Re-throw to trigger nack
              }
            } else if (event === 'product.deleted') {
              // Remove product from cache
              try {
                await prisma.product.delete({ where: { id: product.id } });
                eventLogger.info(`🗑️ Removed product ${product.id} from cache`);
              } catch (dbError) {
                eventLogger.error(`❌ Failed to delete product ${product.id}:`, dbError);
                throw dbError; // Re-throw to trigger nack
              }
            } else if (event === 'inventory.changed') {
              // Update only stock
              try {
                await prisma.product.update({
                  where: { id: product.id },
                  data: { stock: product.stock, updatedBy: product.updatedBy }
                });
                eventLogger.info(`📊 Updated stock for product ${product.id}`);
              } catch (dbError) {
                eventLogger.error(`❌ Failed to update stock for product ${product.id}:`, dbError);
                throw dbError; // Re-throw to trigger nack
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
