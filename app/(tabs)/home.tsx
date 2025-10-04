import { ArrowRight01FreeIcons as ChevronRight, ClockIcon as Clock, HeadphonesIcon as Headphones, SmileIcon as Smile } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { TrendingUp } from 'lucide-react-native';

import React from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnimatedScreen from '@/components/AnimatedScreen';
import { Colors, Radius, Spacing, TextVariants } from '@/constants/theme';
import { usePlayer, type Session } from '@/context/PlayerContext';


export default function HomeDashboard() {
  // ✅ 2. GET THE START SESSION FUNCTION FROM THE GLOBAL CONTEXT
  const { startSession } = usePlayer();

  // ✅ 3. CREATE A HANDLER FUNCTION TO DEFINE AND START A SESSION
  const handleStartSession = () => {
    // This object defines what will be played.
    // In a real app, this could come from user selection or an ML model.
    const sessionToStart: Session = {
      id: 'home-focus-session',
      name: 'Quick Focus Session',
      category: 'Focus',
      frequency: 12,
      duration: 1800, // 30 minutes in seconds
    };
    
    // Call the global function to activate the player
    startSession(sessionToStart);
  };

  return (
    <AnimatedScreen>
    <LinearGradient
      colors={[Colors.dark.background, Colors.dark.cardDarker]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View>
            <Text style={styles.headerTitle}>Hi, Alex 👋</Text>
            <Text style={styles.headerSubtitle}>Ready to enhance your mind?</Text>
          </View>

          {/* Main Action Cards */}
          <View style={styles.cardsContainer}>
            {/* Start Session Card */}
            <View>
              {/* ✅ 4. ATTACH THE HANDLER TO THE ONPRESS EVENT OF THE BUTTON */}
              <Pressable onPress={() => router.push('/player')}>
                <LinearGradient
                  colors={[Colors.dark.primary, Colors.dark.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.mainCard}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.iconTextWrapper}>
                      <View style={[styles.iconContainer, styles.iconContainer3D, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <HugeiconsIcon icon={Headphones} size={32} color={Colors.dark.text} />
                      </View>
                      <View>
                        <Text style={styles.cardTitle}>Start Session</Text>
                        {/* --- MODIFICATION 1: Applied the NEW subtitle style here --- */}
                        <Text style={styles.cardSubtitlePrimary}>Begin your journey</Text>
                      </View>
                    </View>
                    <View style={styles.arrowIconContainerPrimary}>
                      <HugeiconsIcon icon={ChevronRight} size={24} color={Colors.dark.text} />
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
                      colors={[Colors.dark.primary, Colors.dark.secondary]}
                      style={[
                        styles.iconContainer,
                        styles.iconContainer3D,
                      ]}
                    >
                      <TrendingUp size={32} color={Colors.dark.text} />
                    </LinearGradient>
                    <View>
                      <Text style={styles.cardTitle}>Health Metrics</Text>
                      {/* Note: This subtitle uses the default style, which is fine on a dark background */}
                      <Text style={styles.cardSubtitle}>Track your progress</Text>
                    </View>
                  </View>
                  <View style={styles.arrowIconContainerSecondary}>
                    <HugeiconsIcon icon={ChevronRight} size={24} color={Colors.dark.textMedium} />
                  </View>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Last Session Preview */}
          <View style={styles.lastSessionContainer}>
            <Text style={styles.sectionTitle}>Last Session</Text>
            <View style={styles.statsGrid}>
              <LinearGradient colors={[Colors.dark.cardAccent, Colors.dark.card]} style={styles.statBox}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(139, 130, 255, 0.2)' }]}>
                  <HugeiconsIcon icon={Clock} size={24} color={Colors.dark.primary} />
                </View>
                <Text style={styles.statValue}>45 min</Text>
                <Text style={[styles.statLabel, { color: Colors.dark.primary }]}>Duration</Text>
              </LinearGradient>
              <LinearGradient colors={['#1A3833', Colors.dark.card]} style={styles.statBox}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(38, 205, 179, 0.2)' }]}>
                  <HugeiconsIcon icon={Smile} size={24} color={Colors.dark.secondary} />
                </View>
                <Text style={styles.statValue}>Great</Text>
                <Text style={[styles.statLabel, { color: Colors.dark.secondary }]}>Mood Rating</Text>
              </LinearGradient>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: Spacing.m, paddingBottom: 120 },
  headerTitle: { ...TextVariants.h1, marginBottom: Spacing.xs },
  headerSubtitle: { ...TextVariants.secondary, fontSize: 16, marginBottom: Spacing.l },
  cardsContainer: { gap: Spacing.m, marginBottom: Spacing.l },
  mainCard: { borderRadius: Radius.xl, padding: Spacing.m },
  secondaryCard: { backgroundColor: Colors.dark.card, borderRadius: Radius.xl, padding: Spacing.m, borderWidth: 1, borderColor: Colors.dark.border },
  cardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconTextWrapper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.m },
  iconContainer: { 
    width: 60, 
    height: 60, 
    borderRadius: Radius.l, 
    justifyContent: 'center', 
    alignItems: 'center',
    overflow: 'hidden',
  },
  iconContainer3D: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 16,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderTopWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  arrowIconContainerPrimary: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  arrowIconContainerSecondary: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: { ...TextVariants.h3 },
  cardSubtitle: { ...TextVariants.body, color: Colors.dark.textMedium },

  // --- MODIFICATION 2: Added this new style for the subtitle with text shadow ---
  cardSubtitlePrimary: {
    ...TextVariants.body,
    color: Colors.dark.text, // Using the main text color for brightness
    textShadowColor: 'rgba(0, 0, 0, 0.5)', // The color of the shadow
    textShadowOffset: { width: 0, height: 1 }, // How far the shadow is from the text
    textShadowRadius: 2, // The blurriness of the shadow
  },

  lastSessionContainer: { backgroundColor: Colors.dark.card, borderRadius: Radius.xl, padding: Spacing.m, borderWidth: 1, borderColor: Colors.dark.border },
  sectionTitle: { ...TextVariants.h3, marginBottom: Spacing.m },
  statsGrid: { flexDirection: 'row', gap: Spacing.m },
  statBox: { flex: 1, borderRadius: Radius.l, padding: Spacing.m, borderWidth: 1, borderColor: Colors.dark.border },
  statIconContainer: { width: 40, height: 40, borderRadius: Radius.m, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.s },
  statValue: { ...TextVariants.h2 },
  statLabel: { ...TextVariants.secondary },
});