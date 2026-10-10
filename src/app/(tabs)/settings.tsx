/**
 * Settings Tab — Privacy, Content Filter, Account
 * Placeholder until settings module is implemented.
 */

import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '@ui/tokens';
import { useAuthStore } from '@core/stores/authStore';

export default function SettingsScreen() {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚙️</Text>
      <Text style={styles.title}>Configurações</Text>
      {user && (
        <Text style={styles.username}>@{user.username}</Text>
      )}
      <Text style={styles.hint}>Filtro de conteúdo, privacidade e conta em breve.</Text>
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
  title: { ...Typography.heading, marginBottom: 8 },
  username: { ...Typography.bodySmall, color: Colors.brand.primary, marginBottom: 16 },
  hint: { ...Typography.bodySmall, opacity: 0.6, textAlign: 'center' },
});
