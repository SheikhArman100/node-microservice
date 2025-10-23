import rabbitMQ from './rabbitmq';
import logger, { eventLogger } from '../../logger/logger';

export interface OrderEventData {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  orderItems?: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}

export const publishOrderEvent = async (
  eventType: 'order.created' | 'order.updated' | 'order.cancelled' | 'payment.processed',
  orderData: OrderEventData
) => {
  try {
    const channel = await rabbitMQ.connect();

    const message = {
      event: eventType,
      order: orderData,
      timestamp: new Date().toISOString(),
    };

    // Publish to order-events exchange
    channel.publish('order-events', eventType, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    eventLogger.info(`Published ${eventType} event for order ${orderData.id}`);
  } catch (error) {
    eventLogger.error('Failed to publish order event', { error, eventType, orderId: orderData.id });
    throw error;
  }
};
