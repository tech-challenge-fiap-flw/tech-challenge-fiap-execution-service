import * as mysql from '../../../infra/db/mysql';
import { ExecutionEntity, ExecutionId, IExecutionProps } from '../domain/Execution';
import { IExecutionRepository } from '../domain/IExecutionRepository';

export class ExecutionMySqlRepository implements IExecutionRepository {
  async create(execution: ExecutionEntity): Promise<ExecutionEntity> {
    const data = execution.toJSON();

    const sql = `INSERT INTO executions (serviceOrderId, mechanicId, status, notes, startedAt, finishedAt, deliveredAt, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      data.serviceOrderId,
      data.mechanicId,
      data.status,
      data.notes,
      data.startedAt,
      data.finishedAt,
      data.deliveredAt,
      data.createdAt,
      data.updatedAt,
    ];

    const result = await mysql.insertOne(sql, params);

    return ExecutionEntity.restore({ ...data, id: result.insertId });
  }

  async findById(id: ExecutionId): Promise<ExecutionEntity | null> {
    const rows = await mysql.query<IExecutionProps & import('mysql2/promise').RowDataPacket>(
      'SELECT * FROM executions WHERE id = ?',
      [id]
    );

    if (rows.length === 0) return null;

    return ExecutionEntity.restore(rows[0]);
  }

  async findByServiceOrderId(serviceOrderId: number): Promise<ExecutionEntity | null> {
    const rows = await mysql.query<IExecutionProps & import('mysql2/promise').RowDataPacket>(
      'SELECT * FROM executions WHERE serviceOrderId = ?',
      [serviceOrderId]
    );

    if (rows.length === 0) return null;

    return ExecutionEntity.restore(rows[0]);
  }

  async update(execution: ExecutionEntity): Promise<ExecutionEntity> {
    const data = execution.toJSON();

    const sql = `UPDATE executions SET
      mechanicId = ?, status = ?, notes = ?,
      startedAt = ?, finishedAt = ?, deliveredAt = ?, updatedAt = ?
      WHERE id = ?`;

    const params = [
      data.mechanicId,
      data.status,
      data.notes,
      data.startedAt,
      data.finishedAt,
      data.deliveredAt,
      data.updatedAt,
      data.id,
    ];

    await mysql.update(sql, params);

    return execution;
  }

  async findAll(): Promise<ExecutionEntity[]> {
    const rows = await mysql.query<IExecutionProps & import('mysql2/promise').RowDataPacket>(
      'SELECT * FROM executions ORDER BY createdAt DESC'
    );

    return rows.map((row) => ExecutionEntity.restore(row));
  }

  async findAllFinished(): Promise<ExecutionEntity[]> {
    const rows = await mysql.query<IExecutionProps & import('mysql2/promise').RowDataPacket>(
      "SELECT * FROM executions WHERE status IN ('finished', 'delivered') AND startedAt IS NOT NULL AND finishedAt IS NOT NULL"
    );

    return rows.map((row) => ExecutionEntity.restore(row));
  }
}
