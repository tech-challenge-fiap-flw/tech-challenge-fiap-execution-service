import { CreateExecutionController } from '../CreateExecutionController';
import { IExecutionService } from '../../../application/ExecutionService';
import { HttpRequest } from '../../../../../shared/http/Controller';
import { ServerException } from '../../../../../shared/application/ServerException';

describe('CreateExecutionController', () => {
  let controller: CreateExecutionController;
  let service: jest.Mocked<IExecutionService>;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findById: jest.fn(),
      findByServiceOrderId: jest.fn(),
      start: jest.fn(),
      finish: jest.fn(),
      deliver: jest.fn(),
      getExecutionTime: jest.fn(),
      getAverageExecutionTime: jest.fn(),
    };
    controller = new CreateExecutionController(service);
  });

  it('should return 201 with created execution', async () => {
    const body = { serviceOrderId: 1, mechanicId: 2, notes: 'test' };
    service.create.mockResolvedValue({ id: 1, ...body } as any);

    const req: HttpRequest = { body, params: {}, query: {}, headers: {}, user: {} };
    const res = await controller.handle(req);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(expect.objectContaining({ serviceOrderId: 1 }));
    expect(service.create).toHaveBeenCalledWith(body);
  });

  it('should throw on invalid body', async () => {
    const req: HttpRequest = { body: { serviceOrderId: 'bad' }, params: {}, query: {}, headers: {}, user: {} };

    await expect(controller.handle(req)).rejects.toThrow(ServerException);
  });

  it('should throw on missing required fields', async () => {
    const req: HttpRequest = { body: {}, params: {}, query: {}, headers: {}, user: {} };

    await expect(controller.handle(req)).rejects.toThrow(ServerException);
  });
});
