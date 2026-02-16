import { runInTransaction } from '../../infra/db/mysql';

export interface IBaseRepository {
  transaction<T>(fn: () => Promise<T>): Promise<T>;
}

export class BaseRepository implements IBaseRepository {
  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    return runInTransaction(fn);
  }
}
