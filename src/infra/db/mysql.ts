import mysql, { Pool, PoolOptions, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { AsyncLocalStorage } from 'async_hooks';

const asyncLocalStorage = new AsyncLocalStorage<mysql.PoolConnection>();

const poolOptions: PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'execution_db',
  waitForConnections: true,
  connectionLimit: 10,
};

const pool: Pool = mysql.createPool(poolOptions);

export async function query<T extends RowDataPacket>(sql: string, params?: any[]): Promise<T[]> {
  const conn = asyncLocalStorage.getStore();
  if (conn) {
    const [rows] = await conn.query<T[] & RowDataPacket[]>(sql, params);
    return rows;
  }
  const [rows] = await pool.query<T[] & RowDataPacket[]>(sql, params);
  return rows;
}

export async function insertOne(sql: string, params?: any[]): Promise<ResultSetHeader> {
  const conn = asyncLocalStorage.getStore();
  if (conn) {
    const [result] = await conn.query<ResultSetHeader>(sql, params);
    return result;
  }
  const [result] = await pool.query<ResultSetHeader>(sql, params);
  return result;
}

export async function update(sql: string, params?: any[]): Promise<ResultSetHeader> {
  const conn = asyncLocalStorage.getStore();
  if (conn) {
    const [result] = await conn.query<ResultSetHeader>(sql, params);
    return result;
  }
  const [result] = await pool.query<ResultSetHeader>(sql, params);
  return result;
}

export async function deleteByField(table: string, field: string, value: any): Promise<void> {
  const conn = asyncLocalStorage.getStore();
  const sql = `DELETE FROM ${table} WHERE ${field} = ?`;
  if (conn) {
    await conn.query(sql, [value]);
  } else {
    await pool.query(sql, [value]);
  }
}

export async function runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const result = await asyncLocalStorage.run(conn, fn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
