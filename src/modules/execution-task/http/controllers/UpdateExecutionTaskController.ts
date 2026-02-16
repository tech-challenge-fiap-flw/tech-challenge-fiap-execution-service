import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { IExecutionTaskService } from '../../application/ExecutionTaskService';
import { updateTaskSchema } from './schemas';

export class UpdateExecutionTaskController implements IController {
  constructor(private readonly service: IExecutionTaskService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);

    const parsed = updateTaskSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const result = await this.service.update(id, parsed.data);

    return {
      status: 200,
      body: result,
    };
  }
}
