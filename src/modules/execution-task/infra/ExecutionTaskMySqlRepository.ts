import * as mysql from '../../../infra/db/mysql';
import { ExecutionTaskEntity, ExecutionTaskId, IExecutionTaskProps } from '../domain/ExecutionTask';
import { IExecutionTaskRepository } from '../domain/IExecutionTaskRepository';

export class ExecutionTaskMySqlRepository implements IExecutionTaskRepository {
  async create(task: ExecutionTaskEntity): Promise<ExecutionTaskEntity> {
    const data = task.toJSON();

    const sql = `INSERT INTO execution_tasks (executionId, description, status, assignedMechanicId, startedAt, completedAt, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      data.executionId,
      data.description,
      data.status,
      data.assignedMechanicId,
      data.startedAt,
      data.completedAt,
      data.createdAt,
      data.updatedAt,
    ];

    const result = await mysql.insertOne(sql, params);

    return ExecutionTaskEntity.restore({ ...data, id: result.insertId });
  }

  async findById(id: ExecutionTaskId): Promise<ExecutionTaskEntity | null> {
    const rows = await mysql.query<IExecutionTaskProps & import('mysql2/promise').RowDataPacket>(
      'SELECT * FROM execution_tasks WHERE id = ?',
      [id]
    );

    if (rows.length === 0) return null;

    return ExecutionTaskEntity.restore(rows[0]);
  }

  async findByExecutionId(executionId: number): Promise<ExecutionTaskEntity[]> {
    const rows = await mysql.query<IExecutionTaskProps & import('mysql2/promise').RowDataPacket>(
      'SELECT * FROM execution_tasks WHERE executionId = ? ORDER BY createdAt ASC',
      [executionId]
    );

    return rows.map((row) => ExecutionTaskEntity.restore(row));
  }

  async update(task: ExecutionTaskEntity): Promise<ExecutionTaskEntity> {
    const data = task.toJSON();

    const sql = `UPDATE execution_tasks SET
      description = ?, status = ?, assignedMechanicId = ?,
      startedAt = ?, completedAt = ?, updatedAt = ?
      WHERE id = ?`;

    const params = [
      data.description,
      data.status,
      data.assignedMechanicId,
      data.startedAt,
      data.completedAt,
      data.updatedAt,
      data.id,
    ];

    await mysql.update(sql, params);

    return task;
  }

  async delete(id: ExecutionTaskId): Promise<void> {
    await mysql.deleteByField('execution_tasks', 'id', id);
  }
}
