import { UserCache } from '../../app/modules/user/user.model';
import rabbitMQ from './rabbitmq';

export const startUserEventConsumer = async () => {
  try {
    const channel = await rabbitMQ.connect();

    // Assert queue exists (should already be created by queueSetup)
    await channel.assertQueue('user-events-queue', { durable: true });

    console.log('✅ User event consumer started, listening to user-events-queue');

    // Consume messages from the queue
    channel.consume('user-events-queue', async (msg: any) => {
      if (msg) {
        try {
          const message = JSON.parse(msg.content.toString());
          console.log('📨 Received user event:', message);

          const { event, user } = message;

          if (event === 'user.created' || event === 'user.updated') {
            // Upsert user data into cache
            await UserCache.findOneAndUpdate(
              { _id: user.id.toString() }, // Use string ID as _id
              {
                name: user.name,
                email: user.email,
                lastUpdated: new Date(),
              },
              {
                upsert: true, // Create if doesn't exist, update if exists
                new: true,
              }
            );

            console.log(`✅ Cached user ${user.id} (${event})`);
          } else if (event === 'user.deleted') {
            // Remove user from cache
            await UserCache.findOneAndDelete({ _id: user.id.toString() });
            console.log(`🗑️ Removed user ${user.id} from cache`);
          }

          // Acknowledge the message
          channel.ack(msg);
        } catch (error) {
          console.error('❌ Error processing user event:', error);
          // Reject the message and requeue
          channel.nack(msg, false, true);
        }
      }
    });

  } catch (error) {
    console.error('❌ Failed to start user event consumer:', error);
    throw error;
  }
};
