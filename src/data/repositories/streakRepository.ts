import { getDb } from '../db';
import type { Streak } from '../../types';

export const streakRepository = {
  async get(): Promise<Streak> {
    const db = await getDb();
    const row = await db.getFirstAsync<{
      current: number;
      best: number;
      last_completion_date: string | null;
    }>('SELECT current, best, last_completion_date FROM streak WHERE id=1');
    return {
      current: row?.current ?? 0,
      best: row?.best ?? 0,
      lastCompletionDate: row?.last_completion_date ?? undefined,
    };
  },

  async save(streak: Streak): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE streak SET current=?, best=?, last_completion_date=? WHERE id=1',
      [streak.current, streak.best, streak.lastCompletionDate ?? null]
    );
  },
};
