import { supabase } from '../supabaseClient';
import type { Streak } from '../../types';

async function getUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) throw new Error('Not authenticated');
  return userId;
}

export const streakRepository = {
  async get(): Promise<Streak> {
    const userId = await getUserId();
    const { data } = await supabase
      .from('user_streaks')
      .select('current, best, last_completion_date')
      .eq('user_id', userId)
      .single();
    return {
      current: data?.current ?? 0,
      best: data?.best ?? 0,
      lastCompletionDate: data?.last_completion_date ?? undefined,
    };
  },

  async save(streak: Streak): Promise<void> {
    const userId = await getUserId();
    const { error } = await supabase.from('user_streaks').upsert({
      user_id: userId,
      current: streak.current,
      best: streak.best,
      last_completion_date: streak.lastCompletionDate ?? null,
    });
    if (error) throw error;
  },
};
