import { ExecutionTaskEntity, ExecutionTaskId } from './ExecutionTask';

export interface IExecutionTaskRepository {
  create(task: ExecutionTaskEntity): Promise<ExecutionTaskEntity>;
  findById(id: ExecutionTaskId): Promise<ExecutionTaskEntity | null>;
  findByExecutionId(executionId: number): Promise<ExecutionTaskEntity[]>;
  update(task: ExecutionTaskEntity): Promise<ExecutionTaskEntity>;
  delete(id: ExecutionTaskId): Promise<void>;
}
