import { create } from 'zustand';
import type { UserProgress, Streak, Quest, Badge, BadgeType, Task } from '../types';
import { progressRepository } from '../data/repositories/progressRepository';
import { streakRepository } from '../data/repositories/streakRepository';
import { questRepository } from '../data/repositories/questRepository';
import { badgeRepository } from '../data/repositories/badgeRepository';
import { completionRepository } from '../data/repositories/completionRepository';
import { xpForDifficulty, applyXp, didLevelUp } from '../domain/gamification';
import { computeStreak } from '../domain/streaks';
import { checkNewBadges, ALL_BADGE_DEFINITIONS } from '../domain/badges';
import { generateWeeklyQuests, updateQuestProgress, getMondayString } from '../domain/quests';
import { taskRepository } from '../data/repositories/taskRepository';

export interface CompletionResult {
  xpAwarded: number;
  leveledUp: boolean;
  newLevel?: number;
  newBadges: BadgeType[];
  completedQuests: Quest[];
}

interface ProgressState {
  progress: UserProgress;
  streak: Streak;
  quests: Quest[];
  badges: Badge[];
  isLoaded: boolean;
  load: () => Promise<void>;
  recordCompletion: (task: Task) => Promise<CompletionResult>;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: { xp: 0, level: 1 },
  streak: { current: 0, best: 0 },
  quests: [],
  badges: [],
  isLoaded: false,

  load: async () => {
    const [progress, streak] = await Promise.all([
      progressRepository.get(),
      streakRepository.get(),
    ]);

    const allBadgeTypes = ALL_BADGE_DEFINITIONS.map((b) => b.type);
    await badgeRepository.ensureAllExist(allBadgeTypes);
    const badges = await badgeRepository.getAll();

    const monday = getMondayString();
    let quests = await questRepository.getCurrentWeek(monday);
    if (quests.length === 0) {
      const templates = generateWeeklyQuests();
      quests = templates.map((q) => ({ ...q, id: `${q.type}_${monday}` }));
      for (const quest of quests) {
        await questRepository.create(quest);
      }
    }

    set({ progress, streak, quests, badges, isLoaded: true });
  },

  recordCompletion: async (task: Task): Promise<CompletionResult> => {
    const { progress, streak, quests, badges } = get();
    const xpAwarded = xpForDifficulty(task.difficulty);
    const now = Date.now();

    await completionRepository.create({
      id: `${task.id}_${now}`,
      taskId: task.id,
      timestamp: now,
      xpAwarded,
    });

    const newProgress = applyXp(progress, xpAwarded);
    const leveledUp = didLevelUp(progress, newProgress);
    await progressRepository.save(newProgress);

    const newStreak = computeStreak(streak, now);
    await streakRepository.save(newStreak);

    const updatedQuests = quests.map((q) =>
      updateQuestProgress(q, task, newStreak.current)
    );
    const completedQuestNow = updatedQuests.filter(
      (q, i) => q.completedAt != null && quests[i].completedAt == null
    );
    for (const quest of updatedQuests) {
      await questRepository.update(quest);
    }

    let questBonusXp = 0;
    for (const q of completedQuestNow) {
      questBonusXp += q.rewardXp;
    }
    const finalProgress = questBonusXp > 0
      ? applyXp(newProgress, questBonusXp)
      : newProgress;
    if (questBonusXp > 0) {
      await progressRepository.save(finalProgress);
    }

    const totalCompletions = await taskRepository.countCompleted();
    const newBadgeTypes = checkNewBadges({
      totalCompletions,
      streak: newStreak,
      existingBadges: badges,
    });

    const updatedBadges = badges.map((b) =>
      newBadgeTypes.includes(b.type as BadgeType)
        ? { ...b, unlockedAt: now }
        : b
    );
    for (const type of newBadgeTypes) {
      const badge = updatedBadges.find((b) => b.type === type);
      if (badge) await badgeRepository.upsert(badge);
    }

    set({
      progress: finalProgress,
      streak: newStreak,
      quests: updatedQuests,
      badges: updatedBadges,
    });

    return {
      xpAwarded,
      leveledUp,
      newLevel: leveledUp ? finalProgress.level : undefined,
      newBadges: newBadgeTypes as BadgeType[],
      completedQuests: completedQuestNow,
    };
  },
}));
