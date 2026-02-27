import { getDb } from '../db';
import type { Badge, BadgeType } from '../../types';

export const badgeRepository = {
  async getAll(): Promise<Badge[]> {
    const db = await getDb();
    return db.getAllAsync<Badge>(
      'SELECT id, type, unlocked_at as unlockedAt FROM badges'
    );
  },

  async upsert(badge: Badge): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'INSERT OR REPLACE INTO badges (id, type, unlocked_at) VALUES (?, ?, ?)',
      [badge.id, badge.type, badge.unlockedAt ?? null]
    );
  },

  async ensureAllExist(types: BadgeType[]): Promise<void> {
    const db = await getDb();
    for (const type of types) {
      await db.runAsync(
        'INSERT OR IGNORE INTO badges (id, type, unlocked_at) VALUES (?, ?, NULL)',
        [type, type]
      );
    }
  },
};
