export type ExecutionTaskId = number;
export type ExecutionTaskStatus = 'pending' | 'in_progress' | 'done';

export interface IExecutionTaskProps {
  id: ExecutionTaskId;
  executionId: number;
  description: string;
  status: ExecutionTaskStatus;
  assignedMechanicId?: number | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ExecutionTaskEntity {
  private constructor(private props: IExecutionTaskProps) {}

  static create(input: {
    executionId: number;
    description: string;
    assignedMechanicId?: number;
  }): ExecutionTaskEntity {
    return new ExecutionTaskEntity({
      id: 0,
      executionId: input.executionId,
      description: input.description,
      status: 'pending',
      assignedMechanicId: input.assignedMechanicId ?? null,
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: IExecutionTaskProps): ExecutionTaskEntity {
    return new ExecutionTaskEntity(props);
  }

  get id(): ExecutionTaskId {
    return this.props.id;
  }

  get executionId(): number {
    return this.props.executionId;
  }

  get status(): ExecutionTaskStatus {
    return this.props.status;
  }

  startTask(): void {
    if (this.props.status !== 'pending') {
      throw new Error(`Cannot start task in status "${this.props.status}"`);
    }
    this.props.status = 'in_progress';
    this.props.startedAt = new Date();
    this.props.updatedAt = new Date();
  }

  completeTask(): void {
    if (this.props.status !== 'in_progress') {
      throw new Error(`Cannot complete task in status "${this.props.status}"`);
    }
    this.props.status = 'done';
    this.props.completedAt = new Date();
    this.props.updatedAt = new Date();
  }

  toJSON(): IExecutionTaskProps {
    return { ...this.props };
  }
}
