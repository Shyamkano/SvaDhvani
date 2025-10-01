import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our design system
import { Calendar01FreeIcons, HeartAddFreeIcons } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Colors, Radius, Spacing, TextVariants } from '../../constants/theme';

// --- Mock Data (Formatted for Gifted Charts) ---
const moodData = [
  { value: 6.5, label: 'Mon' }, { value: 7.2, label: 'Tue' },
  { value: 7.8, label: 'Wed' }, { value: 8.5, label: 'Thu' },
  { value: 8.0, label: 'Fri' }, { value: 8.8, label: 'Sat' },
  { value: 9.0, label: 'Sun' },
];

// ✅ FIXED: The data is now clean and consistent.
const sessionData = [
  { value: 30, label: 'Mon' }, { value: 45, label: 'Tue' },
  { value: 40, label: 'Wed' }, { value: 60, label: 'Thu' },
  { value: 35, label: 'Fri' }, { value: 50, label: 'Sat' },
  { value: 45, label: 'Sun' },
];

// --- Main Component ---
export default function HealthMetrics() {
  return (
    <LinearGradient colors={[Colors.dark.background, Colors.dark.cardDarker]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" />
        
        <Animated.View entering={FadeInUp.duration(500)} style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color={Colors.dark.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Health Metrics</Text>
          <View style={{ width: 48 }} />
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.quickStatsGrid}>
            <StatCard icon={<HugeiconsIcon icon={HeartAddFreeIcons} size={28} color={Colors.dark.accent} />} value="72 bpm" label="Avg Heart Rate" trend="-5%" colors={['#3A3425', Colors.dark.card]} borderColor="rgba(255, 209, 102, 0.3)" />
            <StatCard icon={<HugeiconsIcon icon={Calendar01FreeIcons} size={28} color={Colors.dark.primary} />} value="6/7 days" label="Consistency" trend="🔥 Keep it up!" colors={[Colors.dark.cardAccent, Colors.dark.card]} borderColor="rgba(139, 130, 255, 0.3)" />
          </Animated.View>

          <ChartCard title="Mood Improvement" subtitle="Last 7 days" tag="+38%" tagColor={Colors.dark.secondary}>
            <LineChart
              data={moodData} height={150} areaChart
              startFillColor={Colors.dark.primary} endFillColor={Colors.dark.secondary}
              startOpacity={0.8} endOpacity={0.2} color={Colors.dark.primary}
              thickness={4} dataPointsColor={Colors.dark.primary} dataPointsRadius={5}
              xAxisLabelTextStyle={styles.chartAxisLabel} yAxisLabelTextStyle={styles.chartAxisLabel}
              xAxisColor={Colors.dark.border} yAxisColor={Colors.dark.border}
              rulesColor={Colors.dark.border} rulesType="dashed"
              maxValue={10} noOfSections={5}
              pointerConfig={{
                pointerColor: Colors.dark.text, radius: 6, pointerLabelWidth: 100, pointerLabelHeight: 40,
                pointerLabelComponent: (items: any) => (
                  <View style={styles.tooltip}><Text style={styles.tooltipText}>{items[0].value}</Text></View>
                ),
              }}
            />
          </ChartCard>

          <ChartCard title="Session Duration" subtitle="Minutes per day" tag="43 min avg" tagColor={Colors.dark.primary}>
            {/* ✅ FIXED: Using renderTooltip for a better, more stable experience */}
            <BarChart
              data={sessionData} height={150} barWidth={25} barBorderRadius={8}
              frontColor={'#1A3833'} // A subtle base color
              gradientColor={Colors.dark.primary}
              renderTooltip={(item: any) => (
                <View style={styles.tooltip}><Text style={styles.tooltipText}>{item.value} min</Text></View>
              )}
              xAxisLabelTextStyle={styles.chartAxisLabel} yAxisLabelTextStyle={styles.chartAxisLabel}
              xAxisColor={Colors.dark.border} yAxisColor={Colors.dark.border}
              rulesColor={Colors.dark.border} rulesType="dashed" noOfSections={4}
            />
          </ChartCard>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
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

const ChartCard = ({ title, subtitle, tag, tagColor, children }: any) => (
  <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.chartContainer}>
    <View style={styles.chartHeader}>
      <View>
        <Text style={styles.chartTitle}>{title}</Text>
        <Text style={styles.chartSubtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.chartTag, { backgroundColor: `${tagColor}20`, borderColor: `${tagColor}50` }]}>
        <Text style={[styles.chartTagText, { color: tagColor }]}>{tag}</Text>
      </View>
    </View>
    <View style={{ paddingLeft: Spacing.s, paddingTop: Spacing.m }}>
      {children}
    </View>
  </Animated.View>
);

// --- StyleSheet ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.m, paddingTop: Spacing.m, paddingBottom: Spacing.s },
  backButton: { width: 48, height: 48, borderRadius: Radius.l, backgroundColor: Colors.dark.card, borderWidth: 1, borderColor: Colors.dark.border, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...TextVariants.h3 },
  scrollContainer: { padding: Spacing.m, paddingBottom: 100 },
  quickStatsGrid: { flexDirection: 'row', gap: Spacing.m, marginBottom: Spacing.l },
  statCard: { flex: 1, borderRadius: Radius.l, padding: Spacing.m, borderWidth: 1 },
  statIconContainer: { marginBottom: Spacing.s, width: 48, height: 48, borderRadius: Radius.m, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  statValue: { ...TextVariants.h2 },
  statLabel: { ...TextVariants.secondary, color: Colors.dark.textMedium },
  trendContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.s },
  trendText: { ...TextVariants.label, fontSize: 12 },
  chartContainer: { backgroundColor: Colors.dark.card, borderRadius: Radius.xl, padding: Spacing.m, borderWidth: 1, borderColor: Colors.dark.border, marginBottom: Spacing.l },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartTitle: { ...TextVariants.h3 },
  chartSubtitle: { ...TextVariants.secondary },
  chartTag: { paddingHorizontal: Spacing.m, paddingVertical: Spacing.xs, borderRadius: Radius.m, borderWidth: 1 },
  chartTagText: { ...TextVariants.label, fontSize: 14 },
  chartAxisLabel: { color: Colors.dark.textMedium, fontSize: 12 },
  tooltip: { paddingHorizontal: Spacing.m, paddingVertical: Spacing.xs, borderRadius: Radius.s, backgroundColor: Colors.dark.cardDarker, borderWidth: 1, borderColor: Colors.dark.border },
  tooltipText: { ...TextVariants.body, color: Colors.dark.text, textAlign: 'center' },
});