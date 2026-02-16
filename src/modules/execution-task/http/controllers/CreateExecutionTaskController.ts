import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { IExecutionTaskService } from '../../application/ExecutionTaskService';
import { createTaskSchema } from './schemas';

export class CreateExecutionTaskController implements IController {
  constructor(private readonly service: IExecutionTaskService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createTaskSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const result = await this.service.create(parsed.data);

    return {
      status: 201,
      body: result,
    };
  }
}
