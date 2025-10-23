import { prisma } from '../../client';
import rabbitMQ from './rabbitmq';
import logger, { eventLogger } from '../../logger/logger';

export const startProductEventConsumer = async () => {
  try {
    const channel = await rabbitMQ.connect();

    logger.info('✅ Product event consumer started, listening to order-events-queue');

    // Consume messages from the queue
    channel.consume('order-events-queue', async (msg: any) => {
      if (msg) {
        try {
          const message = JSON.parse(msg.content.toString());

          // Only process product events
          if (message.product) {
            eventLogger.info('📦 Received product event:', message);

            const { event, product } = message;

            if (event === 'product.created' || event === 'product.updated') {
              // Upsert product data into cache
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
            } else if (event === 'product.deleted') {
              // Remove product from cache
              await prisma.product.delete({ where: { id: product.id } });
              eventLogger.info(`🗑️ Removed product ${product.id} from cache`);
            } else if (event === 'inventory.changed') {
              // Update only stock
              await prisma.product.update({
                where: { id: product.id },
                data: { stock: product.stock, updatedBy: product.updatedBy }
              });
              eventLogger.info(`📊 Updated stock for product ${product.id}`);
            }
          }

          // Acknowledge the message (even if it's not a product event)
          channel.ack(msg);
        } catch (error) {
          logger.error('❌ Error processing product event:', error);
          // Reject the message and requeue
          channel.nack(msg, false, true);
        }
      }
    });

  } catch (error) {
    logger.error('❌ Failed to start product event consumer:', error);
    throw error;
  }
};
