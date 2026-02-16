import { NotFoundServerException, BadRequestServerException } from '../../../shared/application/ServerException';
import { ExecutionEntity } from '../domain/Execution';
import { IExecutionRepository } from '../domain/IExecutionRepository';
import { SqsPublisher } from '../../../shared/messaging/SqsPublisher';
import { EventTypes } from '../../../shared/events/EventTypes';
import { logger } from '../../../utils/logger';

export type CreateExecutionInput = {
  serviceOrderId: number;
  mechanicId: number;
  notes?: string;
};

export type ExecutionOutput = ReturnType<ExecutionEntity['toJSON']>;

export interface IExecutionService {
  create(input: CreateExecutionInput): Promise<ExecutionOutput>;
  findById(id: number): Promise<ExecutionOutput>;
  findByServiceOrderId(serviceOrderId: number): Promise<ExecutionOutput>;
  start(id: number): Promise<ExecutionOutput>;
  finish(id: number): Promise<ExecutionOutput>;
  deliver(id: number): Promise<ExecutionOutput>;
  getExecutionTime(id: number): Promise<{ executionId: number; timeMs: number | null }>;
  getAverageExecutionTime(): Promise<{ averageMs: number; count: number }>;
}

export class ExecutionService implements IExecutionService {
  constructor(
    private readonly repo: IExecutionRepository,
    private readonly sqsPublisher: SqsPublisher,
  ) {}

  async create(input: CreateExecutionInput): Promise<ExecutionOutput> {
    const existing = await this.repo.findByServiceOrderId(input.serviceOrderId);

    if (existing) {
      throw new BadRequestServerException(`Execution already exists for service order ${input.serviceOrderId}`);
    }

    const entity = ExecutionEntity.create(input);
    const created = await this.repo.create(entity);

    logger.info(`Execution created for service order ${input.serviceOrderId}`, { executionId: created.id });

    return created.toJSON();
  }

  async findById(id: number): Promise<ExecutionOutput> {
    const found = await this.repo.findById(id);

    if (!found) {
      throw new NotFoundServerException('Execution not found');
    }

    return found.toJSON();
  }

  async findByServiceOrderId(serviceOrderId: number): Promise<ExecutionOutput> {
    const found = await this.repo.findByServiceOrderId(serviceOrderId);

    if (!found) {
      throw new NotFoundServerException('Execution not found for this service order');
    }

    return found.toJSON();
  }

  async start(id: number): Promise<ExecutionOutput> {
    const execution = await this.repo.findById(id);

    if (!execution) {
      throw new NotFoundServerException('Execution not found');
    }

    try {
      execution.start();
    } catch (error: any) {
      throw new BadRequestServerException(error.message);
    }

    const updated = await this.repo.update(execution);

    await this.publishEvent(EventTypes.REPAIR_STARTED, {
      executionId: updated.id,
      serviceOrderId: updated.serviceOrderId,
      mechanicId: updated.mechanicId,
      startedAt: updated.toJSON().startedAt,
    });

    logger.info(`Execution ${id} started`);

    return updated.toJSON();
  }

  async finish(id: number): Promise<ExecutionOutput> {
    const execution = await this.repo.findById(id);

    if (!execution) {
      throw new NotFoundServerException('Execution not found');
    }

    try {
      execution.finish();
    } catch (error: any) {
      throw new BadRequestServerException(error.message);
    }

    const updated = await this.repo.update(execution);

    await this.publishEvent(EventTypes.REPAIR_FINISHED, {
      executionId: updated.id,
      serviceOrderId: updated.serviceOrderId,
      mechanicId: updated.mechanicId,
      finishedAt: updated.toJSON().finishedAt,
      executionTimeMs: updated.getExecutionTimeMs(),
    });

    logger.info(`Execution ${id} finished`);

    return updated.toJSON();
  }

  async deliver(id: number): Promise<ExecutionOutput> {
    const execution = await this.repo.findById(id);

    if (!execution) {
      throw new NotFoundServerException('Execution not found');
    }

    try {
      execution.deliver();
    } catch (error: any) {
      throw new BadRequestServerException(error.message);
    }

    const updated = await this.repo.update(execution);

    await this.publishEvent(EventTypes.DELIVERED, {
      executionId: updated.id,
      serviceOrderId: updated.serviceOrderId,
      deliveredAt: updated.toJSON().deliveredAt,
    });

    logger.info(`Execution ${id} delivered`);

    return updated.toJSON();
  }

  async getExecutionTime(id: number): Promise<{ executionId: number; timeMs: number | null }> {
    const execution = await this.repo.findById(id);

    if (!execution) {
      throw new NotFoundServerException('Execution not found');
    }

    return {
      executionId: execution.id,
      timeMs: execution.getExecutionTimeMs(),
    };
  }

  async getAverageExecutionTime(): Promise<{ averageMs: number; count: number }> {
    const finished = await this.repo.findAllFinished();

    if (finished.length === 0) {
      return { averageMs: 0, count: 0 };
    }

    let totalMs = 0;
    let count = 0;

    for (const exec of finished) {
      const time = exec.getExecutionTimeMs();
      if (time !== null) {
        totalMs += time;
        count++;
      }
    }

    return {
      averageMs: count > 0 ? Math.round(totalMs / count) : 0,
      count,
    };
  }

  private async publishEvent(eventType: string, payload: Record<string, any>): Promise<void> {
    try {
      await this.sqsPublisher.publish(eventType, payload);
    } catch (error) {
      logger.error(`Failed to publish event ${eventType}`, error);
    }
  }
}
