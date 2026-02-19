import { CreateExecutionTaskController } from '../CreateExecutionTaskController';
import { GetExecutionTaskController } from '../GetExecutionTaskController';
import { ListExecutionTasksController } from '../ListExecutionTasksController';
import { StartExecutionTaskController } from '../StartExecutionTaskController';
import { CompleteExecutionTaskController } from '../CompleteExecutionTaskController';
import { UpdateExecutionTaskController } from '../UpdateExecutionTaskController';
import { DeleteExecutionTaskController } from '../DeleteExecutionTaskController';
import { IExecutionTaskService } from '../../../application/ExecutionTaskService';
import { HttpRequest } from '../../../../../shared/http/Controller';
import { ServerException } from '../../../../../shared/application/ServerException';

function mockService(): jest.Mocked<IExecutionTaskService> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findByExecutionId: jest.fn(),
    startTask: jest.fn(),
    completeTask: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

function makeReq(overrides: Partial<HttpRequest> = {}): HttpRequest {
  return { body: {}, params: {}, query: {}, headers: {}, user: {}, ...overrides };
}

describe('CreateExecutionTaskController', () => {
  it('should return 201 with created task', async () => {
    const service = mockService();
    service.create.mockResolvedValue({ id: 1, executionId: 10, description: 'task' } as any);
    const controller = new CreateExecutionTaskController(service);

    const body = { executionId: 10, description: 'task desc' };
    const res = await controller.handle(makeReq({ body }));

    expect(res.status).toBe(201);
    expect(service.create).toHaveBeenCalledWith(body);
  });

  it('should throw on invalid body', async () => {
    const service = mockService();
    const controller = new CreateExecutionTaskController(service);

    const req = makeReq({ body: { executionId: 'not-a-number' } });

    await expect(controller.handle(req)).rejects.toThrow(ServerException);
  });

  it('should throw when description is too short', async () => {
    const service = mockService();
    const controller = new CreateExecutionTaskController(service);

    const req = makeReq({ body: { executionId: 1, description: 'ab' } });

    await expect(controller.handle(req)).rejects.toThrow(ServerException);
  });
});

describe('GetExecutionTaskController', () => {
  it('should return 200 with task', async () => {
    const service = mockService();
    service.findById.mockResolvedValue({ id: 5 } as any);
    const controller = new GetExecutionTaskController(service);

    const res = await controller.handle(makeReq({ params: { id: '5' } }));

    expect(res.status).toBe(200);
    expect(service.findById).toHaveBeenCalledWith(5);
  });
});

describe('ListExecutionTasksController', () => {
  it('should return 200 with list of tasks', async () => {
    const service = mockService();
    service.findByExecutionId.mockResolvedValue([{ id: 1 }, { id: 2 }] as any);
    const controller = new ListExecutionTasksController(service);

    const res = await controller.handle(makeReq({ params: { executionId: '10' } }));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(service.findByExecutionId).toHaveBeenCalledWith(10);
  });
});

describe('StartExecutionTaskController', () => {
  it('should return 200 after starting task', async () => {
    const service = mockService();
    service.startTask.mockResolvedValue({ id: 1, status: 'in_progress' } as any);
    const controller = new StartExecutionTaskController(service);

    const res = await controller.handle(makeReq({ params: { id: '1' } }));

    expect(res.status).toBe(200);
    expect(service.startTask).toHaveBeenCalledWith(1);
  });
});

describe('CompleteExecutionTaskController', () => {
  it('should return 200 after completing task', async () => {
    const service = mockService();
    service.completeTask.mockResolvedValue({ id: 1, status: 'done' } as any);
    const controller = new CompleteExecutionTaskController(service);

    const res = await controller.handle(makeReq({ params: { id: '1' } }));

    expect(res.status).toBe(200);
    expect(service.completeTask).toHaveBeenCalledWith(1);
  });
});

describe('UpdateExecutionTaskController', () => {
  it('should return 200 after updating task', async () => {
    const service = mockService();
    service.update.mockResolvedValue({ id: 1, description: 'updated' } as any);
    const controller = new UpdateExecutionTaskController(service);

    const body = { description: 'updated desc' };
    const res = await controller.handle(makeReq({ params: { id: '1' }, body }));

    expect(res.status).toBe(200);
    expect(service.update).toHaveBeenCalledWith(1, body);
  });

  it('should throw on invalid body (description too short)', async () => {
    const service = mockService();
    const controller = new UpdateExecutionTaskController(service);

    const req = makeReq({ params: { id: '1' }, body: { description: 'ab' } });

    await expect(controller.handle(req)).rejects.toThrow(ServerException);
  });
});

describe('DeleteExecutionTaskController', () => {
  it('should return 204 after deleting task', async () => {
    const service = mockService();
    service.delete.mockResolvedValue(undefined);
    const controller = new DeleteExecutionTaskController(service);

    const res = await controller.handle(makeReq({ params: { id: '1' } }));

    expect(res.status).toBe(204);
    expect(service.delete).toHaveBeenCalledWith(1);
  });
});
