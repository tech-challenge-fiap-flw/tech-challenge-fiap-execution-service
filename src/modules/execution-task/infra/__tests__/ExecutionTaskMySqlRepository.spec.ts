import { ExecutionTaskMySqlRepository } from '../ExecutionTaskMySqlRepository';
import { ExecutionTaskEntity } from '../../domain/ExecutionTask';

const mockQuery = jest.fn();
const mockInsertOne = jest.fn();
const mockUpdate = jest.fn();
const mockDeleteByField = jest.fn();

jest.mock('../../../../infra/db/mysql', () => ({
  query: (...args: any[]) => mockQuery(...args),
  insertOne: (...args: any[]) => mockInsertOne(...args),
  update: (...args: any[]) => mockUpdate(...args),
  deleteByField: (...args: any[]) => mockDeleteByField(...args),
}));

describe('ExecutionTaskMySqlRepository', () => {
  let repo: ExecutionTaskMySqlRepository;
  const now = new Date('2026-01-10T10:00:00Z');

  beforeEach(() => {
    mockQuery.mockReset();
    mockInsertOne.mockReset();
    mockUpdate.mockReset();
    mockDeleteByField.mockReset();
    repo = new ExecutionTaskMySqlRepository();
  });

  describe('create', () => {
    it('should insert and return entity with insertId', async () => {
      mockInsertOne.mockResolvedValue({ insertId: 7 });

      const entity = ExecutionTaskEntity.create({ executionId: 1, description: 'task' });
      const result = await repo.create(entity);

      expect(result.id).toBe(7);
      expect(mockInsertOne).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO execution_tasks'),
        expect.any(Array)
      );
    });
  });

  describe('findById', () => {
    it('should return entity when found', async () => {
      mockQuery.mockResolvedValue([{
        id: 1, executionId: 10, description: 'task', status: 'pending',
        assignedMechanicId: null, startedAt: null, completedAt: null,
        createdAt: now, updatedAt: now,
      }]);

      const result = await repo.findById(1);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(1);
    });

    it('should return null when not found', async () => {
      mockQuery.mockResolvedValue([]);

      const result = await repo.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByExecutionId', () => {
    it('should return list of tasks for execution', async () => {
      mockQuery.mockResolvedValue([
        { id: 1, executionId: 10, description: 'task1', status: 'pending', assignedMechanicId: null, startedAt: null, completedAt: null, createdAt: now, updatedAt: now },
        { id: 2, executionId: 10, description: 'task2', status: 'pending', assignedMechanicId: null, startedAt: null, completedAt: null, createdAt: now, updatedAt: now },
      ]);

      const result = await repo.findByExecutionId(10);

      expect(result).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should update and return entity', async () => {
      mockUpdate.mockResolvedValue({ affectedRows: 1 });

      const entity = ExecutionTaskEntity.restore({
        id: 1, executionId: 10, description: 'updated', status: 'in_progress',
        assignedMechanicId: 5, startedAt: now, completedAt: null,
        createdAt: now, updatedAt: now,
      });

      const result = await repo.update(entity);

      expect(result).toBe(entity);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE execution_tasks'),
        expect.any(Array)
      );
    });
  });

  describe('delete', () => {
    it('should delete by id', async () => {
      mockDeleteByField.mockResolvedValue(undefined);

      await repo.delete(1);

      expect(mockDeleteByField).toHaveBeenCalledWith('execution_tasks', 'id', 1);
    });
  });
});
