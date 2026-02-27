import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet,
  ActivityIndicator, TextInput,
} from 'react-native';
import { PipMascot } from '../src/components/mascot/PipMascot';
import { supabase } from '../src/data/supabaseClient';
import { colors, spacing, radius, typography } from '../src/theme/tokens';

export default function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkEmail, setCheckEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setCheckEmail(true);
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <View style={styles.container}>
        <View style={styles.hero}>
          <PipMascot state="encouraging" size={88} />
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a confirmation link to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
            {'\n\n'}Click the link to activate your account, then come back here to sign in.
          </Text>
        </View>
        <View style={styles.form}>
          <Pressable
            style={({ pressed }) => [styles.submitBtn, pressed && styles.btnPressed]}
            onPress={() => { setCheckEmail(false); setMode('login'); }}
          >
            <Text style={styles.submitBtnText}>Back to Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <PipMascot state="idle" size={88} />
        <Text style={styles.title}>Eat the Frog</Text>
        <Text style={styles.subtitle}>
          Tackle your hardest task first.{'\n'}Sign in to save your progress.
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.grey400}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <View style={styles.passwordWrap}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor={colors.grey400}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <Pressable style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
            <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.submitBtn, pressed && styles.btnPressed]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.dark} size="small" />
          ) : (
            <Text style={styles.submitBtnText}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
          <Text style={styles.toggleText}>
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </Text>
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
    fontSize: 30,
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
  emailHighlight: {
    color: colors.yellow500,
    fontWeight: '600',
  },
  form: {
    width: '100%',
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.grey700,
    borderWidth: 1,
    borderColor: colors.grey600,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.white,
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grey700,
    borderWidth: 1,
    borderColor: colors.grey600,
    borderRadius: radius.md,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.white,
  },
  eyeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
  },
  eyeText: {
    fontSize: 16,
  },
  errorText: {
    ...typography.caption,
    color: colors.coral,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: colors.yellow500,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    opacity: 0.85,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark,
  },
  toggleText: {
    ...typography.caption,
    color: colors.grey300,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
