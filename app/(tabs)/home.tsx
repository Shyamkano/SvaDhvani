import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronRight, Clock, Headphones, Smile, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our design system
import { Colors, Radius, Spacing, TextVariants } from '../../constants/theme';

// Small Helper Component for the Chevron Icon
const ChevronIcon = () => <ChevronRight size={24} color={Colors.dark.textMedium} />;

// Main Home Screen Component
export default function HomeDashboard() {
  // Use expo-router for navigation
  const onNavigate = (screen: 'player' | 'metrics' | 'profile') => {
    router.push(`/${screen}`);
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
              <Pressable onPress={() => onNavigate('player')}>
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
                    <ChevronIcon />
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* Health Metrics Card */}
            <Animated.View entering={FadeInDown.duration(600).delay(200)}>
              <Pressable style={styles.secondaryCard} onPress={() => onNavigate('metrics')}>
                <View style={styles.cardContent}>
                  <View style={styles.iconTextWrapper}>
                    <LinearGradient
                      colors={[Colors.dark.primary, Colors.dark.secondary]}
                      style={styles.iconContainer}
                    >
                      <TrendingUp size={32} color={Colors.dark.text} />
                    </LinearGradient>
                    <View>
                      <Text style={styles.cardTitle}>Health Metrics</Text>
                      <Text style={styles.cardSubtitle}>Track your progress</Text>
                    </View>
                  </View>
                  <ChevronIcon />
                </View>
              </Pressable>
            </Animated.View>
          </View>

          {/* Last Session Preview */}
          <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.lastSessionContainer}>
            <Text style={styles.sectionTitle}>Last Session</Text>
            
            <View style={styles.statsGrid}>
              {/* Duration Stat */}
              <LinearGradient colors={[Colors.dark.cardAccent, Colors.dark.card]} style={styles.statBox}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(139, 130, 255, 0.2)' }]}>
                  <Clock size={24} color={Colors.dark.primary} />
                </View>
                <Text style={styles.statValue}>45 min</Text>
                <Text style={[styles.statLabel, { color: Colors.dark.primary }]}>Duration</Text>
              </LinearGradient>

              {/* Mood Stat */}
              <LinearGradient colors={['#1A3833', Colors.dark.card]} style={styles.statBox}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(38, 205, 179, 0.2)' }]}>
                  <Smile size={24} color={Colors.dark.secondary} />
                </View>
                <Text style={styles.statValue}>Great</Text>
                <Text style={[styles.statLabel, { color: Colors.dark.secondary }]}>Mood Rating</Text>
              </LinearGradient>
            </View>

            <View style={styles.sessionDetails}>
              <View>
                <Text style={styles.cardSubtitle}>Focus Session</Text>
                <Text style={styles.detailText}>12 Hz • Yesterday</Text>
              </View>
              <View style={styles.tag}>
                <Text style={[styles.tagText, { color: Colors.dark.secondary }]}>Completed</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// All styling is done using our theme file
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: Spacing.m,
  },
  headerTitle: {
    ...TextVariants.h1,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...TextVariants.secondary,
    fontSize: 16,
    marginBottom: Spacing.l,
  },
  cardsContainer: {
    gap: Spacing.m,
    marginBottom: Spacing.l,
  },
  mainCard: {
    borderRadius: Radius.xl,
    padding: Spacing.m,
  },
  secondaryCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.xl,
    padding: Spacing.m,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: Radius.l,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    ...TextVariants.h3,
  },
  cardSubtitle: {
    ...TextVariants.body,
    color: Colors.dark.textMedium,
  },
  lastSessionContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.xl,
    padding: Spacing.m,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sectionTitle: {
    ...TextVariants.h3,
    marginBottom: Spacing.m,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.m,
    marginBottom: Spacing.m,
  },
  statBox: {
    flex: 1,
    borderRadius: Radius.l,
    padding: Spacing.m,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.m,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  statValue: {
    ...TextVariants.h2,
  },
  statLabel: {
    ...TextVariants.secondary,
  },
  sessionDetails: {
    paddingTop: Spacing.m,
    borderTopWidth: 1,
    borderColor: Colors.dark.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailText: {
    ...TextVariants.secondary,
  },
  tag: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.m,
    backgroundColor: 'rgba(38, 205, 179, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(38, 205, 179, 0.2)',
  },
  tagText: {
    ...TextVariants.label,
    fontSize: 12,
  },
});