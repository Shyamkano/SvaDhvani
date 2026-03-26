import { ArrowRight01FreeIcons as ChevronRight, ClockIcon as Clock, HeadphonesIcon as Headphones, SmileIcon as Smile } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { TrendingUp } from 'lucide-react-native';

import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnimatedScreen from '@/components/AnimatedScreen';
import { Radius, Spacing, TextVariants } from '@/constants/theme';
import { usePlayer, type Session } from '@/context/PlayerContext';
import { useThemeColors } from '@/hooks/use-theme-color';
import { supabase } from '@/lib/supabase';

export default function HomeDashboard() {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const { startSession } = usePlayer();
  const [profile, setProfile] = useState<any>(null);

  const [lastSession, setLastSession] = useState<any>(null);

  useEffect(() => {
    const fetchProfileAndSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: pData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (pData) setProfile(pData);

        const { data: sData } = await supabase.from('sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();
        if (sData) setLastSession(sData);
      }
    };
    fetchProfileAndSession();
  }, []);



  const handleStartSession = () => {
    const sessionToStart: Session = {
      id: 'home-focus-session',
      name: 'Quick Focus Session',
      category: 'Focus',
      frequency: 12,
      duration: 1800, // 30 minutes in seconds
    };

    startSession(sessionToStart);
  };

  return (
    <AnimatedScreen>
      <LinearGradient
        colors={[colors.background, colors.cardDarker]}
        style={styles.container}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar barStyle={colors.background === '#FFFFFF' || colors.background === '#F8F9FA' ? 'dark-content' : 'light-content'} />
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Header */}
            <View>
              <Text style={styles.headerTitle}>Hi, {profile ? profile.name : ''} </Text>
              <Text style={styles.headerSubtitle}>Ready to enhance your mind?</Text>
            </View>

            {/* Main Action Cards */}
            <View style={styles.cardsContainer}>
              {/* Start Session Card */}
              <View>
                <Pressable onPress={() => router.push('/player')}>
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.mainCard}
                  >
                    <View style={styles.cardContent}>
                      <View style={styles.iconTextWrapper}>
                        <View style={[styles.iconContainer, styles.iconContainer3D, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                          <HugeiconsIcon icon={Headphones} size={32} color={colors.text} />
                        </View>
                        <View>
                          <Text style={[styles.cardTitle, { color: colors.text }]}>Start Session</Text>
                          <Text style={styles.cardSubtitlePrimary}>Begin your journey</Text>
                        </View>
                      </View>
                      <View style={styles.arrowIconContainerPrimary}>
                        <HugeiconsIcon icon={ChevronRight} size={24} color={colors.text} />
                      </View>
                    </View>
                  </LinearGradient>
                </Pressable>
              </View>

              {/* Health Metrics Card */}
              <View>
                <Pressable style={styles.secondaryCard} onPress={() => router.push('/metrics')}>
                  <View style={styles.cardContent}>
                    <View style={styles.iconTextWrapper}>
                      <LinearGradient
                        colors={[colors.primary, colors.secondary]}
                        style={[
                          styles.iconContainer,
                          styles.iconContainer3D,
                        ]}
                      >
                        <TrendingUp size={32} color={colors.text} />
                      </LinearGradient>
                      <View>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>Health Metrics</Text>
                        <Text style={styles.cardSubtitle}>Track your progress</Text>
                      </View>
                    </View>
                    <View style={styles.arrowIconContainerSecondary}>
                      <HugeiconsIcon icon={ChevronRight} size={24} color={colors.textMedium} />
                    </View>
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Last Session Preview */}
            <View style={styles.lastSessionContainer}>
              <Text style={styles.sectionTitle}>Last Session</Text>
              <View style={styles.statsGrid}>
                <LinearGradient colors={[colors.cardAccent, colors.card]} style={styles.statBox}>
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(139, 130, 255, 0.2)' }]}>
                    <HugeiconsIcon icon={Clock} size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.statValue}>{lastSession ? `${Math.round(lastSession.duration / 60)} min` : '--'}</Text>
                  <Text style={[styles.statLabel, { color: colors.primary }]}>Duration</Text>
                </LinearGradient>
                <LinearGradient colors={['#1A3833', colors.card]} style={styles.statBox}>
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(38, 205, 179, 0.2)' }]}>
                    <HugeiconsIcon icon={Smile} size={24} color={colors.secondary} />
                  </View>
                  <Text style={styles.statValue}>
                    {lastSession?.metadata?.base_mood ?
                      (Number(lastSession.metadata.base_mood) >= 8 ? 'Great' : Number(lastSession.metadata.base_mood) >= 5 ? 'Good' : 'Poor')
                      : (lastSession ? 'Great' : '--')}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.secondary }]}>Mood Rating</Text>
                </LinearGradient>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </AnimatedScreen>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: Spacing.m, paddingBottom: 120 },
  headerTitle: { ...TextVariants.h1, color: colors.text, marginBottom: Spacing.xs },
  headerSubtitle: { ...TextVariants.secondary, color: colors.textMedium, fontSize: 16, marginBottom: Spacing.l },
  cardsContainer: { gap: Spacing.m, marginBottom: Spacing.l },
  mainCard: { borderRadius: Radius.xl, padding: Spacing.m },
  secondaryCard: { backgroundColor: colors.card, borderRadius: Radius.xl, padding: Spacing.m, borderWidth: 1, borderColor: colors.border },
  cardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconTextWrapper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.m },
  iconContainer: {
    width: 60, height: 60, borderRadius: Radius.l, justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
  },
  iconContainer3D: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 16,
    borderColor: 'rgba(255, 255, 255, 0.2)', borderTopWidth: 1.5, borderLeftWidth: 1, borderRightWidth: 1,
  },
  arrowIconContainerPrimary: {
    width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  arrowIconContainerSecondary: {
    width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: { ...TextVariants.h3 },
  cardSubtitle: { ...TextVariants.body, color: colors.textMedium },
  cardSubtitlePrimary: {
    ...TextVariants.body, color: colors.text, textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  lastSessionContainer: { backgroundColor: colors.card, borderRadius: Radius.xl, padding: Spacing.m, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { ...TextVariants.h3, color: colors.text, marginBottom: Spacing.m },
  statsGrid: { flexDirection: 'row', gap: Spacing.m },
  statBox: { flex: 1, borderRadius: Radius.l, padding: Spacing.m, borderWidth: 1, borderColor: colors.border },
  statIconContainer: { width: 40, height: 40, borderRadius: Radius.m, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.s },
  statValue: { ...TextVariants.h2, color: colors.text },
  statLabel: { ...TextVariants.secondary },
});
