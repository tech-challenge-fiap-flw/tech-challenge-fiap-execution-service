import { Router } from 'express';
import { adaptExpress } from '../../../shared/http/Controller';
import { ExecutionTaskMySqlRepository } from '../infra/ExecutionTaskMySqlRepository';
import { ExecutionTaskService } from '../application/ExecutionTaskService';
import { CreateExecutionTaskController } from './controllers/CreateExecutionTaskController';
import { GetExecutionTaskController } from './controllers/GetExecutionTaskController';
import { ListExecutionTasksController } from './controllers/ListExecutionTasksController';
import { StartExecutionTaskController } from './controllers/StartExecutionTaskController';
import { CompleteExecutionTaskController } from './controllers/CompleteExecutionTaskController';
import { UpdateExecutionTaskController } from './controllers/UpdateExecutionTaskController';
import { DeleteExecutionTaskController } from './controllers/DeleteExecutionTaskController';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { requireRole } from '../../auth/RoleMiddleware';

const repository = new ExecutionTaskMySqlRepository();
const service = new ExecutionTaskService(repository);

export const executionTaskRouter = Router();

executionTaskRouter.post('/', authMiddleware, requireRole('admin', 'mechanic'), adaptExpress(new CreateExecutionTaskController(service)));
executionTaskRouter.get('/execution/:executionId', authMiddleware, adaptExpress(new ListExecutionTasksController(service)));
executionTaskRouter.get('/:id', authMiddleware, adaptExpress(new GetExecutionTaskController(service)));
executionTaskRouter.put('/:id', authMiddleware, requireRole('admin', 'mechanic'), adaptExpress(new UpdateExecutionTaskController(service)));
executionTaskRouter.delete('/:id', authMiddleware, requireRole('admin'), adaptExpress(new DeleteExecutionTaskController(service)));
executionTaskRouter.post('/:id/start', authMiddleware, requireRole('admin', 'mechanic'), adaptExpress(new StartExecutionTaskController(service)));
executionTaskRouter.post('/:id/complete', authMiddleware, requireRole('admin', 'mechanic'), adaptExpress(new CompleteExecutionTaskController(service)));
