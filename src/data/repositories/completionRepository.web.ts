import { supabase } from '../supabaseClient';
import type { CompletionEvent } from '../../types';

async function getUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) throw new Error('Not authenticated');
  return userId;
}

export const completionRepository = {
  async create(event: CompletionEvent): Promise<void> {
    const userId = await getUserId();
    const { error } = await supabase.from('completion_events').insert({
      id: event.id,
      user_id: userId,
      task_id: event.taskId,
      timestamp: event.timestamp,
      xp_awarded: event.xpAwarded,
    });
    if (error) throw error;
  },

  async getAll(): Promise<CompletionEvent[]> {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('completion_events')
      .select('id, task_id, timestamp, xp_awarded')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      taskId: row.task_id,
      timestamp: row.timestamp,
      xpAwarded: row.xp_awarded,
    }));
  },
};
