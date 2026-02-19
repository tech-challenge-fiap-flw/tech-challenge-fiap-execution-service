import { ExecutionEntity } from '../Execution';

describe('ExecutionEntity', () => {
  const baseInput = { serviceOrderId: 100, mechanicId: 5, notes: 'test note' };

  describe('create', () => {
    it('should create an execution with status "waiting"', () => {
      const entity = ExecutionEntity.create(baseInput);
      const json = entity.toJSON();

      expect(json.serviceOrderId).toBe(100);
      expect(json.mechanicId).toBe(5);
      expect(json.status).toBe('waiting');
      expect(json.notes).toBe('test note');
      expect(json.id).toBe(0);
      expect(json.startedAt).toBeNull();
      expect(json.finishedAt).toBeNull();
      expect(json.deliveredAt).toBeNull();
      expect(json.createdAt).toBeInstanceOf(Date);
      expect(json.updatedAt).toBeInstanceOf(Date);
    });

    it('should default notes to null when not provided', () => {
      const entity = ExecutionEntity.create({ serviceOrderId: 1, mechanicId: 2 });
      expect(entity.toJSON().notes).toBeNull();
    });
  });

  describe('restore', () => {
    it('should restore an execution from props', () => {
      const now = new Date();
      const entity = ExecutionEntity.restore({
        id: 10,
        serviceOrderId: 100,
        mechanicId: 5,
        status: 'in_progress',
        notes: 'n',
        startedAt: now,
        finishedAt: null,
        deliveredAt: null,
        createdAt: now,
        updatedAt: now,
      });

      expect(entity.id).toBe(10);
      expect(entity.serviceOrderId).toBe(100);
      expect(entity.mechanicId).toBe(5);
      expect(entity.status).toBe('in_progress');
    });
  });

  describe('start', () => {
    it('should transition from waiting to in_progress', () => {
      const entity = ExecutionEntity.create(baseInput);
      entity.start();

      expect(entity.status).toBe('in_progress');
      expect(entity.toJSON().startedAt).toBeInstanceOf(Date);
    });

    it('should throw if not in waiting status', () => {
      const entity = ExecutionEntity.create(baseInput);
      entity.start();

      expect(() => entity.start()).toThrow('Cannot start execution in status "in_progress"');
    });
  });

  describe('finish', () => {
    it('should transition from in_progress to finished', () => {
      const entity = ExecutionEntity.create(baseInput);
      entity.start();
      entity.finish();

      expect(entity.status).toBe('finished');
      expect(entity.toJSON().finishedAt).toBeInstanceOf(Date);
    });

    it('should throw if not in in_progress status', () => {
      const entity = ExecutionEntity.create(baseInput);

      expect(() => entity.finish()).toThrow('Cannot finish execution in status "waiting"');
    });
  });

  describe('deliver', () => {
    it('should transition from finished to delivered', () => {
      const entity = ExecutionEntity.create(baseInput);
      entity.start();
      entity.finish();
      entity.deliver();

      expect(entity.status).toBe('delivered');
      expect(entity.toJSON().deliveredAt).toBeInstanceOf(Date);
    });

    it('should throw if not in finished status', () => {
      const entity = ExecutionEntity.create(baseInput);
      entity.start();

      expect(() => entity.deliver()).toThrow('Cannot deliver execution in status "in_progress"');
    });
  });

  describe('getExecutionTimeMs', () => {
    it('should return null when startedAt or finishedAt is missing', () => {
      const entity = ExecutionEntity.create(baseInput);
      expect(entity.getExecutionTimeMs()).toBeNull();
    });

    it('should return difference in ms between start and finish', () => {
      const startedAt = new Date('2026-01-01T10:00:00Z');
      const finishedAt = new Date('2026-01-01T10:30:00Z');

      const entity = ExecutionEntity.restore({
        id: 1,
        serviceOrderId: 1,
        mechanicId: 1,
        status: 'finished',
        notes: null,
        startedAt,
        finishedAt,
        deliveredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(entity.getExecutionTimeMs()).toBe(30 * 60 * 1000);
    });
  });

  describe('toJSON', () => {
    it('should return a copy of the props', () => {
      const entity = ExecutionEntity.create(baseInput);
      const json1 = entity.toJSON();
      const json2 = entity.toJSON();

      expect(json1).toEqual(json2);
      expect(json1).not.toBe(json2);
    });
  });
});
