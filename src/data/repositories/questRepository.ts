import { getDb } from '../db';
import type { Quest } from '../../types';

function rowToQuest(row: Record<string, unknown>): Quest {
  return {
    id: row.id as string,
    type: row.type as Quest['type'],
    target: row.target as number,
    progress: row.progress as number,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    rewardXp: row.reward_xp as number,
    completedAt: (row.completed_at as number | null) ?? undefined,
  };
}

export const questRepository = {
  async getCurrentWeek(startDate: string): Promise<Quest[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM quests WHERE start_date=?',
      [startDate]
    );
    return rows.map(rowToQuest);
  },

  async create(quest: Quest): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO quests
        (id, type, target, progress, start_date, end_date, reward_xp, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quest.id,
        quest.type,
        quest.target,
        quest.progress,
        quest.startDate,
        quest.endDate,
        quest.rewardXp,
        quest.completedAt ?? null,
      ]
    );
  },

  async update(quest: Quest): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE quests SET progress=?, completed_at=? WHERE id=?',
      [quest.progress, quest.completedAt ?? null, quest.id]
    );
  },
};
