import {
  generateWeeklyQuests,
  updateQuestProgress,
  getQuestLabel,
  getMondayString,
} from '../src/domain/quests';
import type { Quest, Task } from '../src/types';

function makeQuest(type: Quest['type'], progress = 0, target = 5): Quest {
  return {
    id: `${type}_test`,
    type,
    target,
    progress,
    startDate: '2026-01-06',
    endDate: '2026-01-12',
    rewardXp: 50,
  };
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task_1',
    title: 'Test task',
    column: 'do_first',
    createdAt: Date.now(),
    difficulty: 1,
    ...overrides,
  };
}

describe('generateWeeklyQuests', () => {
  it('generates exactly 4 quests', () => {
    const quests = generateWeeklyQuests(new Date('2026-01-06'));
    expect(quests).toHaveLength(4);
  });

  it('all quests have the same startDate (Monday)', () => {
    const quests = generateWeeklyQuests(new Date('2026-01-07'));
    const dates = quests.map((q) => q.startDate);
    const unique = new Set(dates);
    expect(unique.size).toBe(1);
    expect(dates[0]).toBe('2026-01-05');
  });

  it('all quests start with progress 0', () => {
    const quests = generateWeeklyQuests();
    quests.forEach((q) => expect(q.progress).toBe(0));
  });
});

describe('updateQuestProgress', () => {
  it('increments complete_tasks on any task', () => {
    const quest = makeQuest('complete_tasks', 0, 5);
    const updated = updateQuestProgress(quest, makeTask(), 0);
    expect(updated.progress).toBe(1);
    expect(updated.completedAt).toBeUndefined();
  });

  it('marks complete_tasks as done at target', () => {
    const quest = makeQuest('complete_tasks', 4, 5);
    const updated = updateQuestProgress(quest, makeTask(), 0);
    expect(updated.progress).toBe(5);
    expect(updated.completedAt).toBeDefined();
  });

  it('only counts do_first tasks for complete_do_first', () => {
    const quest = makeQuest('complete_do_first', 0, 3);
    const laterTask = makeTask({ column: 'do_later' });
    const notUpdated = updateQuestProgress(quest, laterTask, 0);
    expect(notUpdated.progress).toBe(0);

    const firstTask = makeTask({ column: 'do_first' });
    const updated = updateQuestProgress(quest, firstTask, 0);
    expect(updated.progress).toBe(1);
  });

  it('only counts difficulty 3 for complete_hard', () => {
    const quest = makeQuest('complete_hard', 0, 1);
    const easyTask = makeTask({ difficulty: 1 });
    expect(updateQuestProgress(quest, easyTask, 0).progress).toBe(0);

    const hardTask = makeTask({ difficulty: 3 });
    expect(updateQuestProgress(quest, hardTask, 0).progress).toBe(1);
  });

  it('sets maintain_streak progress to current streak value', () => {
    const quest = makeQuest('maintain_streak', 0, 3);
    const updated = updateQuestProgress(quest, makeTask(), 2);
    expect(updated.progress).toBe(2);
    expect(updated.completedAt).toBeUndefined();

    const completed = updateQuestProgress(quest, makeTask(), 3);
    expect(completed.completedAt).toBeDefined();
  });

  it('does not update an already completed quest', () => {
    const quest: Quest = { ...makeQuest('complete_tasks', 5, 5), completedAt: Date.now() };
    const updated = updateQuestProgress(quest, makeTask(), 0);
    expect(updated.progress).toBe(5);
  });
});

describe('getQuestLabel', () => {
  it('returns a non-empty string for all quest types', () => {
    const types: Quest['type'][] = [
      'complete_tasks',
      'complete_do_first',
      'complete_hard',
      'maintain_streak',
    ];
    types.forEach((type) => {
      expect(getQuestLabel(type).length).toBeGreaterThan(0);
    });
  });
});
