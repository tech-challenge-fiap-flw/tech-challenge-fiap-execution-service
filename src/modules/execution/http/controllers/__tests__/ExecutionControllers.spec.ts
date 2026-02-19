import { GetExecutionController } from '../GetExecutionController';
import { GetExecutionByOrderController } from '../GetExecutionByOrderController';
import { StartExecutionController } from '../StartExecutionController';
import { FinishExecutionController } from '../FinishExecutionController';
import { DeliverExecutionController } from '../DeliverExecutionController';
import { GetExecutionTimeController } from '../GetExecutionTimeController';
import { GetAverageExecutionTimeController } from '../GetAverageExecutionTimeController';
import { IExecutionService } from '../../../application/ExecutionService';
import { HttpRequest } from '../../../../../shared/http/Controller';

function mockService(): jest.Mocked<IExecutionService> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findByServiceOrderId: jest.fn(),
    start: jest.fn(),
    finish: jest.fn(),
    deliver: jest.fn(),
    getExecutionTime: jest.fn(),
    getAverageExecutionTime: jest.fn(),
  };
}

function makeReq(overrides: Partial<HttpRequest> = {}): HttpRequest {
  return { body: {}, params: {}, query: {}, headers: {}, user: {}, ...overrides };
}

describe('GetExecutionController', () => {
  it('should return 200 with execution', async () => {
    const service = mockService();
    service.findById.mockResolvedValue({ id: 1 } as any);
    const controller = new GetExecutionController(service);

    const res = await controller.handle(makeReq({ params: { id: '5' } }));

    expect(res.status).toBe(200);
    expect(service.findById).toHaveBeenCalledWith(5);
  });
});

describe('GetExecutionByOrderController', () => {
  it('should return 200 with execution by service order', async () => {
    const service = mockService();
    service.findByServiceOrderId.mockResolvedValue({ id: 1, serviceOrderId: 10 } as any);
    const controller = new GetExecutionByOrderController(service);

    const res = await controller.handle(makeReq({ params: { serviceOrderId: '10' } }));

    expect(res.status).toBe(200);
    expect(service.findByServiceOrderId).toHaveBeenCalledWith(10);
  });
});

describe('StartExecutionController', () => {
  it('should return 200 after starting execution', async () => {
    const service = mockService();
    service.start.mockResolvedValue({ id: 1, status: 'in_progress' } as any);
    const controller = new StartExecutionController(service);

    const res = await controller.handle(makeReq({ params: { id: '1' } }));

    expect(res.status).toBe(200);
    expect(service.start).toHaveBeenCalledWith(1);
  });
});

describe('FinishExecutionController', () => {
  it('should return 200 after finishing execution', async () => {
    const service = mockService();
    service.finish.mockResolvedValue({ id: 1, status: 'finished' } as any);
    const controller = new FinishExecutionController(service);

    const res = await controller.handle(makeReq({ params: { id: '1' } }));

    expect(res.status).toBe(200);
    expect(service.finish).toHaveBeenCalledWith(1);
  });
});

describe('DeliverExecutionController', () => {
  it('should return 200 after delivering execution', async () => {
    const service = mockService();
    service.deliver.mockResolvedValue({ id: 1, status: 'delivered' } as any);
    const controller = new DeliverExecutionController(service);

    const res = await controller.handle(makeReq({ params: { id: '1' } }));

    expect(res.status).toBe(200);
    expect(service.deliver).toHaveBeenCalledWith(1);
  });
});

describe('GetExecutionTimeController', () => {
  it('should return 200 with execution time', async () => {
    const service = mockService();
    service.getExecutionTime.mockResolvedValue({ executionId: 1, timeMs: 5000 });
    const controller = new GetExecutionTimeController(service);

    const res = await controller.handle(makeReq({ params: { id: '1' } }));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ executionId: 1, timeMs: 5000 });
  });
});

describe('GetAverageExecutionTimeController', () => {
  it('should return 200 with average time', async () => {
    const service = mockService();
    service.getAverageExecutionTime.mockResolvedValue({ averageMs: 3000, count: 5 });
    const controller = new GetAverageExecutionTimeController(service);

    const res = await controller.handle(makeReq());

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ averageMs: 3000, count: 5 });
  });
});
