// constants/theme.ts


const palette = {
  lavender: '#8B82FF',
  lavenderLight: '#A69CFF',
  lavenderDark: '#6C63FF',
  turquoise: '#26CDB3',
  yellow: '#FFD166',

  darkBg: '#0F0F1E',
  darkCard: '#1A1A2E',
  darkerCard: '#151527',
  lightLavenderBg: '#2D2A4A',

  lightText: '#E8E8F0',
  mediumText: '#A0A0B8',
  white: '#FFFFFF',

  glowLavender: 'rgba(139, 130, 255, 0.35)',
  borderPrimary: '#2D2A4A',
  destructive: '#d4183d',
};

export const Colors = {
  light: {
    text: '#11181C',
    textMedium: '#687076',
    background: '#F8F9FA',
    tint: palette.lavenderDark,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: palette.lavenderDark,
    primary: palette.lavenderDark,
    secondary: '#1A9E88',
    accent: '#F4B41A',
    card: '#FFFFFF',
    cardDarker: '#F1F3F5',
    cardAccent: '#E9E7FE',
    border: '#E8EAED',
    glow: 'rgba(139, 130, 255, 0.15)',
    destructive: palette.destructive,
    navBar: 'rgba(255, 255, 255, 0.85)',
  },
  dark: {
    text: palette.lightText,
    textMedium: palette.mediumText,
    background: palette.darkBg,
    tint: palette.lavender,
    icon: palette.mediumText,
    tabIconDefault: palette.mediumText,
    tabIconSelected: palette.lavender,
    primary: palette.lavender,
    secondary: palette.turquoise,
    accent: palette.yellow,
    card: palette.darkCard,
    cardDarker: palette.darkerCard,
    cardAccent: palette.lightLavenderBg,
    border: palette.borderPrimary,
    glow: palette.glowLavender,
    destructive: palette.destructive,
    navBar: 'rgba(26, 26, 46, 0.85)',
  },
};

export const Fonts = {
  sans: 'Inter-Regular',
  sansMedium: 'Inter-Medium',
  sansBold: 'Inter-Bold',
};

export const TextVariants = {
  h1: { fontFamily: Fonts.sansBold, fontSize: 32 },
  h2: { fontFamily: Fonts.sansBold, fontSize: 24 },
  h3: { fontFamily: Fonts.sansBold, fontSize: 20 },
  body: { fontFamily: Fonts.sansMedium, fontSize: 16 },
  secondary: { fontFamily: Fonts.sans, fontSize: 14 },
  label: { fontFamily: Fonts.sansMedium, fontSize: 12 },
};

export const Spacing = { xs: 4, s: 8, m: 16, l: 24, xl: 40 };
export const Radius = { s: 5, m: 10, l: 20, xl: 30 };

