import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class SqsPublisher {
  private readonly client: SQSClient;
  private readonly queueUrl: string;

  constructor() {
    this.client = new SQSClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.queueUrl = process.env.SQS_EXECUTION_QUEUE_URL || '';
  }

  async publish(eventType: string, payload: Record<string, any>): Promise<void> {
    const message = {
      eventId: uuidv4(),
      eventType,
      timestamp: new Date().toISOString(),
      source: 'execution-service',
      payload,
    };

    try {
      await this.client.send(
        new SendMessageCommand({
          QueueUrl: this.queueUrl,
          MessageBody: JSON.stringify(message),
          MessageAttributes: {
            eventType: {
              DataType: 'String',
              StringValue: eventType,
            },
          },
        })
      );

      logger.info(`Event published: ${eventType}`, { eventId: message.eventId });
    } catch (error) {
      logger.error(`Failed to publish event: ${eventType}`, error);
      throw error;
    }
  }
}
