import logger from '../logger';
import rabbitMQ from './rabbitmq';


export interface UserEventData {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  isVerified: boolean;
  // Add other fields as needed
}

export const publishUserEvent = async (eventType: 'user.created' | 'user.updated' | 'user.deleted', userData: UserEventData) => {
  try {
    const channel = await rabbitMQ.connect();

    const message = {
      event: eventType,
      user: userData,
      timestamp: new Date().toISOString(),
    };

    // Publish to user-events exchange
    channel.publish('user-events', eventType, Buffer.from(JSON.stringify(message)), {
      persistent: true, 
    });

    logger.info(`Published ${eventType} event for user ${userData.id}`);
  } catch (error) {
    logger.error('Failed to publish user event', { error, eventType, userId: userData.id });
    throw error;
  }
};
