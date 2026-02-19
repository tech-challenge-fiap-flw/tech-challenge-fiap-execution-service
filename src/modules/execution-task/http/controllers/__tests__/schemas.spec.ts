import { createTaskSchema, updateTaskSchema } from '../schemas';

describe('createTaskSchema', () => {
  it('should validate a valid input', () => {
    const result = createTaskSchema.safeParse({
      executionId: 1,
      description: 'Replace brake pads',
      assignedMechanicId: 5,
    });

    expect(result.success).toBe(true);
  });

  it('should accept without assignedMechanicId', () => {
    const result = createTaskSchema.safeParse({
      executionId: 1,
      description: 'Replace brake pads',
    });

    expect(result.success).toBe(true);
  });

  it('should reject description shorter than 3 chars', () => {
    const result = createTaskSchema.safeParse({
      executionId: 1,
      description: 'ab',
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing executionId', () => {
    const result = createTaskSchema.safeParse({
      description: 'Some task',
    });

    expect(result.success).toBe(false);
  });
});

describe('updateTaskSchema', () => {
  it('should validate with description only', () => {
    const result = updateTaskSchema.safeParse({ description: 'Updated' });

    expect(result.success).toBe(true);
  });

  it('should validate with assignedMechanicId only', () => {
    const result = updateTaskSchema.safeParse({ assignedMechanicId: 3 });

    expect(result.success).toBe(true);
  });

  it('should validate empty object (all optional)', () => {
    const result = updateTaskSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it('should reject description shorter than 3 chars', () => {
    const result = updateTaskSchema.safeParse({ description: 'ab' });

    expect(result.success).toBe(false);
  });
});
