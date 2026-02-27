/**
 * Ribbit the Frog
 * Personality: determined, a little sleepy, but always ready to eat the frog.
 * Original character — big bulging eyes, wide grin, plump green body.
 */
import React, { useEffect } from 'react';
import Svg, { Ellipse, Circle, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

export type MascotState = 'idle' | 'celebrate' | 'surprised' | 'encouraging';

interface PipMascotProps {
  state?: MascotState;
  size?: number;
}

export function PipMascot({ state = 'idle', size = 48 }: PipMascotProps) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = 1;
    rotate.value = 0;
    translateY.value = 0;

    if (state === 'idle') {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    } else if (state === 'celebrate') {
      scale.value = withRepeat(
        withSequence(
          withSpring(1.22, { damping: 5 }),
          withSpring(1, { damping: 8 })
        ),
        3,
        false
      );
      rotate.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 110 }),
          withTiming(10, { duration: 110 }),
          withTiming(0, { duration: 110 })
        ),
        3,
        false
      );
    } else if (state === 'surprised') {
      scale.value = withSequence(
        withSpring(1.28, { damping: 4 }),
        withTiming(1, { duration: 400 })
      );
    } else if (state === 'encouraging') {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 280 }),
          withTiming(0, { duration: 280 })
        ),
        2,
        false
      );
    }
  }, [state, scale, rotate, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
      { translateY: translateY.value },
    ],
  }));

  const isSurprised = state === 'surprised';
  const isCelebrating = state === 'celebrate';
  const isEncouraging = state === 'encouraging';

  // Eye sizes vary by state
  const eyeWhiteR = isSurprised ? 12 : 10;
  const irisR = isSurprised ? 7 : 5.5;
  const pupilR = isSurprised ? 5 : 3.5;

  return (
    <Animated.View style={animStyle}>
      <Svg width={size} height={size} viewBox="0 0 100 100">

        {/* Shadow */}
        <Ellipse cx="50" cy="97" rx="26" ry="4" fill="rgba(0,0,0,0.08)" />

        {/* Back feet */}
        <Ellipse
          cx="26" cy="90" rx="14" ry="7"
          fill="#388E3C"
          transform="rotate(-15 26 90)"
        />
        <Ellipse
          cx="74" cy="90" rx="14" ry="7"
          fill="#388E3C"
          transform="rotate(15 74 90)"
        />

        {/* Main body */}
        <Ellipse cx="50" cy="66" rx="37" ry="30" fill="#5CB85C" />

        {/* Belly */}
        <Ellipse cx="50" cy="72" rx="23" ry="20" fill="#D4EDDA" />

        {/* Left arm */}
        <Ellipse
          cx="18" cy="72" rx="9" ry="5.5"
          fill="#449944"
          transform={isEncouraging ? 'rotate(-40 18 72)' : 'rotate(-20 18 72)'}
        />
        {/* Right arm */}
        <Ellipse
          cx="82" cy="72" rx="9" ry="5.5"
          fill="#449944"
          transform="rotate(20 82 72)"
        />

        {/* Left eye socket (bulge on head) */}
        <Circle cx="33" cy="36" r="15" fill="#5CB85C" />
        {/* Right eye socket */}
        <Circle cx="67" cy="36" r="15" fill="#5CB85C" />

        {/* Left eye white */}
        <Circle cx="33" cy="35" r={eyeWhiteR} fill="#FFFFFF" />
        {/* Left iris */}
        <Circle cx="33" cy="35" r={irisR} fill="#2E7D32" />
        {/* Left pupil */}
        <Circle cx={isSurprised ? 33 : 34} cy="35" r={pupilR} fill="#1A1A17" />
        {/* Left eye shine */}
        <Circle cx="36" cy="31" r="2" fill="#FFFFFF" />

        {/* Right eye white */}
        <Circle cx="67" cy="35" r={eyeWhiteR} fill="#FFFFFF" />
        {/* Right iris */}
        <Circle cx="67" cy="35" r={irisR} fill="#2E7D32" />
        {/* Right pupil */}
        <Circle cx={isSurprised ? 67 : 68} cy="35" r={pupilR} fill="#1A1A17" />
        {/* Right eye shine */}
        <Circle cx="70" cy="31" r="2" fill="#FFFFFF" />

        {/* Nostrils */}
        <Circle cx="44" cy="53" r="2.5" fill="#449944" />
        <Circle cx="56" cy="53" r="2.5" fill="#449944" />

        {/* Mouth — varies by state */}
        {isSurprised && (
          <Circle cx="50" cy="63" r="5.5" fill="#2E7D32" />
        )}
        {!isSurprised && !isCelebrating && (
          <Path
            d="M 38 60 Q 50 70 62 60"
            stroke="#2E7D32"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        )}
        {isCelebrating && (
          <>
            {/* Wide open smile */}
            <Path
              d="M 36 58 Q 50 74 64 58"
              stroke="#2E7D32"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Tongue */}
            <Path
              d="M 44 62 Q 50 72 56 62"
              fill="#E53935"
            />
          </>
        )}
        {isEncouraging && (
          <>
            {/* Wider warm smile */}
            <Path
              d="M 37 59 Q 50 71 63 59"
              stroke="#2E7D32"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Checkmark beside */}
            <Path
              d="M 78 50 L 82 55 L 90 45"
              stroke="#5EA87A"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {/* Celebrate stars */}
        {isCelebrating && (
          <>
            <Path
              d="M 74 10 L 75.5 14 L 80 14 L 76.5 16.5 L 78 21 L 74 18.5 L 70 21 L 71.5 16.5 L 68 14 L 72.5 14 Z"
              fill="#D4880C"
              opacity="0.9"
            />
            <Path
              d="M 22 12 L 23 15 L 26 15 L 23.5 17 L 24.5 20 L 22 18.5 L 19.5 20 L 20.5 17 L 18 15 L 21 15 Z"
              fill="#D4880C"
              opacity="0.7"
            />
          </>
        )}
      </Svg>
    </Animated.View>
  );
}
