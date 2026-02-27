import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Badge } from '../../types';
import { ALL_BADGE_DEFINITIONS } from '../../domain/badges';
import { colors, spacing, radius, typography } from '../../theme/tokens';

interface BadgeGridProps {
  badges: Badge[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  return (
    <View style={styles.list}>
      {ALL_BADGE_DEFINITIONS.map((def) => {
        const badge = badges.find((b) => b.type === def.type);
        const unlocked = badge?.unlockedAt != null;
        return (
          <View
            key={def.type}
            style={[styles.row, unlocked ? styles.rowUnlocked : styles.rowLocked]}
          >
            <View style={[styles.iconWrap, unlocked ? styles.iconWrapUnlocked : styles.iconWrapLocked]}>
              <Text style={[styles.emoji, !unlocked && styles.emojiLocked]}>
                {def.emoji}
              </Text>
            </View>
            <View style={styles.textWrap}>
              <Text style={[styles.name, !unlocked && styles.nameLocked]}>
                {def.label}
              </Text>
              <Text style={styles.desc}>{def.description}</Text>
            </View>
            <Text style={[styles.status, unlocked && styles.statusUnlocked]}>
              {unlocked ? '✓' : '🔒'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
  },
  rowUnlocked: {
    backgroundColor: 'rgba(255,200,61,0.08)',
    borderColor: colors.yellow500,
  },
  rowLocked: {
    backgroundColor: colors.grey800,
    borderColor: colors.grey700,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconWrapUnlocked: {
    backgroundColor: 'rgba(255,200,61,0.15)',
  },
  iconWrapLocked: {
    backgroundColor: colors.grey700,
  },
  emoji: {
    fontSize: 24,
  },
  emojiLocked: {
    opacity: 0.4,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  nameLocked: {
    color: colors.grey300,
  },
  desc: {
    ...typography.caption,
    color: colors.grey400,
    lineHeight: 16,
  },
  status: {
    fontSize: 16,
    color: colors.grey600,
  },
  statusUnlocked: {
    color: colors.yellow500,
    fontWeight: '700',
  },
});
