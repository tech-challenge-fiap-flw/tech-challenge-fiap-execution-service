import { NotFoundServerException, BadRequestServerException } from '../../../shared/application/ServerException';
import { ExecutionTaskEntity } from '../domain/ExecutionTask';
import { IExecutionTaskRepository } from '../domain/IExecutionTaskRepository';
import { logger } from '../../../utils/logger';

export type CreateExecutionTaskInput = {
  executionId: number;
  description: string;
  assignedMechanicId?: number;
};

export type UpdateExecutionTaskInput = {
  description?: string;
  assignedMechanicId?: number;
};

export type ExecutionTaskOutput = ReturnType<ExecutionTaskEntity['toJSON']>;

export interface IExecutionTaskService {
  create(input: CreateExecutionTaskInput): Promise<ExecutionTaskOutput>;
  findById(id: number): Promise<ExecutionTaskOutput>;
  findByExecutionId(executionId: number): Promise<ExecutionTaskOutput[]>;
  startTask(id: number): Promise<ExecutionTaskOutput>;
  completeTask(id: number): Promise<ExecutionTaskOutput>;
  update(id: number, input: UpdateExecutionTaskInput): Promise<ExecutionTaskOutput>;
  delete(id: number): Promise<void>;
}

export class ExecutionTaskService implements IExecutionTaskService {
  constructor(private readonly repo: IExecutionTaskRepository) {}

  async create(input: CreateExecutionTaskInput): Promise<ExecutionTaskOutput> {
    const entity = ExecutionTaskEntity.create(input);
    const created = await this.repo.create(entity);

    logger.info(`Task created for execution ${input.executionId}`, { taskId: created.id });

    return created.toJSON();
  }

  async findById(id: number): Promise<ExecutionTaskOutput> {
    const found = await this.repo.findById(id);

    if (!found) {
      throw new NotFoundServerException('Execution task not found');
    }

    return found.toJSON();
  }

  async findByExecutionId(executionId: number): Promise<ExecutionTaskOutput[]> {
    const tasks = await this.repo.findByExecutionId(executionId);
    return tasks.map((t) => t.toJSON());
  }

  async startTask(id: number): Promise<ExecutionTaskOutput> {
    const task = await this.repo.findById(id);

    if (!task) {
      throw new NotFoundServerException('Execution task not found');
    }

    try {
      task.startTask();
    } catch (error: any) {
      throw new BadRequestServerException(error.message);
    }

    const updated = await this.repo.update(task);

    logger.info(`Task ${id} started`);

    return updated.toJSON();
  }

  async completeTask(id: number): Promise<ExecutionTaskOutput> {
    const task = await this.repo.findById(id);

    if (!task) {
      throw new NotFoundServerException('Execution task not found');
    }

    try {
      task.completeTask();
    } catch (error: any) {
      throw new BadRequestServerException(error.message);
    }

    const updated = await this.repo.update(task);

    logger.info(`Task ${id} completed`);

    return updated.toJSON();
  }

  async update(id: number, input: UpdateExecutionTaskInput): Promise<ExecutionTaskOutput> {
    const task = await this.repo.findById(id);

    if (!task) {
      throw new NotFoundServerException('Execution task not found');
    }

    const data = task.toJSON();
    const updatedEntity = ExecutionTaskEntity.restore({
      ...data,
      description: input.description ?? data.description,
      assignedMechanicId: input.assignedMechanicId ?? data.assignedMechanicId,
      updatedAt: new Date(),
    });

    const updated = await this.repo.update(updatedEntity);

    return updated.toJSON();
  }

  async delete(id: number): Promise<void> {
    const task = await this.repo.findById(id);

    if (!task) {
      throw new NotFoundServerException('Execution task not found');
    }

    await this.repo.delete(id);

    logger.info(`Task ${id} deleted`);
  }
}
