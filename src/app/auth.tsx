/**
 * Auth Screen — GOV.br Login Entry Point
 * Shown to unauthenticated users.
 * Phase 2 will replace this with the full GOV.br OAuth flow.
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '@ui/tokens';

export default function AuthScreen() {
  return (
    <View style={styles.container}>
      {/* Logo area */}
      <View style={styles.logoArea}>
        <Text style={styles.logo}>B.L.A.S.T.</Text>
        <Text style={styles.tagline}>Mensagens privadas.{'\n'}Sua liberdade, protegida.</Text>
      </View>

      {/* Action area */}
      <View style={styles.actionArea}>
        <TouchableOpacity
          style={styles.govButton}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Entrar com GOV.br"
        >
          <Text style={styles.govButtonText}>🏛️  Entrar com GOV.br</Text>
        </TouchableOpacity>

        <Text style={styles.legalNote}>
          Ao entrar, você concorda com nossa{' '}
          <Text style={styles.link}>Política de Privacidade</Text>
          {' '}e os{' '}
          <Text style={styles.link}>Termos de Uso</Text>.
          {'\n'}Seus dados são protegidos pela LGPD.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
    paddingTop: 120,
    paddingBottom: 56,
  },
  logoArea: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.brand.primary,
    letterSpacing: 6,
    marginBottom: Spacing.lg,
  },
  tagline: {
    ...Typography.heading,
    textAlign: 'center',
    lineHeight: 30,
    color: Colors.text.secondary,
    fontWeight: '400',
  },
  actionArea: {
    gap: Spacing.lg,
  },
  govButton: {
    backgroundColor: Colors.brand.primary,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    ...Shadow.md,
  },
  govButtonText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text.primary,
    fontSize: 16,
  },
  legalNote: {
    ...Typography.caption,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.7,
  },
  link: {
    color: Colors.brand.primary,
    textDecorationLine: 'underline',
  },
});
