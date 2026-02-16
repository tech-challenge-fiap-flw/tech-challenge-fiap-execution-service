import * as mysql from '../../infra/db/mysql';
import { logger } from '../../utils/logger';

export class IdempotencyStore {
  async isProcessed(eventId: string): Promise<boolean> {
    const rows = await mysql.query(
      'SELECT eventId FROM idempotency_keys WHERE eventId = ?',
      [eventId]
    );
    return rows.length > 0;
  }

  async markProcessed(eventId: string): Promise<void> {
    try {
      await mysql.insertOne(
        'INSERT INTO idempotency_keys (eventId) VALUES (?)',
        [eventId]
      );
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        logger.warn(`Event ${eventId} already processed (duplicate)`);
        return;
      }
      throw error;
    }
  }
}
