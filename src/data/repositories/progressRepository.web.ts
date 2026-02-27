import { supabase } from '../supabaseClient';
import type { UserProgress } from '../../types';

async function getUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) throw new Error('Not authenticated');
  return userId;
}

export const progressRepository = {
  async get(): Promise<UserProgress> {
    const userId = await getUserId();
    const { data } = await supabase
      .from('user_progress')
      .select('xp, level')
      .eq('user_id', userId)
      .single();
    return { xp: data?.xp ?? 0, level: data?.level ?? 1 };
  },

  async save(progress: UserProgress): Promise<void> {
    const userId = await getUserId();
    const { error } = await supabase.from('user_progress').upsert({
      user_id: userId,
      xp: progress.xp,
      level: progress.level,
    });
    if (error) throw error;
  },
};
