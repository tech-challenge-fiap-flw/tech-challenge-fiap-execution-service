export type ExecutionId = number;
export type ExecutionStatus = 'waiting' | 'in_progress' | 'finished' | 'delivered';

export interface IExecutionProps {
  id: ExecutionId;
  serviceOrderId: number;
  mechanicId: number;
  status: ExecutionStatus;
  notes?: string | null;
  startedAt?: Date | null;
  finishedAt?: Date | null;
  deliveredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ExecutionEntity {
  private constructor(private props: IExecutionProps) {}

  static create(input: {
    serviceOrderId: number;
    mechanicId: number;
    notes?: string;
  }): ExecutionEntity {
    return new ExecutionEntity({
      id: 0,
      serviceOrderId: input.serviceOrderId,
      mechanicId: input.mechanicId,
      status: 'waiting',
      notes: input.notes ?? null,
      startedAt: null,
      finishedAt: null,
      deliveredAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: IExecutionProps): ExecutionEntity {
    return new ExecutionEntity(props);
  }

  get id(): ExecutionId {
    return this.props.id;
  }

  get serviceOrderId(): number {
    return this.props.serviceOrderId;
  }

  get mechanicId(): number {
    return this.props.mechanicId;
  }

  get status(): ExecutionStatus {
    return this.props.status;
  }

  start(): void {
    if (this.props.status !== 'waiting') {
      throw new Error(`Cannot start execution in status "${this.props.status}"`);
    }
    this.props.status = 'in_progress';
    this.props.startedAt = new Date();
    this.props.updatedAt = new Date();
  }

  finish(): void {
    if (this.props.status !== 'in_progress') {
      throw new Error(`Cannot finish execution in status "${this.props.status}"`);
    }
    this.props.status = 'finished';
    this.props.finishedAt = new Date();
    this.props.updatedAt = new Date();
  }

  deliver(): void {
    if (this.props.status !== 'finished') {
      throw new Error(`Cannot deliver execution in status "${this.props.status}"`);
    }
    this.props.status = 'delivered';
    this.props.deliveredAt = new Date();
    this.props.updatedAt = new Date();
  }

  getExecutionTimeMs(): number | null {
    if (!this.props.startedAt || !this.props.finishedAt) {
      return null;
    }
    return this.props.finishedAt.getTime() - this.props.startedAt.getTime();
  }

  toJSON(): IExecutionProps {
    return { ...this.props };
  }
}
