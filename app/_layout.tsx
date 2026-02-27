import { Stack, Redirect } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { colors } from '../src/theme/tokens';
import { useAuthStore } from '../src/store/authStore';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, init } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.black800 }}>
        <ActivityIndicator color={colors.yellow500} size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const stackContent = (
    <AuthGate>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthGate>
  );

  if (Platform.OS === 'web') {
    return (
      <SafeAreaProvider>
        <View style={styles.webRoot}>
          <View style={styles.phoneShadow}>
            {stackContent}
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    backgroundColor: '#D1CFC9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneShadow: {
    width: 390,
    height: '100%' as any,
    maxHeight: 844,
    backgroundColor: colors.black800,
    overflow: 'hidden',
    borderRadius: 0,
    // @ts-ignore web-only
    boxShadow: '0 8px 48px rgba(0,0,0,0.25)',
  },
});
