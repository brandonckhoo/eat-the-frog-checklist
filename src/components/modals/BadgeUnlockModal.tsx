import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { PipMascot } from '../mascot/PipMascot';
import { getBadgeDefinition } from '../../domain/badges';
import type { BadgeType } from '../../types';
import { colors, spacing, radius, typography } from '../../theme/tokens';

interface BadgeUnlockModalProps {
  badgeType: BadgeType | null;
  onDismiss: () => void;
}

export function BadgeUnlockModal({ badgeType, onDismiss }: BadgeUnlockModalProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const emojiScale = useSharedValue(0);

  const visible = badgeType != null;

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 10, stiffness: 180 });
      emojiScale.value = withDelay(
        300,
        withSequence(withSpring(1.4, { damping: 5 }), withSpring(1, { damping: 12 }))
      );
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = 0;
      emojiScale.value = 0;
    }
  }, [visible, scale, opacity, emojiScale]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  if (!badgeType) return null;
  const def = getBadgeDefinition(badgeType);
  if (!def) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Animated.View style={[styles.card, cardStyle]}>
          <PipMascot state="surprised" size={70} />
          <Text style={styles.unlocked}>Badge unlocked</Text>
          <Animated.Text style={[styles.emoji, emojiStyle]}>
            {def.emoji}
          </Animated.Text>
          <Text style={styles.label}>{def.label}</Text>
          <Text style={styles.description}>{def.description}</Text>
          <Pressable style={styles.btn} onPress={onDismiss}>
            <Text style={styles.btnText}>Nice</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.grey800,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    width: 300,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.yellow500,
  },
  unlocked: {
    ...typography.label,
    color: colors.yellow500,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  emoji: {
    fontSize: 56,
  },
  label: {
    ...typography.h3,
    color: colors.white,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.grey300,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: colors.yellow500,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  btnText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.dark,
  },
});
