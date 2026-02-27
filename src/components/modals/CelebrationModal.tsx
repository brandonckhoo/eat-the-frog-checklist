import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { PipMascot } from '../mascot/PipMascot';
import { colors, spacing, radius, typography } from '../../theme/tokens';

const MICROCOPY = [
  'Nice work',
  '1 step closer',
  'Keep going',
  'You did that',
];

interface CelebrationModalProps {
  visible: boolean;
  xpAwarded: number;
  onDismiss: () => void;
}

export function CelebrationModal({ visible, xpAwarded, onDismiss }: CelebrationModalProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const xpScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 150 });
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      xpScale.value = withDelay(200, withSpring(1, { damping: 10 }));
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = 0;
      xpScale.value = 0;
    }
  }, [visible, scale, opacity, xpScale]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const xpStyle = useAnimatedStyle(() => ({
    transform: [{ scale: xpScale.value }],
  }));

  const msg = MICROCOPY[Math.floor(Math.random() * MICROCOPY.length)];

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Animated.View style={[styles.card, containerStyle]}>
          <PipMascot state="celebrate" size={80} />
          <Text style={styles.msg}>{msg}</Text>
          <Animated.View style={[styles.xpBadge, xpStyle]}>
            <Text style={styles.xpText}>+{xpAwarded} XP</Text>
          </Animated.View>
          <Pressable style={styles.btn} onPress={onDismiss}>
            <Text style={styles.btnText}>Keep going</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.grey800,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    width: 300,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.grey600,
  },
  msg: {
    ...typography.h2,
    color: colors.white,
    textAlign: 'center',
  },
  xpBadge: {
    backgroundColor: colors.yellow100,
    borderWidth: 1,
    borderColor: colors.yellow500,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  xpText: {
    ...typography.h3,
    color: colors.yellow500,
    fontWeight: '700',
  },
  btn: {
    backgroundColor: colors.yellow500,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  btnText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.dark,
  },
});
