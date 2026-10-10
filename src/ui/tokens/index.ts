/**
 * Design Tokens — B.L.A.S.T. Messenger
 *
 * HSL-based color system. Dark mode is the default and primary experience.
 * All UI components must reference these tokens, never hardcode colors.
 */

export const Colors = {
  // ─── Brand ─────────────────────────────────────────────────────────────────
  brand: {
    primary: 'hsl(262, 80%, 58%)',       // Purple — main accent
    primaryDark: 'hsl(262, 80%, 45%)',
    primaryLight: 'hsl(262, 80%, 72%)',
    secondary: 'hsl(200, 90%, 50%)',      // Electric blue — secondary
  },

  // ─── Dark Mode Surfaces ─────────────────────────────────────────────────────
  dark: {
    bg: 'hsl(240, 14%, 6%)',             // Near-black bg
    surface: 'hsl(240, 12%, 10%)',       // Card / modal surface
    surfaceHigh: 'hsl(240, 10%, 14%)',   // Elevated surface
    border: 'hsl(240, 10%, 18%)',        // Subtle border
    overlay: 'hsla(240, 14%, 4%, 0.85)',
  },

  // ─── Text ──────────────────────────────────────────────────────────────────
  text: {
    primary: 'hsl(0, 0%, 96%)',
    secondary: 'hsl(0, 0%, 60%)',
    tertiary: 'hsl(0, 0%, 38%)',
    inverse: 'hsl(0, 0%, 6%)',
  },

  // ─── Semantic ──────────────────────────────────────────────────────────────
  success: 'hsl(142, 70%, 45%)',
  warning: 'hsl(38, 95%, 52%)',
  error: 'hsl(0, 80%, 55%)',
  info: 'hsl(210, 80%, 55%)',

  // ─── Chat bubbles ──────────────────────────────────────────────────────────
  bubble: {
    outgoing: 'hsl(262, 70%, 35%)',
    incoming: 'hsl(240, 10%, 16%)',
  },

  // ─── Transparent ───────────────────────────────────────────────────────────
  transparent: 'transparent',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 38,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Typography = {
  body: { fontSize: FontSize.md, fontWeight: FontWeight.regular, color: Colors.text.primary },
  bodySmall: { fontSize: FontSize.sm, fontWeight: FontWeight.regular, color: Colors.text.secondary },
  heading: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  caption: { fontSize: FontSize.xs, fontWeight: FontWeight.regular, color: Colors.text.tertiary },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.primary },
} as const;

export const Shadow = {
  sm: {
    shadowColor: 'hsl(0, 0%, 0%)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: 'hsl(0, 0%, 0%)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: 'hsl(262, 50%, 20%)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;
