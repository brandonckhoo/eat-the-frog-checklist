import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../src/theme/tokens';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>404</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Back to board</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.black800,
    gap: 16,
  },
  title: { ...typography.h1, color: colors.white },
  link: {},
  linkText: { ...typography.body, color: colors.yellow500 },
});
