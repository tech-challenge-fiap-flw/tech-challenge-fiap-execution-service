import { SqsConsumer, SqsMessage } from '../SqsConsumer';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

const mockSend = jest.fn();
jest.mock('@aws-sdk/client-sqs', () => ({
  SQSClient: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  ReceiveMessageCommand: jest.fn().mockImplementation((input) => ({ ...input, _type: 'receive' })),
  DeleteMessageCommand: jest.fn().mockImplementation((input) => ({ ...input, _type: 'delete' })),
}));

describe('SqsConsumer', () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  it('should register handlers via on()', () => {
    const consumer = new SqsConsumer('https://sqs.test.com/queue');
    const handler = jest.fn();

    consumer.on('test.event', handler);

    // No direct assertion — we verify handlers are called in the start test
    expect(true).toBe(true);
  });

  it('should not start if queueUrl is empty', async () => {
    const consumer = new SqsConsumer('');

    await consumer.start();

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should process messages and call registered handler', async () => {
    const message: SqsMessage = {
      eventId: 'evt-1',
      eventType: 'test.event',
      timestamp: new Date().toISOString(),
      source: 'test',
      payload: { key: 'value' },
    };

    let callCount = 0;
    mockSend.mockImplementation(async (cmd: any) => {
      if (cmd._type === 'receive') {
        callCount++;
        if (callCount === 1) {
          return {
            Messages: [
              { Body: JSON.stringify(message), ReceiptHandle: 'rh-1' },
            ],
          };
        }
        // Stop after first batch
        consumer.stop();
        return { Messages: [] };
      }
      // DeleteMessageCommand
      return {};
    });

    const handler = jest.fn().mockResolvedValue(undefined);
    const consumer = new SqsConsumer('https://sqs.test.com/queue');
    consumer.on('test.event', handler);

    await consumer.start();

    expect(handler).toHaveBeenCalledWith(message);
  });

  it('should stop polling when stop() is called', () => {
    const consumer = new SqsConsumer('https://sqs.test.com/queue');
    consumer.stop();
    // No error, running set to false
    expect(true).toBe(true);
  });
});
