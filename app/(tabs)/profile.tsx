import { Notification01FreeIcons as Bell, ArrowLeft01FreeIcons as ChevronLeft, ArrowRight01FreeIcons as ChevronRight, LogoutIcon as LogOut, SmartPhone01FreeIcons as Smartphone } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StatusBar, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnimatedScreen from '@/components/AnimatedScreen';
import HelpIcon from '../../components/icons/helpicons';
import SettingsIcon from '../../components/icons/settingicon';

import { useThemeColors } from '@/hooks/use-theme-color';
import { useGoogleFitAuth } from '@/hooks/useGoogleFitAuth';
import { useThemeStore } from '@/hooks/useThemeStore';
import { Radius, Spacing, TextVariants } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

type Profile = { name: string; last: string; email: string };

// --- Main Component ---
export default function ProfileSettings() {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [notifications, setNotifications] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const { themeMode, setThemeMode } = useThemeStore();
  const [totalSessions, setTotalSessions] = useState('0');
  const [totalTimeStr, setTotalTimeStr] = useState('0h');
  const [avgMood, setAvgMood] = useState('8.5');

  const [isGoogleFitConnected, setIsGoogleFitConnected] = useState(false);
  const { isConnecting, connect, disconnect } = useGoogleFitAuth();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, last, email')
          .eq('id', user.id)
          .single();
        if (profileData) setProfile(profileData as any);

        const { data: sessions } = await supabase
          .from('sessions')
          .select('duration, metadata')
          .eq('user_id', user.id);

        if (sessions && sessions.length > 0) {
          setTotalSessions(sessions.length.toString());

          let totalSecs = 0;
          let moodSum = 0;
          let moodCount = 0;

          sessions.forEach(s => {
            totalSecs += (s.duration || 1800);
            if (s.metadata && s.metadata.base_mood !== undefined) {
              moodSum += Number(s.metadata.base_mood);
              moodCount++;
            }
          });

          const hours = Math.round(totalSecs / 3600);
          setTotalTimeStr(`${hours}h`);

          if (moodCount > 0) {
            setAvgMood((moodSum / moodCount).toFixed(1));
          } else {
            setAvgMood('8.5');
          }
        }

        const { error: tokenError, count } = await supabase
          .from('user_google_tokens')
          .select('id', { count: 'exact', head: true })
          .eq('id', user.id);

        setIsGoogleFitConnected(count !== null && count > 0);
      }
      setIsProfileLoading(false);
    };
    fetchData();
  }, [isConnecting]);

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.replace('/login');
    }
  }

  const handleGoogleFitPress = async () => {
    if (isGoogleFitConnected) {
      await disconnect();
      setIsGoogleFitConnected(false);
    } else {
      await connect();
      // Re-check if the token was actually saved
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { count } = await supabase
          .from('user_google_tokens')
          .select('id', { count: 'exact', head: true })
          .eq('id', user.id);
        setIsGoogleFitConnected(count !== null && count > 0);
      }
    }
  }

  return (
    <AnimatedScreen>
      <LinearGradient colors={[colors.background, colors.cardDarker]} style={styles.container}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <StatusBar barStyle={colors.background === '#FFFFFF' || colors.background === '#F8F9FA' ? 'dark-content' : 'light-content'} />
          <Header />

          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* Profile Card */}
            <View>
              <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.profileCard}>
                <View style={styles.profileContent}>
                  <View style={[styles.avatarContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Text style={{ fontSize: 40 }}>👤</Text>
                    <View style={[styles.onlineIndicator, { backgroundColor: colors.secondary }]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.profileName}>{`${profile?.name || ''} ${profile?.last || ''}`.trim()}</Text>
                    <Text style={styles.profileEmail}>{profile?.email || 'No email provided'}</Text>
                    <View style={styles.streakBadge}>
                      <Text>🔥</Text>
                      <Text style={styles.streakText}>12 day streak</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <StatBox value={totalSessions} label="Sessions" />
              <StatBox value={totalTimeStr} label="Total Time" />
              <StatBox value={avgMood} label="Avg Mood" />
            </View>

            {/* Settings Section */}
            <View>
              <Section title="Theme">
                <View style={styles.themeToggleContainer}>
                  <Pressable
                    style={[styles.themeOption, themeMode === 'system' && { backgroundColor: colors.cardAccent, borderColor: colors.primary }]}
                    onPress={() => setThemeMode('system')}
                  >
                    <Text style={[styles.themeOptionText, { color: themeMode === 'system' ? colors.primary : colors.textMedium }]}>System</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.themeOption, themeMode === 'light' && { backgroundColor: colors.cardAccent, borderColor: colors.primary }]}
                    onPress={() => setThemeMode('light')}
                  >
                    <Text style={[styles.themeOptionText, { color: themeMode === 'light' ? colors.primary : colors.textMedium }]}>Light</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.themeOption, themeMode === 'dark' && { backgroundColor: colors.cardAccent, borderColor: colors.primary }]}
                    onPress={() => setThemeMode('dark')}
                  >
                    <Text style={[styles.themeOptionText, { color: themeMode === 'dark' ? colors.primary : colors.textMedium }]}>Dark</Text>
                  </Pressable>
                </View>
              </Section>

              <Section title="Settings">
                <SettingsRow icon={<HugeiconsIcon icon={Bell} color={colors.primary} />} title="Notifications" subtitle="Daily reminders">
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={'#FFFFFF'}
                  />
                </SettingsRow>
                <SettingsRow icon={<HugeiconsIcon icon={Bell} color={colors.secondary} />} title="Session Reminders" subtitle="Remind me to practice">
                  <Switch
                    value={reminders}
                    onValueChange={setReminders}
                    trackColor={{ false: colors.border, true: colors.secondary }}
                    thumbColor={'#FFFFFF'}
                  />
                </SettingsRow>
              </Section>

              <Section title="Connect Devices">
                <Pressable
                  style={styles.rowContainer}
                  onPress={handleGoogleFitPress}
                  disabled={isConnecting}
                >
                  <View style={styles.iconTextWrapper}>
                    <View style={[styles.iconContainer, { backgroundColor: isGoogleFitConnected ? `${colors.secondary}20` : colors.cardAccent }]}>
                      <HugeiconsIcon icon={Smartphone} size={24} color={isGoogleFitConnected ? colors.secondary : colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.rowTitle}>Google Fit</Text>
                      <Text style={[styles.rowSubtitle, { color: isGoogleFitConnected ? colors.secondary : colors.textMedium }]}>
                        {isConnecting ? "Connecting..." : isGoogleFitConnected ? 'Connected' : 'Not Connected'}
                      </Text>
                    </View>
                  </View>
                  {isConnecting ?
                    <ActivityIndicator size="small" color={colors.primary} /> : isGoogleFitConnected ? <View style={[styles.connectedDot, { backgroundColor: colors.secondary }]} /> : <HugeiconsIcon icon={ChevronRight} size={20} color={colors.textMedium} />}
                </Pressable>

                <SettingsRow icon={<HugeiconsIcon icon={Smartphone} color={colors.primary} />} title="Apple Health" subtitle="Connected" isPressable isActive>
                  <View style={[styles.connectedDot, { backgroundColor: colors.secondary }]} />
                </SettingsRow>
              </Section>

              <Section title="Other">
                <SettingsRow icon={<SettingsIcon />} title="Account Settings" subtitle="Manage your account" isPressable />
                <SettingsRow icon={<HelpIcon />} title="Help & Support" subtitle="Get help" isPressable />
                <Pressable onPress={signOut} style={[styles.rowContainer, { backgroundColor: `${colors.destructive}15`, borderColor: `${colors.destructive}30` }]}>
                  <View style={styles.iconTextWrapper}>
                    <View style={[styles.iconContainer, { backgroundColor: `${colors.destructive}20` }]}>
                      <HugeiconsIcon icon={LogOut} color={colors.destructive} />
                    </View>
                    <View>
                      <Text style={[styles.rowTitle, { color: colors.destructive }]}>Log Out</Text>
                      <Text style={[styles.rowSubtitle, { color: `${colors.destructive}99` }]}>Sign out of your account</Text>
                    </View>
                  </View>
                </Pressable>
              </Section>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </AnimatedScreen>
  );
}

