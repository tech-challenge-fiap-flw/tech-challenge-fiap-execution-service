import { ExecutionTaskService } from '../ExecutionTaskService';
import { IExecutionTaskRepository } from '../../domain/IExecutionTaskRepository';
import { ExecutionTaskEntity } from '../../domain/ExecutionTask';
import { NotFoundServerException, BadRequestServerException } from '../../../../shared/application/ServerException';

jest.mock('../../../../utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

describe('ExecutionTaskService', () => {
  let service: ExecutionTaskService;
  let repo: jest.Mocked<IExecutionTaskRepository>;

  const now = new Date('2026-01-10T10:00:00Z');

  function makeTask(overrides: Partial<import('../../domain/ExecutionTask').IExecutionTaskProps> = {}) {
    return ExecutionTaskEntity.restore({
      id: 1,
      executionId: 10,
      description: 'Replace brake pads',
      status: 'pending',
      assignedMechanicId: 5,
      startedAt: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    });
  }

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByExecutionId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    service = new ExecutionTaskService(repo);
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      const created = makeTask();
      repo.create.mockResolvedValue(created);

      const result = await service.create({ executionId: 10, description: 'Replace brake pads' });

      expect(repo.create).toHaveBeenCalled();
      expect(result.executionId).toBe(10);
    });
  });

  describe('findById', () => {
    it('should return task when found', async () => {
      repo.findById.mockResolvedValue(makeTask());

      const result = await service.findById(1);

      expect(result.id).toBe(1);
    });

    it('should throw NotFound when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundServerException);
    });
  });

  describe('findByExecutionId', () => {
    it('should return list of tasks', async () => {
      repo.findByExecutionId.mockResolvedValue([makeTask(), makeTask({ id: 2 })]);

      const result = await service.findByExecutionId(10);

      expect(result).toHaveLength(2);
    });

    it('should return empty array when no tasks found', async () => {
      repo.findByExecutionId.mockResolvedValue([]);

      const result = await service.findByExecutionId(999);

      expect(result).toEqual([]);
    });
  });

  describe('startTask', () => {
    it('should start a pending task', async () => {
      const task = makeTask({ status: 'pending' });
      repo.findById.mockResolvedValue(task);
      repo.update.mockResolvedValue(task);

      const result = await service.startTask(1);

      expect(result.status).toBe('in_progress');
      expect(repo.update).toHaveBeenCalled();
    });

    it('should throw NotFound when task does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.startTask(999)).rejects.toThrow(NotFoundServerException);
    });

    it('should throw BadRequest if task cannot be started', async () => {
      const task = makeTask({ status: 'done' });
      repo.findById.mockResolvedValue(task);

      await expect(service.startTask(1)).rejects.toThrow(BadRequestServerException);
    });
  });

  describe('completeTask', () => {
    it('should complete an in_progress task', async () => {
      const task = makeTask({ status: 'in_progress', startedAt: now });
      repo.findById.mockResolvedValue(task);
      repo.update.mockResolvedValue(task);

      const result = await service.completeTask(1);

      expect(result.status).toBe('done');
    });

    it('should throw NotFound when task does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.completeTask(999)).rejects.toThrow(NotFoundServerException);
    });

    it('should throw BadRequest if task cannot be completed', async () => {
      const task = makeTask({ status: 'pending' });
      repo.findById.mockResolvedValue(task);

      await expect(service.completeTask(1)).rejects.toThrow(BadRequestServerException);
    });
  });

  describe('update', () => {
    it('should update task description', async () => {
      const task = makeTask();
      repo.findById.mockResolvedValue(task);
      repo.update.mockImplementation(async (t) => t);

      const result = await service.update(1, { description: 'New desc' });

      expect(result.description).toBe('New desc');
    });

    it('should update assignedMechanicId', async () => {
      const task = makeTask();
      repo.findById.mockResolvedValue(task);
      repo.update.mockImplementation(async (t) => t);

      const result = await service.update(1, { assignedMechanicId: 99 });

      expect(result.assignedMechanicId).toBe(99);
    });

    it('should throw NotFound when task does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update(999, { description: 'x' })).rejects.toThrow(NotFoundServerException);
    });
  });

  describe('delete', () => {
    it('should delete an existing task', async () => {
      repo.findById.mockResolvedValue(makeTask());
      repo.delete.mockResolvedValue(undefined);

      await expect(service.delete(1)).resolves.toBeUndefined();
      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFound when task does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundServerException);
    });
  });
});
