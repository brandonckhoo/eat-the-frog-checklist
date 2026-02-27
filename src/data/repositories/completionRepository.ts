import { getDb } from '../db';
import type { CompletionEvent } from '../../types';

export const completionRepository = {
  async create(event: CompletionEvent): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'INSERT INTO completion_events (id, task_id, timestamp, xp_awarded) VALUES (?, ?, ?, ?)',
      [event.id, event.taskId, event.timestamp, event.xpAwarded]
    );
  },

  async getAll(): Promise<CompletionEvent[]> {
    const db = await getDb();
    return db.getAllAsync<CompletionEvent>(
      `SELECT id, task_id as taskId, timestamp, xp_awarded as xpAwarded
       FROM completion_events ORDER BY timestamp DESC`
    );
  },
};
