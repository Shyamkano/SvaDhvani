// constants/theme.ts

import { Platform, StyleSheet } from 'react-native';

/**
 * =================================================================================
 * BINAURAL BEATS APP - DESIGN SYSTEM
 * =================================================================================
 * This file contains the complete design system for the app, including colors,
 * spacing, typography, and other theming variables.
 * =================================================================================
 */

// --------------------------------------------------
// PALETTE - The raw color values for the app.
// --------------------------------------------------
const palette = {
  // Primary Brand Colors
  lavender: '#8B82FF',
  lavenderLight: '#A69CFF',
  lavenderDark: '#6C63FF',
  turquoise: '#26CDB3',
  yellow: '#FFD166',
  
  // Backgrounds
  darkBg: '#0F0F1E',
  darkCard: '#1A1A2E',
  darkerCard: '#151527',
  
  // Accent Backgrounds
  lightLavenderBg: '#2D2A4A',
  
  // Text
  lightText: '#E8E8F0',
  mediumText: '#A0A0B8',
  white: '#FFFFFF',
  
  // Glows & Borders
  glowLavender: 'rgba(139, 130, 255, 0.35)',
  borderPrimary: '#2D2A4A',
  borderGlass: 'rgba(255, 255, 255, 0.2)',
  
  // System
  destructive: '#d4183d',
};

// --------------------------------------------------
// COLORS - Structured for light and dark modes.
// --------------------------------------------------
export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    tint: palette.lavenderDark,
    icon: '#687076',
    card: '#F3F3F5',
    tabIconDefault: '#687076',
    tabIconSelected: palette.lavenderDark,
  },
  dark: {
    // Standard keys
    text: palette.lightText,
    background: palette.darkBg,
    tint: palette.lavender,
    icon: palette.mediumText,
    tabIconDefault: palette.mediumText,
    tabIconSelected: palette.lavender,
    
    // Custom App-Specific Colors
    primary: palette.lavender,
    secondary: palette.turquoise,
    accent: palette.yellow,
    card: palette.darkCard,
    cardDarker: palette.darkerCard,
    cardAccent: palette.lightLavenderBg,
    textMedium: palette.mediumText,
    border: palette.borderPrimary,
    glow: palette.glowLavender,
    destructive: palette.destructive,
    navBar: 'rgba(26, 26, 46, 0.85)',
  },
};

// --------------------------------------------------
// TYPOGRAPHY - Font families and sizes.
// --------------------------------------------------
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    sansMedium: 'system-ui',
    sansBold: 'system-ui',
  },
  android: {
    sans: 'normal',
    sansMedium: 'normal',
    sansBold: 'normal',
  },
  default: {
    sans: 'sans-serif',
    sansMedium: 'sans-serif-medium',
    sansBold: 'sans-serif-bold',
  },
});

export const TextVariants = {
  h1: {
    fontFamily: Fonts.sansBold, // ✅ FIXED: Access directly
    fontSize: 32,
    color: Colors.dark.text,
  },
  h2: {
    fontFamily: Fonts.sansBold, // ✅ FIXED: Access directly
    fontSize: 24,
    color: Colors.dark.text,
  },
  h3: {
    fontFamily: Fonts.sansMedium, // ✅ FIXED: Access directly
    fontSize: 20,
    color: Colors.dark.text,
  },
  body: {
    fontFamily: Fonts.sans, // ✅ FIXED: Access directly
    fontSize: 16,
    color: Colors.dark.text,
  },
  secondary: {
    fontFamily: Fonts.sans, // ✅ FIXED: Access directly
    fontSize: 14,
    color: Colors.dark.textMedium,
  },
  label: {
    fontFamily: Fonts.sansMedium, // ✅ FIXED: Access directly
    fontSize: 12,
    // Color is applied in the component to handle focus state
  },
};

// --------------------------------------------------
// SPACING & SIZES
// --------------------------------------------------
export const Spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 40,
};

