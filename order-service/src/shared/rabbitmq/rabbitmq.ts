import * as amqp from 'amqplib';
import config from '../config/index';
import logger from './logger';

class RabbitMQConnection {
  private connection: any = null;
  private channel: any = null;
  private isConnecting = false;

  async connect(): Promise<any> {
    if (this.channel) {
      return this.channel;
    }

    if (this.isConnecting) {
      // Wait for existing connection attempt
      while (this.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (this.channel) {
        return this.channel;
      }
    }

    this.isConnecting = true;

    try {
      logger.info('Connecting to RabbitMQ...', { url: config.rabbitmq_url });

      this.connection = await amqp.connect(config.rabbitmq_url as string);
      this.channel = await this.connection.createChannel();

      // Handle connection events
      this.connection.on('error', (err: any) => {
        logger.error('RabbitMQ connection error', { error: err });
        this.resetConnection();
      });

      this.connection.on('close', () => {
        logger.warn('RabbitMQ connection closed');
        this.resetConnection();
      });

      logger.info('Successfully connected to RabbitMQ');
      return this.channel;
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ', { error });
      this.resetConnection();
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  private resetConnection() {
    this.connection = null;
    this.channel = null;
    this.isConnecting = false;
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      logger.info('RabbitMQ connection closed gracefully');
    } catch (error) {
      logger.error('Error closing RabbitMQ connection', { error });
    } finally {
      this.resetConnection();
    }
  }

  getChannel(): any {
    return this.channel;
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}

// Singleton instance
export const rabbitMQ = new RabbitMQConnection();
export default rabbitMQ;
