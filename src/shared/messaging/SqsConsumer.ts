import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { logger } from '../../utils/logger';

export interface SqsMessage {
  eventId: string;
  eventType: string;
  timestamp: string;
  source: string;
  payload: Record<string, any>;
}

export type MessageHandler = (message: SqsMessage) => Promise<void>;

export class SqsConsumer {
  private readonly client: SQSClient;
  private running = false;
  private handlers: Map<string, MessageHandler> = new Map();

  constructor(private readonly queueUrl: string) {
    this.client = new SQSClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  on(eventType: string, handler: MessageHandler): void {
    this.handlers.set(eventType, handler);
  }

  async start(): Promise<void> {
    if (!this.queueUrl) {
      logger.warn('SQS queue URL not configured, consumer not started');
      return;
    }

    this.running = true;
    logger.info('SQS Consumer started', { queueUrl: this.queueUrl });

    while (this.running) {
      try {
        const response = await this.client.send(
          new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 20,
            MessageAttributeNames: ['All'],
          })
        );

        if (response.Messages) {
          for (const msg of response.Messages) {
            try {
              const body: SqsMessage = JSON.parse(msg.Body || '{}');
              const handler = this.handlers.get(body.eventType);

              if (handler) {
                await handler(body);
                logger.info(`Event processed: ${body.eventType}`, { eventId: body.eventId });
              } else {
                logger.warn(`No handler for event type: ${body.eventType}`);
              }

              await this.client.send(
                new DeleteMessageCommand({
                  QueueUrl: this.queueUrl,
                  ReceiptHandle: msg.ReceiptHandle,
                })
              );
            } catch (error) {
              logger.error('Error processing SQS message', error);
            }
          }
        }
      } catch (error) {
        logger.error('Error receiving SQS messages', error);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  stop(): void {
    this.running = false;
  }
}
