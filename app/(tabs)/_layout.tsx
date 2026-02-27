import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/theme/tokens';

function TabIcon({ emoji, active }: { emoji: string; active: boolean }) {
  return <Text style={{ fontSize: 20, opacity: active ? 1 : 0.45 }}>{emoji}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.black800,
          borderTopColor: colors.grey600,
          borderTopWidth: 1,
          paddingHorizontal: 48,
        },
        tabBarActiveTintColor: colors.yellow500,
        tabBarInactiveTintColor: colors.grey400,
        tabBarItemStyle: {
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Board',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📈" active={focused} />,
        }}
      />
    </Tabs>
  );
}
