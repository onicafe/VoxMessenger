/**
 * Store Tab — Sticker Packs & Themes
 * Placeholder until monetization module is implemented (Phase 8).
 */

import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '@ui/tokens';

export default function StoreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🛍️</Text>
      <Text style={styles.title}>Loja</Text>
      <Text style={styles.hint}>Figurinhas e temas em breve.</Text>
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
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { ...Typography.heading, marginBottom: 12 },
  hint: { ...Typography.bodySmall, opacity: 0.6 },
});
