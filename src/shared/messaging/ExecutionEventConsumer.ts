import { SqsConsumer, SqsMessage } from './SqsConsumer';
import { IdempotencyStore } from './IdempotencyStore';
import { EventTypes } from '../events/EventTypes';
import { ExecutionMySqlRepository } from '../../modules/execution/infra/ExecutionMySqlRepository';
import { ExecutionService } from '../../modules/execution/application/ExecutionService';
import { SqsPublisher } from './SqsPublisher';
import { logger } from '../../utils/logger';

export class ExecutionEventConsumer {
  private consumer: SqsConsumer;
  private idempotency: IdempotencyStore;
  private executionService: ExecutionService;

  constructor() {
    const osQueueUrl = process.env.SQS_OS_QUEUE_URL || '';
    this.consumer = new SqsConsumer(osQueueUrl);
    this.idempotency = new IdempotencyStore();

    const repo = new ExecutionMySqlRepository();
    const publisher = new SqsPublisher();
    this.executionService = new ExecutionService(repo, publisher);

    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.consumer.on(EventTypes.OS_BUDGET_APPROVED, async (msg: SqsMessage) => {
      await this.handleWithIdempotency(msg, async () => {
        const { serviceOrderId, mechanicId } = msg.payload;

        logger.info('OS budget approved — creating execution', { serviceOrderId });

        await this.executionService.create({
          serviceOrderId,
          mechanicId: mechanicId || 0,
          notes: `Auto-created from approved budget (OS #${serviceOrderId})`,
        });
      });
    });

    this.consumer.on(EventTypes.PAYMENT_CONFIRMED, async (msg: SqsMessage) => {
      await this.handleWithIdempotency(msg, async () => {
        const { budgetId, serviceOrderId } = msg.payload;

        logger.info('Payment confirmed — execution can start', { budgetId, serviceOrderId });

        if (serviceOrderId) {
          const execution = await this.executionService.findByServiceOrderId(serviceOrderId);
          if (execution && execution.status === 'waiting') {
            logger.info('Execution ready to start after payment confirmation', {
              executionId: execution.id,
            });
          }
        }
      });
    });
  }

  private async handleWithIdempotency(msg: SqsMessage, handler: () => Promise<void>): Promise<void> {
    if (await this.idempotency.isProcessed(msg.eventId)) {
      logger.warn(`Event ${msg.eventId} already processed, skipping`);
      return;
    }

    await handler();
    await this.idempotency.markProcessed(msg.eventId);
  }

  start(): void {
    this.consumer.start();
  }

  stop(): void {
    this.consumer.stop();
  }
}
