import { ExecutionEventConsumer } from '../ExecutionEventConsumer';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

// Mock all dependencies
const mockIsProcessed = jest.fn();
const mockMarkProcessed = jest.fn();
jest.mock('../IdempotencyStore', () => ({
  IdempotencyStore: jest.fn().mockImplementation(() => ({
    isProcessed: mockIsProcessed,
    markProcessed: mockMarkProcessed,
  })),
}));

const mockConsumerOn = jest.fn();
const mockConsumerStart = jest.fn();
const mockConsumerStop = jest.fn();
jest.mock('../SqsConsumer', () => ({
  SqsConsumer: jest.fn().mockImplementation(() => ({
    on: mockConsumerOn,
    start: mockConsumerStart,
    stop: mockConsumerStop,
  })),
}));

const mockServiceCreate = jest.fn();
const mockServiceFindByServiceOrderId = jest.fn();
jest.mock('../../../modules/execution/application/ExecutionService', () => ({
  ExecutionService: jest.fn().mockImplementation(() => ({
    create: mockServiceCreate,
    findByServiceOrderId: mockServiceFindByServiceOrderId,
  })),
}));

jest.mock('../../../modules/execution/infra/ExecutionMySqlRepository', () => ({
  ExecutionMySqlRepository: jest.fn(),
}));

jest.mock('../SqsPublisher', () => ({
  SqsPublisher: jest.fn(),
}));

describe('ExecutionEventConsumer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsProcessed.mockResolvedValue(false);
    mockMarkProcessed.mockResolvedValue(undefined);
    process.env.SQS_OS_QUEUE_URL = 'https://sqs.test.com/os-queue';
  });

  afterEach(() => {
    delete process.env.SQS_OS_QUEUE_URL;
  });

  it('should register handlers on construction', () => {
    new ExecutionEventConsumer();

    expect(mockConsumerOn).toHaveBeenCalledWith('os.budget-approved', expect.any(Function));
    expect(mockConsumerOn).toHaveBeenCalledWith('billing.payment-confirmed', expect.any(Function));
  });

  it('should start the consumer', () => {
    const consumer = new ExecutionEventConsumer();
    consumer.start();

    expect(mockConsumerStart).toHaveBeenCalled();
  });

  it('should stop the consumer', () => {
    const consumer = new ExecutionEventConsumer();
    consumer.stop();

    expect(mockConsumerStop).toHaveBeenCalled();
  });

  it('should handle OS_BUDGET_APPROVED event and create execution', async () => {
    new ExecutionEventConsumer();

    const handler = mockConsumerOn.mock.calls.find(
      (call: any) => call[0] === 'os.budget-approved'
    )?.[1];

    mockServiceCreate.mockResolvedValue({ id: 1 });

    await handler({
      eventId: 'evt-1',
      eventType: 'os.budget-approved',
      payload: { serviceOrderId: 100, mechanicId: 5 },
    });

    expect(mockServiceCreate).toHaveBeenCalledWith({
      serviceOrderId: 100,
      mechanicId: 5,
      notes: 'Auto-created from approved budget (OS #100)',
    });
    expect(mockMarkProcessed).toHaveBeenCalledWith('evt-1');
  });

  it('should skip already processed events', async () => {
    mockIsProcessed.mockResolvedValue(true);

    new ExecutionEventConsumer();

    const handler = mockConsumerOn.mock.calls.find(
      (call: any) => call[0] === 'os.budget-approved'
    )?.[1];

    await handler({
      eventId: 'evt-already',
      eventType: 'os.budget-approved',
      payload: { serviceOrderId: 100 },
    });

    expect(mockServiceCreate).not.toHaveBeenCalled();
  });

  it('should handle PAYMENT_CONFIRMED event', async () => {
    new ExecutionEventConsumer();

    const handler = mockConsumerOn.mock.calls.find(
      (call: any) => call[0] === 'billing.payment-confirmed'
    )?.[1];

    mockServiceFindByServiceOrderId.mockResolvedValue({ id: 1, status: 'waiting' });

    await handler({
      eventId: 'evt-2',
      eventType: 'billing.payment-confirmed',
      payload: { budgetId: 10, serviceOrderId: 200 },
    });

    expect(mockServiceFindByServiceOrderId).toHaveBeenCalledWith(200);
    expect(mockMarkProcessed).toHaveBeenCalledWith('evt-2');
  });
});
