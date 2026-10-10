/**
 * Root Layout — Expo Router
 * Wraps the entire app. Handles:
 *  - Session restoration on launch
 *  - Auth-based redirect (unauthenticated → /auth, authenticated → /(tabs))
 *  - Global system UI configuration (status bar, splash)
 */

import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@core/stores/authStore';
import { Colors } from '@ui/tokens';

export default function RootLayout() {
  const { session, isLoading, restoreSession } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  // Restore session from secure storage on cold start
  useEffect(() => {
    void restoreSession();
  }, []);

  // Auth-based routing guard
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      // Not signed in — send to auth screen
      router.replace('/auth');
    } else if (session && inAuthGroup) {
      // Signed in — send to main tabs
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.dark.bg }} />
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.dark.bg} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="chat/[id]"
          options={{
            animation: 'slide_from_right',
            gestureEnabled: true,
          }}
        />
      </Stack>
    </>
  );
}
