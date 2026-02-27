import { supabase } from '../supabaseClient';
import type { Task, Column } from '../../types';

function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    notes: (row.notes as string | null) ?? undefined,
    column: row.task_column as Column,
    createdAt: row.created_at as number,
    dueAt: (row.due_at as number | null) ?? undefined,
    completedAt: (row.completed_at as number | null) ?? undefined,
    difficulty: row.difficulty as 1 | 2 | 3,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
  };
}

async function getUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) throw new Error('Not authenticated');
  return userId;
}

export const taskRepository = {
  async getActive(): Promise<Task[]> {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .is('completed_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToTask);
  },

  async create(task: Task): Promise<void> {
    const userId = await getUserId();
    const { error } = await supabase.from('tasks').insert({
      id: task.id,
      user_id: userId,
      title: task.title,
      notes: task.notes ?? null,
      task_column: task.column,
      created_at: task.createdAt,
      due_at: task.dueAt ?? null,
      completed_at: task.completedAt ?? null,
      difficulty: task.difficulty,
      tags: task.tags ?? [],
    });
    if (error) throw error;
  },

  async update(task: Task): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({
        title: task.title,
        notes: task.notes ?? null,
        task_column: task.column,
        due_at: task.dueAt ?? null,
        completed_at: task.completedAt ?? null,
        difficulty: task.difficulty,
        tags: task.tags ?? [],
      })
      .eq('id', task.id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },

  async getCompleted(limit = 30): Promise<Task[]> {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(rowToTask);
  },

  async countCompleted(): Promise<number> {
    const userId = await getUserId();
    const { count, error } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('completed_at', 'is', null);
    if (error) throw error;
    return count ?? 0;
  },
};
