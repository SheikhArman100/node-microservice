import logger, { eventLogger } from '../../logger/logger';
import rabbitMQ from './rabbitmq';

export interface ProductEventData {
  id: string;
  name: string;
  imagelink?: string;
  stock: number;
  category: string;
  createdBy: string;
  updatedBy: string;
}

export const publishProductEvent = async (
  eventType: 'product.created' | 'product.updated' | 'product.deleted' | 'inventory.changed',
  productData: ProductEventData
) => {
  try {
    const channel = await rabbitMQ.connect();

    const message = {
      event: eventType,
      product: productData,
      timestamp: new Date().toISOString(),
    };

    // Publish to product-events exchange
    channel.publish('product-events', eventType, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    eventLogger.info(`Published ${eventType} event for product ${productData.id}`);
  } catch (error) {
    eventLogger.error('Failed to publish product event', { error, eventType, productId: productData.id });
    throw error;
  }
};
