import { getDb } from '../db';
import type { Task, Column } from '../../types';

function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    notes: (row.notes as string | null) ?? undefined,
    column: row.column_name as Column,
    createdAt: row.created_at as number,
    dueAt: (row.due_at as number | null) ?? undefined,
    completedAt: (row.completed_at as number | null) ?? undefined,
    difficulty: row.difficulty as 1 | 2 | 3,
    tags: row.tags ? (row.tags as string).split(',').filter(Boolean) : [],
  };
}

export const taskRepository = {
  async getActive(): Promise<Task[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM tasks WHERE completed_at IS NULL ORDER BY created_at DESC'
    );
    return rows.map(rowToTask);
  },

  async create(task: Task): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO tasks
        (id, title, notes, column_name, created_at, due_at, completed_at, difficulty, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.title,
        task.notes ?? null,
        task.column,
        task.createdAt,
        task.dueAt ?? null,
        task.completedAt ?? null,
        task.difficulty,
        task.tags?.join(',') ?? null,
      ]
    );
  },

  async update(task: Task): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `UPDATE tasks
       SET title=?, notes=?, column_name=?, due_at=?, completed_at=?, difficulty=?, tags=?
       WHERE id=?`,
      [
        task.title,
        task.notes ?? null,
        task.column,
        task.dueAt ?? null,
        task.completedAt ?? null,
        task.difficulty,
        task.tags?.join(',') ?? null,
        task.id,
      ]
    );
  },

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM tasks WHERE id=?', [id]);
  },

  async getCompleted(limit = 30): Promise<Task[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM tasks WHERE completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT ?',
      [limit]
    );
    return rows.map(rowToTask);
  },

  async countCompleted(): Promise<number> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM tasks WHERE completed_at IS NOT NULL'
    );
    return row?.count ?? 0;
  },

  async reorderBatch(_updates: { id: string; sortOrder: number }[]): Promise<void> {
    // sort_order not yet implemented for native SQLite
  },
};
