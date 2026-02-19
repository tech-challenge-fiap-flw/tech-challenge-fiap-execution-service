import { createExecutionSchema } from '../schemas';

describe('createExecutionSchema', () => {
  it('should validate a valid input', () => {
    const result = createExecutionSchema.safeParse({
      serviceOrderId: 1,
      mechanicId: 2,
      notes: 'test',
    });

    expect(result.success).toBe(true);
  });

  it('should accept input without notes', () => {
    const result = createExecutionSchema.safeParse({
      serviceOrderId: 1,
      mechanicId: 2,
    });

    expect(result.success).toBe(true);
  });

  it('should reject non-integer serviceOrderId', () => {
    const result = createExecutionSchema.safeParse({
      serviceOrderId: 1.5,
      mechanicId: 2,
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing serviceOrderId', () => {
    const result = createExecutionSchema.safeParse({
      mechanicId: 2,
    });

    expect(result.success).toBe(false);
  });

  it('should reject non-number mechanicId', () => {
    const result = createExecutionSchema.safeParse({
      serviceOrderId: 1,
      mechanicId: 'abc',
    });

    expect(result.success).toBe(false);
  });
});
