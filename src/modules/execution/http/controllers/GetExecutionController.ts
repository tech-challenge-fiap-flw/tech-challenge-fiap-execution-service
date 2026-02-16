import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { IExecutionService } from '../../application/ExecutionService';

export class GetExecutionController implements IController {
  constructor(private readonly service: IExecutionService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);

    const result = await this.service.findById(id);

    return {
      status: 200,
      body: result,
    };
  }
}
