/**
 * Chats Tab — Conversation List
 * Placeholder until messaging module is implemented (Phase 5).
 */

import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '@ui/tokens';

export default function ChatsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>B.L.A.S.T.</Text>
      <Text style={styles.subtitle}>Conversas</Text>
      <Text style={styles.hint}>Módulo de mensagens em breve.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    ...Typography.title,
    color: Colors.brand.primary,
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.heading,
    marginBottom: 16,
  },
  hint: {
    ...Typography.bodySmall,
    textAlign: 'center',
    opacity: 0.6,
  },
});
