import {
  Activity01Icon as ActivityIcon,
  Calendar01Icon as Calendar,
  ArrowLeft01Icon as ChevronLeft,
  FireIcon,
  HeartCheckIcon,
  Moon02Icon as MoonIcon,
  RouteIcon,
  WorkoutRunIcon as RunIcon,
  RefreshIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnimatedScreen from '@/components/AnimatedScreen';
import { Radius, Spacing, TextVariants } from '@/constants/theme';
import { useGoogleFit } from '@/hooks/useGoogleFit';
import { useThemeColors } from '@/hooks/use-theme-color';
import { supabase } from '../../lib/supabase';

// ─────────────────────────────────────────────
// Metric card config
// ─────────────────────────────────────────────
type MetricConfig = {
  key: string;
  label: string;
  unit: string;
  icon: any;
  gradientStart: string;
  gradientEnd: string;
  goal?: number;
  format?: (v: number) => string;
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function HealthMetrics() {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const { metrics, status, error, refetch } = useGoogleFit();

  const [totalSessions, setTotalSessions] = useState(0);
  const [consistency, setConsistency] = useState('0/7 days');

  useEffect(() => {
    const fetchAppMetrics = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: sessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (sessions && sessions.length > 0) {
        setTotalSessions(sessions.length);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const uniqueDays = new Set(
          sessions
            .filter(s => new Date(s.created_at) >= oneWeekAgo)
            .map(s => new Date(s.created_at).toDateString()),
        );
        setConsistency(`${uniqueDays.size}/7 days`);
      }
    };
    fetchAppMetrics();
  }, []);

  // ── 6 metric cards definition
  const metricCards: MetricConfig[] = [
    {
      key: 'steps',
      label: 'Steps',
      unit: 'steps',
      icon: RunIcon,
      gradientStart: '#6C63FF',
      gradientEnd: '#8B82FF',
      goal: 10000,
    },
    {
      key: 'heartRate',
      label: 'Heart Rate',
      unit: 'bpm',
      icon: HeartCheckIcon,
      gradientStart: '#E53E3E',
      gradientEnd: '#FC8181',
    },
    {
      key: 'calories',
      label: 'Calories Burned',
      unit: 'kcal',
      icon: FireIcon,
      gradientStart: '#DD6B20',
      gradientEnd: '#F6AD55',
      goal: 500,
    },
    {
      key: 'sleepHours',
      label: 'Sleep',
      unit: 'hrs',
      icon: MoonIcon,
      gradientStart: '#2B4F8A',
      gradientEnd: '#4A90D9',
      goal: 8,
      format: (v: number) => v.toFixed(1),
    },
    {
      key: 'activeMinutes',
      label: 'Active Minutes',
      unit: 'min',
      icon: ActivityIcon,
      gradientStart: '#276749',
      gradientEnd: '#48BB78',
      goal: 30,
    },
    {
      key: 'distance',
      label: 'Distance',
      unit: 'km',
      icon: RouteIcon,
      gradientStart: '#26CDB3',
      gradientEnd: '#81E6D9',
      goal: 5,
      format: (v: number) => v.toFixed(2),
    },
  ];

  const metricValues: Record<string, number | null> = {
    steps:         metrics.steps,
    heartRate:     metrics.heartRate,
    calories:      metrics.calories,
    sleepHours:    metrics.sleepHours,
    activeMinutes: metrics.activeMinutes,
    distance:      metrics.distance,
  };

  return (
    <AnimatedScreen>
      <LinearGradient colors={[colors.background, colors.cardDarker]} style={styles.container}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <StatusBar
            barStyle={
              colors.background === '#FFFFFF' || colors.background === '#F8F9FA'
                ? 'dark-content'
                : 'light-content'
            }
          />

          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <HugeiconsIcon icon={ChevronLeft} size={28} color={colors.text} />
            </Pressable>
            <Text style={styles.headerTitle}>Health Metrics</Text>
            <Pressable onPress={refetch} style={styles.backButton}>
              <HugeiconsIcon icon={RefreshIcon} size={22} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* App Stats Row */}
            <View style={styles.appStatsRow}>
              <AppStatChip
                icon={<HugeiconsIcon icon={Calendar} size={16} color={colors.primary} />}
                label={`${totalSessions} Sessions`}
                colors={colors}
              />
              <AppStatChip
                icon={<Text style={{ fontSize: 14 }}>🔥</Text>}
                label={`${consistency}`}
                colors={colors}
              />
            </View>

            {/* Google Fit Section Title */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Smartwatch Data</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMedium }]}>From Google Fit</Text>
            </View>

            {/* Status: loading */}
            {status === 'loading' && (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.statusText, { color: colors.textMedium }]}>
                  Fetching from Google Fit…
                </Text>
              </View>
            )}

            {/* Status: no token */}
            {status === 'no_token' && (
              <View style={[styles.centerBox, styles.noTokenBox]}>
                <Text style={styles.noTokenEmoji}>⌚</Text>
                <Text style={[styles.noTokenTitle, { color: colors.text }]}>
                  Google Fit Not Connected
                </Text>
                <Text style={[styles.noTokenSubtitle, { color: colors.textMedium }]}>
                  Go to Profile → Connect Devices → Google Fit to link your smartwatch data.
                </Text>
                <Pressable
                  style={[styles.connectBtn, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/(tabs)/profile')}
                >
                  <Text style={styles.connectBtnText}>Go to Profile</Text>
                </Pressable>
              </View>
            )}

            {/* Status: error */}
            {status === 'error' && (
              <View style={[styles.centerBox, styles.noTokenBox]}>
                <Text style={styles.noTokenEmoji}>⚠️</Text>
                <Text style={[styles.noTokenTitle, { color: colors.text }]}>
                  Could Not Load Data
                </Text>
                <Text style={[styles.noTokenSubtitle, { color: colors.textMedium }]}>
                  {error ?? 'Unknown error'}
                </Text>
                <Pressable
                  style={[styles.connectBtn, { backgroundColor: colors.primary }]}
                  onPress={refetch}
                >
                  <Text style={styles.connectBtnText}>Retry</Text>
                </Pressable>
              </View>
            )}

            {/* Status: success — 6 metric cards in 2-column grid */}
            {(status === 'success' || status === 'idle') && (
              <View style={styles.metricsGrid}>
                {metricCards.map(cfg => {
                  const raw = metricValues[cfg.key];
                  const display =
                    raw === null
                      ? '--'
                      : cfg.format
                      ? cfg.format(raw)
                      : raw.toLocaleString();

                  const progress =
                    raw !== null && cfg.goal ? Math.min(raw / cfg.goal, 1) : null;

                  return (
                    <MetricCard
                      key={cfg.key}
                      config={cfg}
                      displayValue={display}
                      progress={progress}
                      colors={colors}
                    />
                  );
                })}
              </View>
            )}

            {/* Footer note */}
            {status === 'success' && (
              <Text style={[styles.footerNote, { color: colors.textMedium }]}>
                Data synced from your smartwatch via Google Fit · Updated just now
              </Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </AnimatedScreen>
  );
}

// ─────────────────────────────────────────────
// MetricCard
// ─────────────────────────────────────────────
function MetricCard({
  config,
  displayValue,
  progress,
  colors,
}: {
  config: MetricConfig;
  displayValue: string;
  progress: number | null;
  colors: any;
}) {
  const styles = createStyles(colors);

  return (
    <View style={[styles.metricCard, { borderColor: `${config.gradientEnd}40` }]}>
      {/* Icon badge */}
      <LinearGradient
        colors={[config.gradientStart, config.gradientEnd]}
        style={styles.metricIconBadge}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <HugeiconsIcon icon={config.icon} size={22} color="#FFFFFF" />
      </LinearGradient>

      {/* Value */}
      <Text style={[styles.metricValue, { color: colors.text }]}>{displayValue}</Text>
      <Text style={[styles.metricUnit, { color: config.gradientEnd }]}>{config.unit}</Text>
      <Text style={[styles.metricLabel, { color: colors.textMedium }]}>{config.label}</Text>

      {/* Progress bar (only if goal exists) */}
      {progress !== null && (
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[config.gradientStart, config.gradientEnd]}
            style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
      )}
      {progress !== null && (
        <Text style={[styles.progressLabel, { color: colors.textMedium }]}>
          {Math.round(progress * 100)}% of goal
        </Text>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
// AppStatChip
// ─────────────────────────────────────────────
function AppStatChip({ icon, label, colors }: { icon: React.ReactNode; label: string; colors: any }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: Radius.l,
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        flex: 1,
        justifyContent: 'center',
      }}
    >
      {icon}
      <Text style={{ ...TextVariants.secondary, color: colors.text, fontFamily: 'Inter-Medium' }}>
        {label}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.m,
      paddingTop: Spacing.m,
      paddingBottom: Spacing.s,
    },
    backButton: {
      width: 48,
      height: 48,
      borderRadius: Radius.l,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: { ...TextVariants.h3, fontFamily: 'Inter-Bold', color: colors.text },
    scrollContainer: { padding: Spacing.m, paddingBottom: 120 },

    appStatsRow: { flexDirection: 'row', gap: Spacing.m, marginBottom: Spacing.l },

    sectionHeader: { marginBottom: Spacing.m },
    sectionTitle: { ...TextVariants.h3, fontFamily: 'Inter-Bold' },
    sectionSubtitle: { ...TextVariants.secondary, marginTop: 2 },

    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.m,
    },

    metricCard: {
      width: '47%',
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      borderWidth: 1,
      padding: Spacing.m,
      alignItems: 'flex-start',
    },
    metricIconBadge: {
      width: 44,
      height: 44,
      borderRadius: Radius.m,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.s,
    },
    metricValue: {
      ...TextVariants.h2,
      fontFamily: 'Inter-Bold',
      marginTop: Spacing.s,
      lineHeight: 32,
    },
    metricUnit: {
      fontFamily: 'Inter-Medium',
      fontSize: 13,
      marginTop: 2,
    },
    metricLabel: {
      ...TextVariants.secondary,
      fontFamily: 'Inter-Regular',
      marginTop: 4,
      marginBottom: Spacing.s,
    },
    progressBg: {
      width: '100%',
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginTop: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: 4,
      borderRadius: 2,
    },
    progressLabel: {
      fontSize: 11,
      fontFamily: 'Inter-Regular',
      marginTop: 4,
    },

    centerBox: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.xl,
      gap: Spacing.m,
    },
    noTokenBox: {
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: Spacing.l,
    },
    noTokenEmoji: { fontSize: 48 },
    noTokenTitle: { ...TextVariants.h3, fontFamily: 'Inter-Bold', textAlign: 'center' },
    noTokenSubtitle: {
      ...TextVariants.secondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    connectBtn: {
      paddingHorizontal: Spacing.l,
      paddingVertical: Spacing.m,
      borderRadius: Radius.l,
      marginTop: Spacing.s,
    },
    connectBtnText: { color: '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 15 },

    statusText: { ...TextVariants.body, marginTop: Spacing.m },

    footerNote: {
      ...TextVariants.secondary,
      textAlign: 'center',
      marginTop: Spacing.l,
      lineHeight: 18,
    },
  });