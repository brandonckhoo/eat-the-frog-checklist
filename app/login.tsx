import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { PipMascot } from '../src/components/mascot/PipMascot';
import { useAuthStore } from '../src/store/authStore';
import { colors, spacing, radius, typography } from '../src/theme/tokens';

export default function LoginScreen() {
  const { signInWithGoogle, loading } = useAuthStore();
  const [signingIn, setSigningIn] = React.useState(false);

  async function handleGoogleSignIn() {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <PipMascot state="idle" size={96} />
        <Text style={styles.title}>Eat the Frog</Text>
        <Text style={styles.subtitle}>
          Tackle your hardest task first.{'\n'}Sign in to save your progress.
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.googleBtn, pressed && styles.googleBtnPressed]}
          onPress={handleGoogleSignIn}
          disabled={signingIn || loading}
        >
          {signingIn ? (
            <ActivityIndicator color={colors.dark} size="small" />
          ) : (
            <>
              <Text style={styles.googleLogo}>G</Text>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black800,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.yellow500,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.grey300,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.yellow500,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  googleBtnPressed: {
    opacity: 0.85,
  },
  googleLogo: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.dark,
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark,
  },
});
