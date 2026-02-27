import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProgressStore } from '../../src/store/progressStore';
import { useTaskStore } from '../../src/store/taskStore';
import { computeXpProgress } from '../../src/domain/gamification';
import { isStreakActive } from '../../src/domain/streaks';
import { COLUMN_CONFIG } from '../../src/theme/tokens';
import { BadgeGrid } from '../../src/components/ui/BadgeGrid';
import { QuestCard } from '../../src/components/ui/QuestCard';
import { PipMascot } from '../../src/components/mascot/PipMascot';
import { colors, spacing, radius, typography } from '../../src/theme/tokens';

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { progress, streak, quests, badges } = useProgressStore();
  const { completedTasks, loadCompleted } = useTaskStore();

  useEffect(() => {
    loadCompleted();
  }, [loadCompleted]);
  const {
    level,
    xpIntoLevel,
    xpForNextLevel,
    progress: xpPct,
  } = computeXpProgress(progress.xp);
  const streakActive = isStreakActive(streak);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <PipMascot state={streakActive ? 'encouraging' : 'idle'} size={64} />
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>Level {level}</Text>
          <Text style={styles.heroSub}>{progress.xp} XP total</Text>
        </View>
      </View>

      {/* XP */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <Text style={styles.sectionMeta}>
            {xpIntoLevel}/{xpForNextLevel} to level {level + 1}
          </Text>
        </View>
        <View style={styles.xpBarWrap}>
          <View style={[styles.xpBarFill, { width: `${xpPct * 100}%` }]} />
        </View>
      </View>

      {/* Streak */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Streak</Text>
        <View style={styles.streakRow}>
          <View style={[styles.statCard, streakActive && styles.statCardActive]}>
            <Text style={styles.statValue}>{streak.current}</Text>
            <Text style={styles.statLabel}>Current</Text>
            <Text style={styles.statIcon}>{streakActive ? '🔥' : '💤'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streak.best}</Text>
            <Text style={styles.statLabel}>Best</Text>
            <Text style={styles.statIcon}>⚡</Text>
          </View>
        </View>
        {!streakActive && (
          <Text style={styles.streakHint}>
            Complete a task today to keep your streak
          </Text>
        )}
      </View>

      {/* Quests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly quests</Text>
        {quests.map((quest) => (
          <QuestCard key={quest.id} quest={quest} />
        ))}
      </View>

      {/* Badges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <BadgeGrid badges={badges} />
      </View>

      {/* Completed tasks */}
      <View style={[styles.section, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={styles.sectionTitle}>Eaten frogs 🐸</Text>
        {completedTasks.length === 0 ? (
          <Text style={styles.emptyCompleted}>No frogs eaten yet. Go get one!</Text>
        ) : (
          completedTasks.map((task) => {
            const cfg = COLUMN_CONFIG[task.column];
            return (
              <View key={task.id} style={styles.completedRow}>
                <View style={[styles.completedDot, { backgroundColor: cfg.accent }]} />
                <Text style={styles.completedTitle} numberOfLines={1}>{task.title}</Text>
                <Text style={styles.completedTime}>
                  {task.completedAt ? timeAgo(task.completedAt) : ''}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black800,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.grey800,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.grey700,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.white,
  },
  heroSub: {
    ...typography.body,
    color: colors.grey300,
    marginTop: spacing.xs,
  },
  section: {
    gap: spacing.md,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.white,
  },
  sectionMeta: {
    ...typography.caption,
    color: colors.grey300,
  },
  xpBarWrap: {
    height: 10,
    backgroundColor: colors.grey700,
    borderRadius: 5,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.yellow500,
    borderRadius: 5,
  },
  streakRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.grey800,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.grey700,
  },
  statCardActive: {
    borderColor: colors.coral,
    backgroundColor: 'rgba(255,107,107,0.08)',
  },
  statValue: {
    ...typography.h1,
    color: colors.white,
  },
  statLabel: {
    ...typography.caption,
    color: colors.grey300,
  },
  statIcon: {
    fontSize: 22,
    marginTop: spacing.xs,
  },
  streakHint: {
    ...typography.caption,
    color: colors.grey400,
    fontStyle: 'italic',
  },
  emptyCompleted: {
    ...typography.body,
    color: colors.grey400,
    fontStyle: 'italic',
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey600,
  },
  completedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  completedTitle: {
    flex: 1,
    fontSize: 14,
    color: colors.grey300,
    textDecorationLine: 'line-through',
  },
  completedTime: {
    ...typography.caption,
    color: colors.grey400,
  },
});
