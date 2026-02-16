import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { IExecutionTaskService } from '../../application/ExecutionTaskService';

export class CompleteExecutionTaskController implements IController {
  constructor(private readonly service: IExecutionTaskService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);

    const result = await this.service.completeTask(id);

    return {
      status: 200,
      body: result,
    };
  }
}
