import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { IExecutionService } from '../../application/ExecutionService';

export class GetAverageExecutionTimeController implements IController {
  constructor(private readonly service: IExecutionService) {}

  async handle(_req: HttpRequest): Promise<HttpResponse> {
    const result = await this.service.getAverageExecutionTime();

    return {
      status: 200,
      body: result,
    };
  }
}
