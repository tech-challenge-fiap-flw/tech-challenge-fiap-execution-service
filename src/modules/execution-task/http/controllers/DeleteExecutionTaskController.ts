import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { IExecutionTaskService } from '../../application/ExecutionTaskService';

export class DeleteExecutionTaskController implements IController {
  constructor(private readonly service: IExecutionTaskService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);

    await this.service.delete(id);

    return {
      status: 204,
    };
  }
}
