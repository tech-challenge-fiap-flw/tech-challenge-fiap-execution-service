import { CircuitBreaker } from '../CircuitBreaker';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker(3, 1000);
  });

  it('should start in CLOSED state', () => {
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('should execute successfully in CLOSED state', async () => {
    const result = await breaker.execute(() => Promise.resolve('ok'));

    expect(result).toBe('ok');
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('should count failures and open after threshold', async () => {
    const fail = () => Promise.reject(new Error('fail'));

    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(fail)).rejects.toThrow('fail');
    }

    expect(breaker.getState()).toBe('OPEN');
  });

  it('should block requests when OPEN', async () => {
    const fail = () => Promise.reject(new Error('fail'));

    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(fail)).rejects.toThrow('fail');
    }

    await expect(breaker.execute(() => Promise.resolve('ok')))
      .rejects.toThrow('Circuit breaker is OPEN');
  });

  it('should transition to HALF_OPEN after resetTimeout', async () => {
    const breaker = new CircuitBreaker(1, 50); // 50ms reset

    await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
    expect(breaker.getState()).toBe('OPEN');

    // Wait for reset timeout
    await new Promise((r) => setTimeout(r, 60));

    const result = await breaker.execute(() => Promise.resolve('recovered'));

    expect(result).toBe('recovered');
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('should reset failure count on success', async () => {
    const breaker = new CircuitBreaker(3, 1000);

    // 2 failures
    await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
    await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();

    // 1 success resets count
    await breaker.execute(() => Promise.resolve('ok'));

    // 2 more failures should not open (count was reset)
    await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
    await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();

    expect(breaker.getState()).toBe('CLOSED');
  });

  it('should recover from HALF_OPEN to CLOSED on success', async () => {
    const breaker = new CircuitBreaker(1, 50);

    await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
    expect(breaker.getState()).toBe('OPEN');

    await new Promise((r) => setTimeout(r, 60));

    await breaker.execute(() => Promise.resolve('ok'));
    expect(breaker.getState()).toBe('CLOSED');
  });
});
