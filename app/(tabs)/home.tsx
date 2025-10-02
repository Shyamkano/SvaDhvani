import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Clock, Headphones, Smile, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <LinearGradient
      colors={[Colors.dark.background, Colors.dark.cardDarker]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <Animated.View entering={FadeInUp.duration(600)}>
            <Text style={styles.headerTitle}>Hi, Alex 👋</Text>
            <Text style={styles.headerSubtitle}>Ready to enhance your mind?</Text>
          </Animated.View>

          {/* Main Action Cards */}
          <View style={styles.cardsContainer}>
            {/* Start Session Card */}
            <Animated.View entering={FadeInDown.duration(600).delay(100)}>
              {/* ✅ 4. ATTACH THE HANDLER TO THE ONPRESS EVENT OF THE BUTTON */}
              <Pressable onPress={handleStartSession}>
                <LinearGradient
                  colors={[Colors.dark.primary, Colors.dark.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.mainCard}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.iconTextWrapper}>
                      <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <Headphones size={32} color={Colors.dark.text} />
                      </View>
                      <View>
                        <Text style={styles.cardTitle}>Start Session</Text>
                        <Text style={styles.cardSubtitle}>Begin your journey</Text>
                      </View>
                    </View>
                    <ChevronRight size={24} color={Colors.dark.textMedium} />
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* Health Metrics Card */}
            <Animated.View entering={FadeInDown.duration(600).delay(200)}>
              <Pressable style={styles.secondaryCard} /* onPress could navigate to metrics */>
                <View style={styles.cardContent}>
                  <View style={styles.iconTextWrapper}>
                    <LinearGradient colors={[Colors.dark.primary, Colors.dark.secondary]} style={styles.iconContainer}>
                      <TrendingUp size={32} color={Colors.dark.text} />
                    </LinearGradient>
                    <View>
                      <Text style={styles.cardTitle}>Health Metrics</Text>
                      <Text style={styles.cardSubtitle}>Track your progress</Text>
                    </View>
                  </View>
                  <ChevronRight size={24} color={Colors.dark.textMedium} />
                </View>
              </Pressable>
            </Animated.View>
          </View>

          {/* Last Session Preview */}
          <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.lastSessionContainer}>
            <Text style={styles.sectionTitle}>Last Session</Text>
            <View style={styles.statsGrid}>
              <LinearGradient colors={[Colors.dark.cardAccent, Colors.dark.card]} style={styles.statBox}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(139, 130, 255, 0.2)' }]}>
                  <Clock size={24} color={Colors.dark.primary} />
                </View>
                <Text style={styles.statValue}>45 min</Text>
                <Text style={[styles.statLabel, { color: Colors.dark.primary }]}>Duration</Text>
              </LinearGradient>
              <LinearGradient colors={['#1A3833', Colors.dark.card]} style={styles.statBox}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(38, 205, 179, 0.2)' }]}>
                  <Smile size={24} color={Colors.dark.secondary} />
                </View>
                <Text style={styles.statValue}>Great</Text>
                <Text style={[styles.statLabel, { color: Colors.dark.secondary }]}>Mood Rating</Text>
              </LinearGradient>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// All styling is done using the theme file from constants/theme.ts
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: Spacing.m, paddingBottom: 120 }, // Added more paddingBottom
  headerTitle: { ...TextVariants.h1, marginBottom: Spacing.xs },
  headerSubtitle: { ...TextVariants.secondary, fontSize: 16, marginBottom: Spacing.l },
  cardsContainer: { gap: Spacing.m, marginBottom: Spacing.l },
  mainCard: { borderRadius: Radius.xl, padding: Spacing.m },
  secondaryCard: { backgroundColor: Colors.dark.card, borderRadius: Radius.xl, padding: Spacing.m, borderWidth: 1, borderColor: Colors.dark.border },
  cardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconTextWrapper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.m },
  iconContainer: { width: 60, height: 60, borderRadius: Radius.l, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { ...TextVariants.h3 },
  cardSubtitle: { ...TextVariants.body, color: Colors.dark.textMedium },
  lastSessionContainer: { backgroundColor: Colors.dark.card, borderRadius: Radius.xl, padding: Spacing.m, borderWidth: 1, borderColor: Colors.dark.border },
  sectionTitle: { ...TextVariants.h3, marginBottom: Spacing.m },
  statsGrid: { flexDirection: 'row', gap: Spacing.m },
  statBox: { flex: 1, borderRadius: Radius.l, padding: Spacing.m, borderWidth: 1, borderColor: Colors.dark.border },
  statIconContainer: { width: 40, height: 40, borderRadius: Radius.m, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.s },
  statValue: { ...TextVariants.h2 },
  statLabel: { ...TextVariants.secondary },
});