// --- Reusable Sub-Components ---
const Header = () => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <HugeiconsIcon icon={ChevronLeft} size={28} color={colors.text} />
      </Pressable>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
      <View style={{ width: 48 }} />
    </View>
  );
};

const StatBox = ({ value, label }: { value: string; label: string }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMedium }]}>{label}</Text>
    </View>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
};

const SettingsRow = ({ icon, title, subtitle, isPressable, children }: any) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  return (
    <Pressable style={styles.rowContainer}>
      <View style={styles.iconTextWrapper}>
        <View style={styles.iconContainer}>{icon}</View>
        <View>
          <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.rowSubtitle, { color: colors.textMedium }]}>{subtitle}</Text>
        </View>
      </View>
      {isPressable ? <HugeiconsIcon icon={ChevronRight} color={colors.textMedium} /> : children}
    </Pressable>
  );
};

// --- StyleSheet ---
const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.m, paddingTop: Spacing.m, paddingBottom: Spacing.s },
  backButton: { width: 48, height: 48, borderRadius: Radius.l, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
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
    borderRadius: 8, backgroundColor: colors.secondary, borderWidth: 2, borderColor: '#FFFFFF'
  },
  profileName: { ...TextVariants.h2, color: '#FFFFFF' },
  profileEmail: { ...TextVariants.secondary, color: 'rgba(255,255,255,0.9)', marginBottom: Spacing.s },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.s,
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs, borderRadius: Radius.m, alignSelf: 'flex-start'
  },
  streakText: { ...TextVariants.label, color: '#FFFFFF' },
  statsGrid: { flexDirection: 'row', gap: Spacing.m, marginBottom: Spacing.l },
  statBox: {
    flex: 1, backgroundColor: colors.card, borderWidth: 1,
    borderColor: colors.border, borderRadius: Radius.l,
    padding: Spacing.m, alignItems: 'center'
  },
  statValue: { ...TextVariants.h2 },
  statLabel: { ...TextVariants.secondary, color: colors.textMedium },
  sectionContainer: { marginBottom: Spacing.l },
  sectionTitle: { ...TextVariants.h3, marginBottom: Spacing.m },
  rowContainer: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: Radius.l, padding: Spacing.m, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.m
  },
  iconTextWrapper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.m },
  iconContainer: {
    width: 48, height: 48, borderRadius: Radius.m,
    backgroundColor: colors.cardAccent, justifyContent: 'center', alignItems: 'center'
  },
  rowTitle: { ...TextVariants.body, fontWeight: '600' },
  rowSubtitle: { ...TextVariants.secondary },
  connectedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary },
  themeToggleContainer: { flexDirection: 'row', gap: Spacing.s, marginBottom: Spacing.m },
  themeOption: { flex: 1, padding: Spacing.m, borderRadius: Radius.m, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  themeOptionText: { ...TextVariants.body, fontWeight: '600' },
});
