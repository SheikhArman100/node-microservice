
import { prisma } from '../../client';
import rabbitMQ from './rabbitmq';
import logger, { eventLogger } from '../../logger/logger';

export const startUserEventConsumer = async () => {
  try {
    const channel = await rabbitMQ.connect();

    // Assert queue exists (should already be created by queueSetup)
    await channel.assertQueue('user-events-queue', { durable: true });

    logger.info('✅ User event consumer started, listening to user-events-queue');

    // Consume messages from the queue
    channel.consume('user-events-queue', async (msg: any) => {
      console.log('🔍 DEBUG: Consumer received message:', !!msg);
      if (msg) {
        console.log('🔍 DEBUG: Message content:', msg.content.toString());
        try {
          const message = JSON.parse(msg.content.toString());
          console.log('🔍 DEBUG: Parsed message:', message);
          eventLogger.info('📨 Received user event:', message);

          const { event, user } = message;

          if (event === 'user.created' || event === 'user.updated') {
            console.log('🔍 DEBUG: Attempting to upsert user:', user.id);
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

            console.log('🔍 DEBUG: User upsert successful');
            eventLogger.info(`✅ Cached user ${user.id} (${event})`);
          } else if (event === 'user.deleted') {
            console.log('🔍 DEBUG: Attempting to delete user:', user.id);
            // Remove user from cache
            await prisma.user.delete({ where: { id: user.id.toString() } });
            eventLogger.info(`🗑️ Removed user ${user.id} from cache`);
          }

          console.log('🔍 DEBUG: Acknowledging message');
          // Acknowledge the message
          channel.ack(msg);
        } catch (error) {
          console.error('❌ Error processing user event:', error);
          logger.error('❌ Error processing user event:', error);
          // Reject the message and requeue
          channel.nack(msg, false, true);
        }
      } else {
        console.log('🔍 DEBUG: Received null/empty message');
      }
    });

  } catch (error) {
    logger.error('❌ Failed to start user event consumer:', error);
    throw error;
  }
};
