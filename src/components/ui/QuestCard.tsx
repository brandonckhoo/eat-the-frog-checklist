import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Quest } from '../../types';
import { getQuestLabel } from '../../domain/quests';
import { colors, spacing, radius, typography } from '../../theme/tokens';

interface QuestCardProps {
  quest: Quest;
}

export function QuestCard({ quest }: QuestCardProps) {
  const pct = Math.min(quest.progress / quest.target, 1);
  const done = quest.completedAt != null;

  return (
    <View style={[styles.card, done && styles.cardDone]}>
      <View style={styles.row}>
        <Text style={styles.label} numberOfLines={1}>
          {getQuestLabel(quest.type)}
        </Text>
        <Text style={done ? styles.xpDone : styles.xp}>+{quest.rewardXp} XP</Text>
      </View>
      <View style={styles.barWrap}>
        <View style={[styles.barFill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={styles.progress}>
        {quest.progress}/{quest.target}
        {done ? '  Done' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.grey800,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.grey700,
  },
  cardDone: {
    borderColor: colors.mint,
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.body,
    color: colors.white,
    flex: 1,
  },
  xp: {
    ...typography.label,
    color: colors.yellow500,
  },
  xpDone: {
    ...typography.label,
    color: colors.mint,
  },
  barWrap: {
    height: 5,
    backgroundColor: colors.grey600,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.yellow500,
    borderRadius: 3,
  },
  progress: {
    ...typography.caption,
    color: colors.grey300,
  },
});
