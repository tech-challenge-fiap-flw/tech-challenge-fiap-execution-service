import { ExecutionMySqlRepository } from '../ExecutionMySqlRepository';
import { ExecutionEntity } from '../../domain/Execution';

const mockQuery = jest.fn();
const mockInsertOne = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../../../../infra/db/mysql', () => ({
  query: (...args: any[]) => mockQuery(...args),
  insertOne: (...args: any[]) => mockInsertOne(...args),
  update: (...args: any[]) => mockUpdate(...args),
}));

describe('ExecutionMySqlRepository', () => {
  let repo: ExecutionMySqlRepository;
  const now = new Date('2026-01-10T10:00:00Z');

  beforeEach(() => {
    mockQuery.mockReset();
    mockInsertOne.mockReset();
    mockUpdate.mockReset();
    repo = new ExecutionMySqlRepository();
  });

  describe('create', () => {
    it('should insert and return entity with insertId', async () => {
      mockInsertOne.mockResolvedValue({ insertId: 42 });

      const entity = ExecutionEntity.create({ serviceOrderId: 100, mechanicId: 5, notes: 'test' });
      const result = await repo.create(entity);

      expect(result.id).toBe(42);
      expect(mockInsertOne).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO executions'),
        expect.any(Array)
      );
    });
  });

  describe('findById', () => {
    it('should return entity when found', async () => {
      mockQuery.mockResolvedValue([{
        id: 1, serviceOrderId: 100, mechanicId: 5, status: 'waiting',
        notes: null, startedAt: null, finishedAt: null, deliveredAt: null,
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

  describe('findByServiceOrderId', () => {
    it('should return entity when found', async () => {
      mockQuery.mockResolvedValue([{
        id: 1, serviceOrderId: 100, mechanicId: 5, status: 'waiting',
        notes: null, startedAt: null, finishedAt: null, deliveredAt: null,
        createdAt: now, updatedAt: now,
      }]);

      const result = await repo.findByServiceOrderId(100);

      expect(result).not.toBeNull();
      expect(result!.serviceOrderId).toBe(100);
    });

    it('should return null when not found', async () => {
      mockQuery.mockResolvedValue([]);

      const result = await repo.findByServiceOrderId(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return entity', async () => {
      mockUpdate.mockResolvedValue({ affectedRows: 1 });

      const entity = ExecutionEntity.restore({
        id: 1, serviceOrderId: 100, mechanicId: 5, status: 'in_progress',
        notes: null, startedAt: now, finishedAt: null, deliveredAt: null,
        createdAt: now, updatedAt: now,
      });

      const result = await repo.update(entity);

      expect(result).toBe(entity);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE executions'),
        expect.any(Array)
      );
    });
  });

  describe('findAll', () => {
    it('should return list of entities', async () => {
      mockQuery.mockResolvedValue([
        { id: 1, serviceOrderId: 100, mechanicId: 5, status: 'waiting', notes: null, startedAt: null, finishedAt: null, deliveredAt: null, createdAt: now, updatedAt: now },
        { id: 2, serviceOrderId: 101, mechanicId: 6, status: 'waiting', notes: null, startedAt: null, finishedAt: null, deliveredAt: null, createdAt: now, updatedAt: now },
      ]);

      const result = await repo.findAll();

      expect(result).toHaveLength(2);
    });
  });

  describe('findAllFinished', () => {
    it('should return finished/delivered executions', async () => {
      mockQuery.mockResolvedValue([
        { id: 1, serviceOrderId: 100, mechanicId: 5, status: 'finished', notes: null, startedAt: now, finishedAt: now, deliveredAt: null, createdAt: now, updatedAt: now },
      ]);

      const result = await repo.findAllFinished();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('finished');
    });
  });
});
