import { Calendar01FreeIcons, ArrowLeft01FreeIcons as ChevronLeft, HeartCheckIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnimatedScreen from '@/components/AnimatedScreen';
import { Colors, Radius, Spacing, TextVariants } from '../../constants/theme';

// --- Mock Data (No Changes) ---
const moodData = [
  { value: 6.5, label: 'Mon' }, { value: 7.2, label: 'Tue' },
  { value: 7.8, label: 'Wed' }, { value: 8.5, label: 'Thu' },
  { value: 8.0, label: 'Fri' }, { value: 8.8, label: 'Sat' },
  { value: 9.0, label: 'Sun' },
];
const sessionData = [
  { value: 30, label: 'Mon' }, { value: 45, label: 'Tue' },
  { value: 40, label: 'Wed' }, { value: 60, label: 'Thu' },
  { value: 35, label: 'Fri' }, { value: 50, label: 'Sat' },
  { value: 45, label: 'Sun' },
];

// --- Main Component ---
export default function HealthMetrics() {
  return (
    <AnimatedScreen>
      <LinearGradient colors={[Colors.dark.background, Colors.dark.cardDarker]} style={styles.container}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <StatusBar barStyle="light-content" />
          
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <HugeiconsIcon icon={ChevronLeft} size={28} color={Colors.dark.text} />
            </Pressable>
            <Text style={styles.headerTitle}>Health Metrics</Text>
            <View style={{ width: 48 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.quickStatsGrid}>
              <StatCard icon={<HugeiconsIcon icon={HeartCheckIcon} size={28} color={Colors.dark.accent} />} value="72 bpm" label="Avg Heart Rate" trend="-5%" colors={['#3A3425', Colors.dark.card]} borderColor="rgba(255, 209, 102, 0.3)" />
              <StatCard icon={<HugeiconsIcon icon={Calendar01FreeIcons} size={28} color={Colors.dark.primary} />} value="6/7 days" label="Consistency" trend="🔥 Keep it up!" colors={[Colors.dark.cardAccent, Colors.dark.card]} borderColor="rgba(139, 130, 255, 0.3)" />
            </View>

            {/* --- MODIFICATION: Updated Chart Cards --- */}
            <ChartCard title="Mood Improvement" subtitle="Last 7 days" tag="+38%" tagColor={Colors.dark.secondary}>
              <LineChart
                              data={moodData} height={150} areaChart
                              startFillColor={Colors.dark.primary} endFillColor={Colors.dark.secondary}
                              startOpacity={0.7} endOpacity={0.1}
                              color={Colors.dark.primary} thickness={3}
                              xAxisLabelTextStyle={styles.chartAxisLabel}
                              yAxisTextStyle={styles.chartAxisLabel}
                              xAxisColor="transparent" yAxisColor="transparent" // Hide axes
                              maxValue={10} noOfSections={5}
                              pointerConfig={{
                                pointerStripHeight: 150,
                                pointerStripColor: 'rgba(255, 255, 255, 0.1)',
                                pointerComponent: () => <CustomPointer />,
                                pointerLabelComponent: (items: any) => <Tooltip value={items[0].value.toFixed(1)} />,
                              }}
                            />            </ChartCard>

            <ChartCard title="Session Duration" subtitle="Minutes per day" tag="43 min avg" tagColor={Colors.dark.primary}>
              <BarChart
                data={sessionData} height={150} barWidth={22} barBorderRadius={6}
                frontColor={Colors.dark.secondary} gradientColor={Colors.dark.primary}
                renderTooltip={(item: any) => <Tooltip value={`${item.value}`} unit=" min" />}
                xAxisLabelTextStyle={styles.chartAxisLabel}
                yAxisTextStyle={styles.chartAxisLabel}
                xAxisColor="transparent" yAxisColor="transparent" // Hide axes
                yAxisLabelWidth={0} // Remove space for y-axis labels
                noOfSections={4}
              />
            </ChartCard>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </AnimatedScreen>
  );
}

// --- Reusable Sub-Components ---
const StatCard = ({ icon, value, label, trend, colors, borderColor }: any) => {
  const isPercentageTrend = typeof trend === 'string' && trend.includes('%');
  return (
    <LinearGradient colors={colors} style={[styles.statCard, { borderColor }]}>
      <View style={styles.statIconContainer}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.trendContainer}>
        {isPercentageTrend && <TrendingUp size={14} color={Colors.dark.secondary} />}
        <Text style={[styles.trendText, { color: isPercentageTrend ? Colors.dark.secondary : Colors.dark.primary }]}>{trend}</Text>
      </View>
    </LinearGradient>
  );
};

// --- MODIFICATION: Refactored ChartCard for the "Glowing Border" effect ---
const ChartCard = ({ title, subtitle, tag, tagColor, children }: any) => (
  <LinearGradient colors={[`${tagColor}50`, Colors.dark.border]} style={styles.chartCardBorderGradient}>
    <View style={styles.chartCardInnerContainer}>
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartTitle}>{title}</Text>
          <Text style={styles.chartSubtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.chartTag, { backgroundColor: `${tagColor}20` }]}>
          <Text style={[styles.chartTagText, { color: tagColor }]}>{tag}</Text>
        </View>
      </View>
      <View style={{ paddingLeft: Spacing.s, paddingTop: Spacing.m }}>
        {children}
      </View>
    </View>
  </LinearGradient>
);

