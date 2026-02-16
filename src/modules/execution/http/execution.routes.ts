import { Router } from 'express';
import { adaptExpress } from '../../../shared/http/Controller';
import { ExecutionMySqlRepository } from '../infra/ExecutionMySqlRepository';
import { ExecutionService } from '../application/ExecutionService';
import { SqsPublisher } from '../../../shared/messaging/SqsPublisher';
import { CreateExecutionController } from './controllers/CreateExecutionController';
import { GetExecutionController } from './controllers/GetExecutionController';
import { GetExecutionByOrderController } from './controllers/GetExecutionByOrderController';
import { StartExecutionController } from './controllers/StartExecutionController';
import { FinishExecutionController } from './controllers/FinishExecutionController';
import { DeliverExecutionController } from './controllers/DeliverExecutionController';
import { GetExecutionTimeController } from './controllers/GetExecutionTimeController';
import { GetAverageExecutionTimeController } from './controllers/GetAverageExecutionTimeController';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { requireRole } from '../../auth/RoleMiddleware';

const repository = new ExecutionMySqlRepository();
const sqsPublisher = new SqsPublisher();
const service = new ExecutionService(repository, sqsPublisher);

export const executionRouter = Router();

executionRouter.post('/', authMiddleware, requireRole('admin'), adaptExpress(new CreateExecutionController(service)));
executionRouter.get('/execution-time/average', authMiddleware, requireRole('admin'), adaptExpress(new GetAverageExecutionTimeController(service)));
executionRouter.get('/by-order/:serviceOrderId', authMiddleware, adaptExpress(new GetExecutionByOrderController(service)));
executionRouter.get('/:id', authMiddleware, adaptExpress(new GetExecutionController(service)));
executionRouter.post('/:id/start', authMiddleware, requireRole('admin', 'mechanic'), adaptExpress(new StartExecutionController(service)));
executionRouter.post('/:id/finish', authMiddleware, requireRole('admin', 'mechanic'), adaptExpress(new FinishExecutionController(service)));
executionRouter.post('/:id/deliver', authMiddleware, requireRole('admin'), adaptExpress(new DeliverExecutionController(service)));
executionRouter.get('/:id/execution-time', authMiddleware, adaptExpress(new GetExecutionTimeController(service)));
