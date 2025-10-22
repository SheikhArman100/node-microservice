import rabbitMQ from './rabbitmq';

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

    // Bind queues to exchanges with routing keys

    // User events queue bindings
    await channel.bindQueue('user-events-queue', 'user-events', 'user.created');
    await channel.bindQueue('user-events-queue', 'user-events', 'user.updated');
    await channel.bindQueue('user-events-queue', 'user-events', 'user.deleted');

    // Product events queue bindings
    await channel.bindQueue('product-events-queue', 'product-events', 'product.created');
    await channel.bindQueue('product-events-queue', 'product-events', 'product.updated');
    await channel.bindQueue('product-events-queue', 'product-events', 'product.deleted');
    await channel.bindQueue('product-events-queue', 'product-events', 'inventory.changed');

    // Order events queue bindings
    await channel.bindQueue('order-events-queue', 'order-events', 'order.created');
    await channel.bindQueue('order-events-queue', 'order-events', 'order.status.changed');
    await channel.bindQueue('order-events-queue', 'order-events', 'payment.processed');

    console.log('✅ RabbitMQ queues, exchanges, and bindings setup completed successfully');
  } catch (error) {
    console.error('❌ Failed to setup RabbitMQ infrastructure:', error);
    throw error;
  }
};

export default setupQueues;
