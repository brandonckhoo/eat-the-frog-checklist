import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View, StyleSheet } from 'react-native';
import { colors } from '../src/theme/tokens';

export default function RootLayout() {
  if (Platform.OS === 'web') {
    return (
      <SafeAreaProvider>
        <View style={styles.webRoot}>
          <View style={styles.phoneShadow}>
            <Stack screenOptions={{ headerShown: false }} />
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
