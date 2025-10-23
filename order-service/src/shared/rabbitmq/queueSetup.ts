import rabbitMQ from './rabbitmq';
import logger from '../../logger/logger';

export const setupQueues = async () => {
  try {
    const channel = await rabbitMQ.connect();

    // Declare exchanges
    await channel.assertExchange('user-events', 'direct', { durable: true });
    await channel.assertExchange('product-events', 'direct', { durable: true });
    await channel.assertExchange('order-events', 'direct', { durable: true });

    // Declare queues
    await channel.assertQueue('user-events-queue', { durable: true });
    await channel.assertQueue('product-events-queue', { durable: true });
    await channel.assertQueue('order-events-queue', { durable: true });


    // User events for order service
    await channel.bindQueue('order-events-queue', 'user-events', 'user.created');
    await channel.bindQueue('order-events-queue', 'user-events', 'user.updated');
    await channel.bindQueue('order-events-queue', 'user-events', 'user.deleted');

    // Product events for order service
    await channel.bindQueue('order-events-queue', 'product-events', 'product.created');
    await channel.bindQueue('order-events-queue', 'product-events', 'product.updated');
    await channel.bindQueue('order-events-queue', 'product-events', 'product.deleted');
    await channel.bindQueue('order-events-queue', 'product-events', 'inventory.changed');

    logger.info('RabbitMQ queues, exchanges, and bindings setup completed successfully');
  } catch (error) {
    logger.error('Failed to setup RabbitMQ infrastructure', { error });
    throw error;
  }
};

export default setupQueues;
