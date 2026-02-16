import { ExecutionEntity, ExecutionId } from './Execution';

export interface IExecutionRepository {
  create(execution: ExecutionEntity): Promise<ExecutionEntity>;
  findById(id: ExecutionId): Promise<ExecutionEntity | null>;
  findByServiceOrderId(serviceOrderId: number): Promise<ExecutionEntity | null>;
  update(execution: ExecutionEntity): Promise<ExecutionEntity>;
  findAll(): Promise<ExecutionEntity[]>;
  findAllFinished(): Promise<ExecutionEntity[]>;
}
