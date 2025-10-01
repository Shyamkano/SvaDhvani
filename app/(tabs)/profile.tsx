import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Bell, ChevronLeft, ChevronRight, LogOut, Smartphone } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';


// Custom SVG icon imports
import HelpIcon from '../../components/icons/helpicons';
import SettingsIcon from '../../components/icons/settingicon';

// Import our design system
import { Colors, Radius, Spacing, TextVariants } from '../../constants/theme';

// --- Main Component ---
export default function ProfileSettings() {
  const [notifications, setNotifications] = useState(true);
  const [reminders, setReminders] = useState(true);

  return (
    <LinearGradient colors={[Colors.dark.background, Colors.dark.cardDarker]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" />
        <Header />

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <Animated.View entering={FadeInDown.duration(500).delay(100)}>
            <LinearGradient colors={[Colors.dark.primary, Colors.dark.secondary]} style={styles.profileCard}>
              <View style={styles.profileContent}>
                <View style={styles.avatarContainer}>
                  <Text style={{ fontSize: 40 }}>👤</Text>
                  <View style={styles.onlineIndicator} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>Alex Johnson</Text>
                  <Text style={styles.profileEmail}>alex.johnson@email.com</Text>
                  <View style={styles.streakBadge}>
                    <Text>🔥</Text>
                    <Text style={styles.streakText}>12 day streak</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Stats Grid */}
          <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.statsGrid}>
            <StatBox value="42" label="Sessions" />
            <StatBox value="28h" label="Total Time" />
            <StatBox value="8.5" label="Avg Mood" />
          </Animated.View>

          {/* Settings Section */}
          <Animated.View entering={FadeInDown.duration(500).delay(300)}>
            <Section title="Settings">
              <SettingsRow icon={<Bell color={Colors.dark.primary} />} title="Notifications" subtitle="Daily reminders">
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
                  thumbColor={Colors.dark.white}
                />
              </SettingsRow>
              <SettingsRow icon={<Bell color={Colors.dark.secondary} />} title="Session Reminders" subtitle="Remind me to practice">
                 <Switch
                  value={reminders}
                  onValueChange={setReminders}
                  trackColor={{ false: Colors.dark.border, true: Colors.dark.secondary }}
                  thumbColor={Colors.dark.white}
                />
              </SettingsRow>
            </Section>

            <Section title="Connect Devices">
              <SettingsRow icon={<Smartphone color={Colors.dark.accent} />} title="Google Fit" subtitle="Not connected" isPressable />
              <SettingsRow icon={<Smartphone color={Colors.dark.primary} />} title="Apple Health" subtitle="Connected" isPressable>
                <View style={styles.connectedDot} />
              </SettingsRow>
            </Section>

            <Section title="Other">
              <SettingsRow icon={<SettingsIcon />} title="Account Settings" subtitle="Manage your account" isPressable />
              <SettingsRow icon={<HelpIcon />} title="Help & Support" subtitle="Get help" isPressable />
              <Pressable style={[styles.rowContainer, { backgroundColor: `${Colors.dark.accent}20`, borderColor: `${Colors.dark.accent}50` }]}>
                <View style={styles.iconTextWrapper}>
                  <View style={[styles.iconContainer, { backgroundColor: `${Colors.dark.accent}20` }]}>
                    <LogOut color={Colors.dark.accent} />
                  </View>
                  <View>
                    <Text style={[styles.rowTitle, { color: Colors.dark.accent }]}>Log Out</Text>
                    <Text style={[styles.rowSubtitle, { color: `${Colors.dark.accent}99` }]}>Sign out of your account</Text>
                  </View>
                </View>
              </Pressable>
            </Section>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// --- Reusable Sub-Components ---
const Header = () => (
  <Animated.View entering={FadeInUp.duration(500)} style={styles.header}>
    <Pressable onPress={() => router.back()} style={styles.backButton}>
      <ChevronLeft size={28} color={Colors.dark.text} />
    </Pressable>
    <Text style={styles.headerTitle}>Profile</Text>
    <View style={{ width: 48 }} />
  </Animated.View>
);

const StatBox = ({ value, label }: { value: string; label: string }) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const SettingsRow = ({ icon, title, subtitle, isPressable, children }: any) => (
  <Pressable style={styles.rowContainer}>
    <View style={styles.iconTextWrapper}>
      <View style={styles.iconContainer}>{icon}</View>
      <View>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
    </View>
    {isPressable ? <ChevronRight color={Colors.dark.textMedium} /> : children}
  </Pressable>
);

// --- StyleSheet ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.m, paddingTop: Spacing.m, paddingBottom: Spacing.s },
  backButton: { width: 48, height: 48, borderRadius: Radius.l, backgroundColor: Colors.dark.card, borderWidth: 1, borderColor: Colors.dark.border, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...TextVariants.h3 },
  scrollContainer: { padding: Spacing.m, paddingBottom: 100 },
  profileCard: { borderRadius: Radius.xl, padding: Spacing.m, marginBottom: Spacing.l },
  profileContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.m },
  avatarContainer: {
    width: 80, height: 80, borderRadius: Radius.l, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center'
  },
  onlineIndicator: {
    position: 'absolute', bottom: 4, right: 4, width: 16, height: 16,
    borderRadius: 8, backgroundColor: Colors.dark.secondary, borderWidth: 2, borderColor: 'white'
  },
  profileName: { ...TextVariants.h2, color: Colors.dark.white },
  profileEmail: { ...TextVariants.secondary, color: 'rgba(255,255,255,0.9)', marginBottom: Spacing.s },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.s,
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs, borderRadius: Radius.m, alignSelf: 'flex-start'
  },
  streakText: { ...TextVariants.label, color: Colors.dark.white },
  statsGrid: { flexDirection: 'row', gap: Spacing.m, marginBottom: Spacing.l },
  statBox: {
    flex: 1, backgroundColor: Colors.dark.card, borderWidth: 1,
    borderColor: Colors.dark.border, borderRadius: Radius.l,
    padding: Spacing.m, alignItems: 'center'
  },
  statValue: { ...TextVariants.h2 },
  statLabel: { ...TextVariants.secondary, color: Colors.dark.textMedium },
  sectionContainer: { marginBottom: Spacing.l },
  sectionTitle: { ...TextVariants.h3, marginBottom: Spacing.m },
  rowContainer: {
    backgroundColor: Colors.dark.card, borderWidth: 1, borderColor: Colors.dark.border,
    borderRadius: Radius.l, padding: Spacing.m, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.m
  },
  iconTextWrapper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.m },
  iconContainer: {
    width: 48, height: 48, borderRadius: Radius.m,
    backgroundColor: Colors.dark.cardAccent, justifyContent: 'center', alignItems: 'center'
  },
  rowTitle: { ...TextVariants.body, fontWeight: '600' },
  rowSubtitle: { ...TextVariants.secondary },
  connectedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.dark.secondary },
});