export const Radius = {
  s: 5,
  m: 10,
  l: 20,
  xl: 30,
};
export const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.m, paddingTop: Spacing.m, paddingBottom: Spacing.s },
  backButton: { width: 48, height: 48, borderRadius: Radius.l, backgroundColor: Colors.dark.card, borderWidth: 1, borderColor: Colors.dark.border, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...TextVariants.h3 },
  scrollContainer: { padding: Spacing.m, paddingBottom: 100 },
  tabsContainer: { flexDirection: 'row', backgroundColor: Colors.dark.card, borderRadius: Radius.l, padding: Spacing.xs, borderWidth: 1, borderColor: Colors.dark.border, marginBottom: Spacing.l },
  tabButton: { flex: 1, paddingVertical: Spacing.m, alignItems: 'center', borderRadius: Radius.m, zIndex: 1 },
  tabText: { ...TextVariants.body, fontWeight: '600', },
  activeTabIndicator: { position: 'absolute', height: '100%', top: Spacing.xs, left: Spacing.xs, borderRadius: Radius.m },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.m, marginBottom: Spacing.l },
  categoryCard: { padding: Spacing.m, borderRadius: Radius.l, borderWidth: 1, borderColor: Colors.dark.border, alignItems: 'center', height: 180, justifyContent: 'center' },
  categoryContent: { alignItems: 'center', gap: Spacing.s },
  categoryIconContainer: { width: 64, height: 64, borderRadius: Radius.l, justifyContent: 'center', alignItems: 'center' },
  categoryName: { ...TextVariants.h3 },
  categoryFreq: { ...TextVariants.secondary },
  sliderContainer: { backgroundColor: Colors.dark.card, borderRadius: Radius.l, padding: Spacing.m, borderWidth: 1, borderColor: Colors.dark.border, marginBottom: Spacing.l },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.s },
  sectionTitle: { ...TextVariants.h3 },
  freqDisplay: { paddingHorizontal: Spacing.m, paddingVertical: Spacing.xs, backgroundColor: Colors.dark.cardAccent, borderRadius: Radius.m, borderWidth: 1, borderColor: `${Colors.dark.primary}50` },
  freqText: { ...TextVariants.label, color: Colors.dark.primary },
  playButton: { width: 128, height: 128, borderRadius: 64, justifyContent: 'center', alignItems: 'center' },
  pulsingRing: { position: 'absolute', width: 128, height: 128, borderRadius: 64, borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)' },
  timerContainer: { alignItems: 'center', marginTop: Spacing.l },
  timerText: { ...TextVariants.h1, fontSize: 48, letterSpacing: 2 },
  timerLabel: { ...TextVariants.secondary, color: Colors.dark.textMedium },
  aiCard: { borderRadius: Radius.xl, padding: Spacing.l, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.s, marginBottom: Spacing.m },
  aiCardSub: { ...TextVariants.secondary, color: 'rgba(255,255,255,0.9)' },
  aiCardTitle: { ...TextVariants.h2, color: '#FFFFFF', marginBottom: Spacing.s },
  aiCardBody: { ...TextVariants.body, color: 'rgba(255,255,255,0.9)', lineHeight: 22 },
  aiTagsContainer: { flexDirection: 'row', gap: Spacing.m, marginTop: Spacing.l },
  aiTag: { paddingHorizontal: Spacing.m, paddingVertical: Spacing.s, borderRadius: Radius.m, backgroundColor: 'rgba(255,255,255,0.2)' },
  aiTagText: { ...TextVariants.label, color: '#FFFFFF', fontWeight: '600' },
  smartPlayButton: { backgroundColor: Colors.dark.card, borderWidth: 1, borderColor: Colors.dark.border, borderRadius: Radius.xl, padding: Spacing.m },
  smartPlayContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.m },
  smartPlayIconContainer: { width: 60, height: 60, borderRadius: Radius.l, justifyContent: 'center', alignItems: 'center' },
  whyCard: { backgroundColor: Colors.dark.card, borderRadius: Radius.xl, padding: Spacing.l, borderWidth: 1, borderColor: Colors.dark.border },
  whyItemsContainer: { gap: Spacing.m, marginTop: Spacing.m },
  whyItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.m },
  whyNumContainer: { width: 32, height: 32, borderRadius: Radius.m, justifyContent: 'center', alignItems: 'center' },
  whyNumText: { ...TextVariants.label, fontWeight: 'bold' },
  whyText: { ...TextVariants.secondary, flex: 1, lineHeight: 20 },
});
