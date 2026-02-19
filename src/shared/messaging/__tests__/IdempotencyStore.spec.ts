import { IdempotencyStore } from '../IdempotencyStore';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

const mockQuery = jest.fn();
const mockInsertOne = jest.fn();

jest.mock('../../../infra/db/mysql', () => ({
  query: (...args: any[]) => mockQuery(...args),
  insertOne: (...args: any[]) => mockInsertOne(...args),
}));

describe('IdempotencyStore', () => {
  let store: IdempotencyStore;

  beforeEach(() => {
    mockQuery.mockReset();
    mockInsertOne.mockReset();
    store = new IdempotencyStore();
  });

  describe('isProcessed', () => {
    it('should return true when event exists', async () => {
      mockQuery.mockResolvedValue([{ eventId: 'evt-1' }]);

      const result = await store.isProcessed('evt-1');

      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT eventId FROM idempotency_keys WHERE eventId = ?',
        ['evt-1']
      );
    });

    it('should return false when event does not exist', async () => {
      mockQuery.mockResolvedValue([]);

      const result = await store.isProcessed('evt-2');

      expect(result).toBe(false);
    });
  });

  describe('markProcessed', () => {
    it('should insert a new idempotency key', async () => {
      mockInsertOne.mockResolvedValue({ insertId: 1 });

      await store.markProcessed('evt-1');

      expect(mockInsertOne).toHaveBeenCalledWith(
        'INSERT INTO idempotency_keys (eventId) VALUES (?)',
        ['evt-1']
      );
    });

    it('should silently ignore duplicate entry errors', async () => {
      mockInsertOne.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      await expect(store.markProcessed('evt-1')).resolves.toBeUndefined();
    });

    it('should throw on non-duplicate errors', async () => {
      mockInsertOne.mockRejectedValue(new Error('DB connection lost'));

      await expect(store.markProcessed('evt-1')).rejects.toThrow('DB connection lost');
    });
  });
});
