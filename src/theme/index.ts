import { Platform } from 'react-native';

const colors = {
  // Backgrounds (layered depth)
  background: '#0A1628',
  surface: '#0F2040',
  surfaceRaised: '#142850',
  surfaceDim: '#071020',

  // Accent
  accent: '#5BA3D9',
  accentMuted: '#0D2B4A',
  accentDim: '#2A6090',

  // Text
  textPrimary: '#F0EDE8',
  textSecondary: '#8A9BB5',
  textTertiary: '#4A5C75',
  textOnAccent: '#F0EDE8',

  // Semantic
  error: '#FF6B6B',
  errorSurface: '#1F0A0A',
  success: '#5BA3D9',
  successSurface: '#0D2B4A',
  successBorder: '#1E5080',

  // Borders
  border: '#1C3055',
  borderFocus: '#5BA3D9',
  separator: '#112238',
} as const;

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  screenPad: 20,
} as const;

const typography = {
  sizes: {
    xs: 11,
    sm: 12,
    base: 13,
    body: 15,
    md: 16,
    lg: 17,
    xl: 20,
    xxl: 24,
    display: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  fontFamily: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
} as const;

const radii = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  fabGold: {
    shadowColor: '#5BA3D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 10,
    elevation: 10,
  },
} as const;

export const theme = {
  colors,
  spacing,
  typography,
  radii,
  shadows,
} as const;

export type Theme = typeof theme;
