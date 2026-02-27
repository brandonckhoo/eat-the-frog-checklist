import { getDb } from '../db';
import type { UserProgress } from '../../types';

export const progressRepository = {
  async get(): Promise<UserProgress> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ xp: number; level: number }>(
      'SELECT xp, level FROM user_progress WHERE id=1'
    );
    return { xp: row?.xp ?? 0, level: row?.level ?? 1 };
  },

  async save(progress: UserProgress): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE user_progress SET xp=?, level=? WHERE id=1',
      [progress.xp, progress.level]
    );
  },
};
