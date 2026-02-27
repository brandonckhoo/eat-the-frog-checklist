import { supabase } from '../supabaseClient';
import type { Badge, BadgeType } from '../../types';

async function getUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) throw new Error('Not authenticated');
  return userId;
}

export const badgeRepository = {
  async getAll(): Promise<Badge[]> {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('user_badges')
      .select('type, unlocked_at')
      .eq('user_id', userId);
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.type,
      type: row.type as BadgeType,
      unlockedAt: row.unlocked_at ?? undefined,
    }));
  },

  async upsert(badge: Badge): Promise<void> {
    const userId = await getUserId();
    const { error } = await supabase.from('user_badges').upsert({
      user_id: userId,
      type: badge.type,
      unlocked_at: badge.unlockedAt ?? null,
    });
    if (error) throw error;
  },

  async ensureAllExist(types: BadgeType[]): Promise<void> {
    const userId = await getUserId();
    const existing = await badgeRepository.getAll();
    const existingTypes = new Set(existing.map((b) => b.type));
    const toInsert = types
      .filter((t) => !existingTypes.has(t))
      .map((t) => ({ user_id: userId, type: t, unlocked_at: null }));
    if (toInsert.length === 0) return;
    const { error } = await supabase.from('user_badges').insert(toInsert);
    if (error) throw error;
  },
};
