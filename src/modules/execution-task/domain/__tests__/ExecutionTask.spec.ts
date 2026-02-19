import { ExecutionTaskEntity } from '../ExecutionTask';

describe('ExecutionTaskEntity', () => {
  const baseInput = { executionId: 1, description: 'Replace brake pads', assignedMechanicId: 5 };

  describe('create', () => {
    it('should create a task with status "pending"', () => {
      const entity = ExecutionTaskEntity.create(baseInput);
      const json = entity.toJSON();

      expect(json.executionId).toBe(1);
      expect(json.description).toBe('Replace brake pads');
      expect(json.status).toBe('pending');
      expect(json.assignedMechanicId).toBe(5);
      expect(json.id).toBe(0);
      expect(json.startedAt).toBeNull();
      expect(json.completedAt).toBeNull();
      expect(json.createdAt).toBeInstanceOf(Date);
      expect(json.updatedAt).toBeInstanceOf(Date);
    });

    it('should default assignedMechanicId to null when not provided', () => {
      const entity = ExecutionTaskEntity.create({ executionId: 1, description: 'task' });
      expect(entity.toJSON().assignedMechanicId).toBeNull();
    });
  });

  describe('restore', () => {
    it('should restore a task from props', () => {
      const now = new Date();
      const entity = ExecutionTaskEntity.restore({
        id: 10,
        executionId: 1,
        description: 'test',
        status: 'in_progress',
        assignedMechanicId: 3,
        startedAt: now,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      expect(entity.id).toBe(10);
      expect(entity.executionId).toBe(1);
      expect(entity.status).toBe('in_progress');
    });
  });

  describe('startTask', () => {
    it('should transition from pending to in_progress', () => {
      const entity = ExecutionTaskEntity.create(baseInput);
      entity.startTask();

      expect(entity.status).toBe('in_progress');
      expect(entity.toJSON().startedAt).toBeInstanceOf(Date);
    });

    it('should throw if not in pending status', () => {
      const entity = ExecutionTaskEntity.create(baseInput);
      entity.startTask();

      expect(() => entity.startTask()).toThrow('Cannot start task in status "in_progress"');
    });
  });

  describe('completeTask', () => {
    it('should transition from in_progress to done', () => {
      const entity = ExecutionTaskEntity.create(baseInput);
      entity.startTask();
      entity.completeTask();

      expect(entity.status).toBe('done');
      expect(entity.toJSON().completedAt).toBeInstanceOf(Date);
    });

    it('should throw if not in in_progress status', () => {
      const entity = ExecutionTaskEntity.create(baseInput);

      expect(() => entity.completeTask()).toThrow('Cannot complete task in status "pending"');
    });
  });

  describe('toJSON', () => {
    it('should return a copy of the props', () => {
      const entity = ExecutionTaskEntity.create(baseInput);
      const json1 = entity.toJSON();
      const json2 = entity.toJSON();

      expect(json1).toEqual(json2);
      expect(json1).not.toBe(json2);
    });
  });
});
