import { Stack, useSegments, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { colors } from '../src/theme/tokens';
import { useAuthStore } from '../src/store/authStore';

function AuthRedirect() {
  const { user, loading, init } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (loading) return;
    const inTabs = segments[0] === '(tabs)';
    if (!user && inTabs) {
      router.replace('/login');
    } else if (user && !inTabs) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return null;
}

export default function RootLayout() {
  const stack = (
    <>
      <AuthRedirect />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );

  if (Platform.OS === 'web') {
    return (
      <SafeAreaProvider>
        <View style={styles.webRoot}>
          <View style={styles.phoneShadow}>{stack}</View>
        </View>
      </SafeAreaProvider>
    );
  }

  return <SafeAreaProvider>{stack}</SafeAreaProvider>;
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
    // @ts-ignore web-only
    boxShadow: '0 8px 48px rgba(0,0,0,0.25)',
  },
});
