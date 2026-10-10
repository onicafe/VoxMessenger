/**
 * Tab Navigator Layout — B.L.A.S.T.
 * Bottom tab navigation (mobile-first).
 * Tabs: Chats | Store | Settings
 */

import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Colors, FontSize } from '@ui/tokens';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.brand.primary,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💬" label="Conversas" focused={focused} />
          ),
          tabBarAccessibilityLabel: 'Conversas',
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🛍️" label="Loja" focused={focused} />
          ),
          tabBarAccessibilityLabel: 'Loja',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚙️" label="Config." focused={focused} />
          ),
          tabBarAccessibilityLabel: 'Configurações',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.dark.surface,
    borderTopColor: Colors.dark.border,
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabIcon: {
    alignItems: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary,
  },
  tabLabelFocused: {
    color: Colors.brand.primary,
  },
});
