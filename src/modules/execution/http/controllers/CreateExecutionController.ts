import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { IExecutionService } from '../../application/ExecutionService';
import { createExecutionSchema } from './schemas';

export class CreateExecutionController implements IController {
  constructor(private readonly service: IExecutionService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createExecutionSchema.safeParse(req.body);

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
