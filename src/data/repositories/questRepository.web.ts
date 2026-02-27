import { supabase } from '../supabaseClient';
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

async function getUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) throw new Error('Not authenticated');
  return userId;
}

export const questRepository = {
  async getCurrentWeek(startDate: string): Promise<Quest[]> {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('user_quests')
      .select('*')
      .eq('user_id', userId)
      .eq('start_date', startDate);
    if (error) throw error;
    return (data ?? []).map(rowToQuest);
  },

  async create(quest: Quest): Promise<void> {
    const userId = await getUserId();
    const { error } = await supabase.from('user_quests').insert({
      id: quest.id,
      user_id: userId,
      type: quest.type,
      target: quest.target,
      progress: quest.progress,
      start_date: quest.startDate,
      end_date: quest.endDate,
      reward_xp: quest.rewardXp,
      completed_at: quest.completedAt ?? null,
    });
    if (error) throw error;
  },

  async update(quest: Quest): Promise<void> {
    const { error } = await supabase
      .from('user_quests')
      .update({
        progress: quest.progress,
        completed_at: quest.completedAt ?? null,
      })
      .eq('id', quest.id);
    if (error) throw error;
  },
};
