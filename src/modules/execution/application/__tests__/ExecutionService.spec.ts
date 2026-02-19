import { ExecutionService } from '../ExecutionService';
import { IExecutionRepository } from '../../domain/IExecutionRepository';
import { ExecutionEntity } from '../../domain/Execution';
import { SqsPublisher } from '../../../../shared/messaging/SqsPublisher';
import { NotFoundServerException, BadRequestServerException } from '../../../../shared/application/ServerException';

jest.mock('../../../../utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

describe('ExecutionService', () => {
  let service: ExecutionService;
  let repo: jest.Mocked<IExecutionRepository>;
  let publisher: jest.Mocked<SqsPublisher>;

  const now = new Date('2026-01-10T10:00:00Z');

  function makeExecution(overrides: Partial<import('../../domain/Execution').IExecutionProps> = {}) {
    return ExecutionEntity.restore({
      id: 1,
      serviceOrderId: 100,
      mechanicId: 5,
      status: 'waiting',
      notes: null,
      startedAt: null,
      finishedAt: null,
      deliveredAt: null,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    });
  }

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByServiceOrderId: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      findAllFinished: jest.fn(),
    };

    publisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    } as any;

    service = new ExecutionService(repo, publisher);
  });

  describe('create', () => {
    it('should create an execution successfully', async () => {
      repo.findByServiceOrderId.mockResolvedValue(null);
      const created = makeExecution();
      repo.create.mockResolvedValue(created);

      const result = await service.create({ serviceOrderId: 100, mechanicId: 5 });

      expect(repo.findByServiceOrderId).toHaveBeenCalledWith(100);
      expect(repo.create).toHaveBeenCalled();
      expect(result.serviceOrderId).toBe(100);
    });

    it('should throw BadRequest if execution already exists for service order', async () => {
      repo.findByServiceOrderId.mockResolvedValue(makeExecution());

      await expect(service.create({ serviceOrderId: 100, mechanicId: 5 }))
        .rejects.toThrow(BadRequestServerException);
    });
  });

  describe('findById', () => {
    it('should return execution when found', async () => {
      repo.findById.mockResolvedValue(makeExecution());

      const result = await service.findById(1);

      expect(result.id).toBe(1);
      expect(repo.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFound when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundServerException);
    });
  });

  describe('findByServiceOrderId', () => {
    it('should return execution when found', async () => {
      repo.findByServiceOrderId.mockResolvedValue(makeExecution());

      const result = await service.findByServiceOrderId(100);

      expect(result.serviceOrderId).toBe(100);
    });

    it('should throw NotFound when not found', async () => {
      repo.findByServiceOrderId.mockResolvedValue(null);

      await expect(service.findByServiceOrderId(999)).rejects.toThrow(NotFoundServerException);
    });
  });

  describe('start', () => {
    it('should start a waiting execution', async () => {
      const execution = makeExecution({ status: 'waiting' });
      repo.findById.mockResolvedValue(execution);
      repo.update.mockResolvedValue(execution);

      const result = await service.start(1);

      expect(result.status).toBe('in_progress');
      expect(repo.update).toHaveBeenCalled();
      expect(publisher.publish).toHaveBeenCalled();
    });

    it('should throw NotFound when execution does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.start(999)).rejects.toThrow(NotFoundServerException);
    });

    it('should throw BadRequest if execution cannot be started', async () => {
      const execution = makeExecution({ status: 'finished' });
      repo.findById.mockResolvedValue(execution);

      await expect(service.start(1)).rejects.toThrow(BadRequestServerException);
    });
  });

  describe('finish', () => {
    it('should finish an in_progress execution', async () => {
      const execution = makeExecution({ status: 'in_progress', startedAt: now });
      repo.findById.mockResolvedValue(execution);
      repo.update.mockResolvedValue(execution);

      const result = await service.finish(1);

      expect(result.status).toBe('finished');
      expect(publisher.publish).toHaveBeenCalled();
    });

    it('should throw NotFound when execution does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.finish(999)).rejects.toThrow(NotFoundServerException);
    });

    it('should throw BadRequest if execution cannot be finished', async () => {
      const execution = makeExecution({ status: 'waiting' });
      repo.findById.mockResolvedValue(execution);

      await expect(service.finish(1)).rejects.toThrow(BadRequestServerException);
    });
  });

  describe('deliver', () => {
    it('should deliver a finished execution', async () => {
      const execution = makeExecution({ status: 'finished', startedAt: now, finishedAt: now });
      repo.findById.mockResolvedValue(execution);
      repo.update.mockResolvedValue(execution);

      const result = await service.deliver(1);

      expect(result.status).toBe('delivered');
      expect(publisher.publish).toHaveBeenCalled();
    });

    it('should throw NotFound when execution does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.deliver(999)).rejects.toThrow(NotFoundServerException);
    });

    it('should throw BadRequest if execution cannot be delivered', async () => {
      const execution = makeExecution({ status: 'waiting' });
      repo.findById.mockResolvedValue(execution);

      await expect(service.deliver(1)).rejects.toThrow(BadRequestServerException);
    });
  });

  describe('getExecutionTime', () => {
    it('should return execution time for existing execution', async () => {
      const execution = makeExecution({
        startedAt: new Date('2026-01-01T10:00:00Z'),
        finishedAt: new Date('2026-01-01T10:30:00Z'),
      });
      repo.findById.mockResolvedValue(execution);

      const result = await service.getExecutionTime(1);

      expect(result.executionId).toBe(1);
      expect(result.timeMs).toBe(30 * 60 * 1000);
    });

    it('should return null timeMs when not started/finished', async () => {
      repo.findById.mockResolvedValue(makeExecution());

      const result = await service.getExecutionTime(1);

      expect(result.timeMs).toBeNull();
    });

    it('should throw NotFound when execution does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getExecutionTime(999)).rejects.toThrow(NotFoundServerException);
    });
  });

  describe('getAverageExecutionTime', () => {
    it('should return average of finished executions', async () => {
      const exec1 = makeExecution({
        id: 1,
        status: 'finished',
        startedAt: new Date('2026-01-01T10:00:00Z'),
        finishedAt: new Date('2026-01-01T10:30:00Z'),
      });
      const exec2 = makeExecution({
        id: 2,
        status: 'finished',
        startedAt: new Date('2026-01-01T10:00:00Z'),
        finishedAt: new Date('2026-01-01T11:00:00Z'),
      });

      repo.findAllFinished.mockResolvedValue([exec1, exec2]);

      const result = await service.getAverageExecutionTime();

      expect(result.count).toBe(2);
      expect(result.averageMs).toBe(Math.round((30 * 60 * 1000 + 60 * 60 * 1000) / 2));
    });

    it('should return zero when no finished executions', async () => {
      repo.findAllFinished.mockResolvedValue([]);

      const result = await service.getAverageExecutionTime();

      expect(result.averageMs).toBe(0);
      expect(result.count).toBe(0);
    });

    it('should skip executions with null execution time', async () => {
      const exec1 = makeExecution({
        id: 1,
        status: 'finished',
        startedAt: null,
        finishedAt: null,
      });

      repo.findAllFinished.mockResolvedValue([exec1]);

      const result = await service.getAverageExecutionTime();

      expect(result.averageMs).toBe(0);
      expect(result.count).toBe(0);
    });
  });

  describe('publishEvent (private, tested via side effects)', () => {
    it('should not throw when publish fails', async () => {
      const execution = makeExecution({ status: 'waiting' });
      repo.findById.mockResolvedValue(execution);
      repo.update.mockResolvedValue(execution);
      publisher.publish.mockRejectedValue(new Error('SQS down'));

      // start calls publishEvent — should not throw even if publish fails
      const result = await service.start(1);
      expect(result.status).toBe('in_progress');
    });
  });
});
