import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { IExecutionTaskService } from '../../application/ExecutionTaskService';

export class ListExecutionTasksController implements IController {
  constructor(private readonly service: IExecutionTaskService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const executionId = Number(req.params.executionId);

    const result = await this.service.findByExecutionId(executionId);

    return {
      status: 200,
      body: result,
    };
  }
}
