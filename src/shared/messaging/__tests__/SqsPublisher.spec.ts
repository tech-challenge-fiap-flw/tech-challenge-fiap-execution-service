import { SqsPublisher } from '../SqsPublisher';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

const mockSend = jest.fn();
jest.mock('@aws-sdk/client-sqs', () => ({
  SQSClient: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  SendMessageCommand: jest.fn().mockImplementation((input) => input),
}));

jest.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

describe('SqsPublisher', () => {
  beforeEach(() => {
    mockSend.mockReset();
    process.env.SQS_EXECUTION_QUEUE_URL = 'https://sqs.test.com/queue';
  });

  afterEach(() => {
    delete process.env.SQS_EXECUTION_QUEUE_URL;
  });

  it('should publish a message to SQS', async () => {
    mockSend.mockResolvedValue({});

    const publisher = new SqsPublisher();
    await publisher.publish('test.event', { key: 'value' });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        QueueUrl: 'https://sqs.test.com/queue',
        MessageBody: expect.stringContaining('"eventType":"test.event"'),
      })
    );
  });

  it('should throw when SQS send fails', async () => {
    mockSend.mockRejectedValue(new Error('SQS error'));

    const publisher = new SqsPublisher();

    await expect(publisher.publish('test.event', {})).rejects.toThrow('SQS error');
  });

  it('should include eventId, timestamp, source in the message body', async () => {
    mockSend.mockResolvedValue({});

    const publisher = new SqsPublisher();
    await publisher.publish('my.event', { data: 1 });

    const call = mockSend.mock.calls[0][0];
    const body = JSON.parse(call.MessageBody);

    expect(body.eventId).toBe('test-uuid-1234');
    expect(body.source).toBe('execution-service');
    expect(body.eventType).toBe('my.event');
    expect(body.payload).toEqual({ data: 1 });
    expect(body.timestamp).toBeDefined();
  });
});
