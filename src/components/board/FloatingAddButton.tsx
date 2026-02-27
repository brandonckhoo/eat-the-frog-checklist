import React from 'react';
import { Pressable, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, radius } from '../../theme/tokens';

interface FloatingAddButtonProps {
  onPress: () => void;
}

export function FloatingAddButton({ onPress }: FloatingAddButtonProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.wrap, animStyle]}>
      <Pressable
        style={styles.button}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.92, { damping: 12 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 10 });
        }}
        accessibilityLabel="Create task"
        accessibilityRole="button"
      >
        <Text style={styles.icon}>+</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    zIndex: 50,
  },
  button: {
    width: 58,
    height: 58,
    borderRadius: radius.full,
    backgroundColor: colors.yellow500,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.yellow500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: {
    fontSize: 28,
    color: colors.black800,
    fontWeight: '700',
    lineHeight: 32,
    marginTop: Platform.OS === 'android' ? -2 : 0,
  },
});
