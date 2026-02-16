import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { IExecutionService } from '../../application/ExecutionService';

export class GetExecutionByOrderController implements IController {
  constructor(private readonly service: IExecutionService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const serviceOrderId = Number(req.params.serviceOrderId);

    const result = await this.service.findByServiceOrderId(serviceOrderId);

    return {
      status: 200,
      body: result,
    };
  }
}