// --- NEW: Polished, reusable components for chart interactions ---
const Tooltip = ({ value, unit = '' }: { value: string; unit?: string }) => (
  <LinearGradient colors={[Colors.dark.cardDarker, Colors.dark.card]} style={styles.tooltip}>
    <Text style={styles.tooltipValue}>{value}<Text style={styles.tooltipUnit}>{unit}</Text></Text>
  </LinearGradient>
);

const CustomPointer = () => (
  <View style={styles.pointerContainer}>
    <LinearGradient colors={[Colors.dark.primary, Colors.dark.secondary]} style={styles.pointerDot} />
  </View>
);

// --- StyleSheet ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.m, paddingTop: Spacing.m, paddingBottom: Spacing.s },
  backButton: { width: 48, height: 48, borderRadius: Radius.l, backgroundColor: Colors.dark.card, borderWidth: 1, borderColor: Colors.dark.border, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...TextVariants.h3, fontFamily: 'Inter-Bold' },
  scrollContainer: { padding: Spacing.m, paddingBottom: 100 },
  quickStatsGrid: { flexDirection: 'row', gap: Spacing.m, marginBottom: Spacing.l },
  statCard: { flex: 1, borderRadius: Radius.l, padding: Spacing.m, borderWidth: 1 },
  statIconContainer: { marginBottom: Spacing.s, width: 48, height: 48, borderRadius: Radius.m, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  statValue: { ...TextVariants.h2, fontFamily: 'Inter-Bold' },
  statLabel: { ...TextVariants.secondary, fontFamily: 'Inter-Regular', color: Colors.dark.textMedium },
  trendContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.s },
  trendText: { ...TextVariants.secondary, fontFamily: 'Inter-Medium' },

  // --- MODIFICATION: Styles for the new ChartCard design ---
  chartCardBorderGradient: {
    borderRadius: Radius.xl,
    padding: 1, // This creates the border effect
    marginBottom: Spacing.l,
  },
  chartCardInnerContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.xl,
    padding: Spacing.m,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartTitle: { ...TextVariants.h3, fontFamily: 'Inter-Bold' },
  chartSubtitle: { ...TextVariants.secondary, fontFamily: 'Inter-Regular' },
  chartTag: { paddingHorizontal: Spacing.m, paddingVertical: Spacing.xs, borderRadius: Radius.m },
  chartTagText: { fontFamily: 'Inter-Bold', fontSize: 12 },
  chartAxisLabel: { color: 'white', fontSize: 12 },
  
  // --- MODIFICATION: New styles for improved tooltips and pointers ---
  tooltip: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    borderRadius: Radius.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  tooltipValue: {
    fontFamily: 'Inter-Bold',
    color: Colors.dark.text,
    fontSize: 16,
  },
  tooltipUnit: {
    fontFamily: 'Inter-Regular',
    color: Colors.dark.textMedium,
    fontSize: 14,
  },
  pointerContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${Colors.dark.primary}50`, // Outer glow
  },
  pointerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});