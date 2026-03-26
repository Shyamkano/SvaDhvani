import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BrainIcon as Brain, ArrowLeft01Icon as ChevronLeft, Target02Icon as Crosshair,
  SleepingIcon as Moon, PauseIcon as Pause, PlayIcon as Play, SparklesIcon as Sparkles,
  FastWindIcon as Wind, ElectricHome01Icon as Zap
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';

import AnimatedScreen from '@/components/AnimatedScreen';
import { usePlayer, type SessionPayload } from '@/context/PlayerContext';
import { useThemeColors } from '@/hooks/use-theme-color';
import { Radius, Spacing, TextVariants } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function PlayerScreen() {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const { startSession, closePlayer, isPlaying, currentSession } = usePlayer();

  const [activeTab, setActiveTab] = useState<'manual' | 'smart'>('manual');
  const [presets, setPresets] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [frequency, setFrequency] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [isPresetsLoading, setIsPresetsLoading] = useState(true);
  const [lastSmartSession, setLastSmartSession] = useState<any | null>(null);

  // New States for watch replacement
  const [isWatchConnected, setIsWatchConnected] = useState(false);
  const [userContext, setUserContext] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsPresetsLoading(true);
      try {
        const { data: presetsData } = await supabase.from('presets').select('*').order('id');
        if (presetsData) {
          setPresets(presetsData);
          if (presetsData.length > 0 && !selectedCategory) {
            setSelectedCategory(presetsData[0].id);
            setFrequency(presetsData[0].default_frequency_hz);
          }
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: lastSessionData } = await supabase
            .from('sessions')
            .select('*, presets(name)')
            .eq('user_id', user.id)
            .like('mode', 'smart%')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (lastSessionData) {
            setLastSmartSession(lastSessionData);
          }
        }
      } catch (e) {
        console.error("Error fetching initial data:", e);
      } finally {
        setIsPresetsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'manual') {
      const preset = presets.find(p => p.id === selectedCategory);
      if (preset) {
        setFrequency(preset.default_frequency_hz);
      }
    }
  }, [selectedCategory, activeTab, presets]);

  const handlePlayToggle = async () => {
    if (isPlaying) {
      closePlayer();
      return;
    }

    setIsLoading(true);
    try {
      let payload: SessionPayload;

      if (activeTab === 'manual') {
        if (isPresetsLoading) throw new Error("Presets are still loading.");
        const preset = presets.find(p => p.id === selectedCategory);
        if (!preset) throw new Error("Please select a category.");

        const apiStateMap: any = {
          focus: 'Focused',
          relax: 'Relaxed',
          sleep: 'Relaxed',
          stress: 'Stressed'
        };

        const apiState = apiStateMap[preset.id];
        if (!apiState) throw new Error(`Invalid preset category: ${preset.id}`);

        payload = {
          mode: 'manual',
          apiEndpoint: '/play_manual',
          apiPayload: { state: apiState, intensity: 0.6 },
          displayName: `${preset.name} Session`,
          displayCategory: preset.name,
          totalDuration: 1800,
          sessionId: preset.id, // ✅ Add this to sync with UI selectedCategory
        };
      } else { // Smart Mode
        // Helper to get random number in range
        const rng = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

        // Generate dynamic dummy data so the AI returns different results
        let sensorInput;
        
        if (isWatchConnected) {
          sensorInput = {
            heart_rate: rng(70, 110),
            skin_temp: (rng(310, 345) / 10).toFixed(1), // 31.0 to 34.5
            steps: rng(2000, 8000),
            activity_level: rng(0, 2),
            ambient_noise: rng(40, 75),
            hour_of_day: new Date().getHours(),
          };
        } else {
          // Fallback: Map common keywords in user text to dummy sensor data
          const context = (userContext || "").toLowerCase();
          const isStressed = context.includes('stress') || context.includes('anxious') || context.includes('tired');
          const isFocus = context.includes('work') || context.includes('study') || context.includes('focus');

          sensorInput = {
            heart_rate: isStressed ? rng(95, 120) : isFocus ? rng(75, 90) : rng(65, 80),
            skin_temp: isStressed ? 34.2 : 32.5,
            steps: rng(500, 3000),
            activity_level: isStressed ? 1 : 0,
            ambient_noise: rng(30, 60),
            hour_of_day: new Date().getHours(),
          };
        }

        payload = {
          mode: 'smart',
          apiEndpoint: '/recommend',
          apiPayload: { sensor_input: sensorInput },
          displayName: 'AI Smart Session',
          displayCategory: 'AI Recommended',
          totalDuration: 1800,
          sessionId: 'smart-session',
        };
      }

      await startSession(payload);

    } catch (error: any) {
      Alert.alert("Error Starting Session", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedScreen>
      <LinearGradient colors={[colors.background, colors.cardDarker]} style={styles.container}>
        <WaveBackground />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <StatusBar barStyle={colors.background === '#FFFFFF' || colors.background === '#F8F9FA' ? 'dark-content' : 'light-content'} />
          <Header />
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              <AnimatedTabs activeTab={activeTab} setActiveTab={setActiveTab} />

              {activeTab === 'manual' ? (
                <ManualModeContent
                  isPlaying={isPlaying && currentSession?.id === selectedCategory}
                  onPlayPress={handlePlayToggle}
                  frequency={frequency} setFrequency={setFrequency}
                  presets={presets}
                  selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                  isLoading={isLoading}
                  isPresetsLoading={isPresetsLoading}
                />
              ) : (
                <SmartModeContent
                  isPlaying={isPlaying && currentSession?.id === 'smart-session'}
                  onPlayPress={handlePlayToggle}
                  isLoading={isLoading}
                  lastSession={lastSmartSession}
                  userContext={userContext}
                  setUserContext={setUserContext}
                  isWatchConnected={isWatchConnected}
                  setIsWatchConnected={setIsWatchConnected}
                />
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </AnimatedScreen>
  );
}

// --- SUB-COMPONENTS ---

const ManualModeContent = ({ isPlaying, onPlayPress, frequency, setFrequency, presets, selectedCategory, setSelectedCategory, isLoading, isPresetsLoading }: any) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <View>
      <View style={styles.categoryGrid}>
        {isPresetsLoading ? (
          <View style={styles.loadingContainer}><ActivityIndicator color={colors.primary} /></View>
        ) : presets.map((p: any) => (
          <CategoryCard key={p.id} category={p} isSelected={selectedCategory === p.id} onPress={() => setSelectedCategory(p.id)} />
        ))}
      </View>
      <View style={styles.sliderContainer}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sectionTitle}>Frequency</Text>
          <View style={styles.freqDisplay}><Text style={styles.freqText}>{frequency} Hz</Text></View>
        </View>
        <Slider
          value={frequency}
          onValueChange={(value) => setFrequency(Math.round(Array.isArray(value) ? value[0] : value))}
          minimumValue={1} maximumValue={40} step={1}
          minimumTrackTintColor={colors.primary} maximumTrackTintColor={colors.border}
          thumbTintColor={colors.tint}
        />
      </View>
      <View style={{ alignItems: 'center' }}>
        <PlayButton isPlaying={isPlaying} onPress={onPlayPress} isLoading={isLoading} />
      </View>
    </View>
  );
};

const SmartModeContent = ({ isPlaying, onPlayPress, isLoading, lastSession, userContext, setUserContext, isWatchConnected, setIsWatchConnected }: any) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const displayName = lastSession?.presets?.name || "AI Recommended";
  const displayFreq = lastSession?.frequency ? `${Math.round(lastSession.frequency)} Hz` : "Dynamic";
  const displayBody = lastSession
    ? `Your last smart session was a ${displayName} beat. Try another AI-powered session.`
    : "Press the button to analyze your state and get a personalized recommendation.";

  return (
    <View style={{ gap: Spacing.l }}>
      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.aiCard}>
        <View style={styles.aiHeader}>
          <HugeiconsIcon icon={Brain} size={20} color={'rgba(255,255,255,0.9)'} />
          <Text style={styles.aiCardSub}>Last AI Recommendation</Text>
        </View>
        <Text style={styles.aiCardTitle}>{displayName} Session</Text>
        <Text style={styles.aiCardBody}>{displayBody}</Text>
        <View style={styles.aiTagsContainer}>
          <View style={styles.aiTag}><Text style={styles.aiTagText}>{displayFreq}</Text></View>
          <View style={styles.aiTag}><Text style={styles.aiTagText}>30 min</Text></View>
        </View>
      </LinearGradient>

      {/* Fallback TextInput for missing Watch Data logic */}
      <View style={styles.watchFallbackContainer}>
        <View style={styles.watchHeader}>
          <Text style={styles.sectionTitle}>Sensor Data</Text>
          <Pressable onPress={() => setIsWatchConnected(!isWatchConnected)} style={styles.watchToggle}>
            <Text style={styles.watchToggleText}>{isWatchConnected ? "Watch Linked" : "No Watch"}</Text>
          </Pressable>
        </View>

        {!isWatchConnected ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="How are you feeling? (e.g. stressed, need focus)"
              placeholderTextColor={colors.textMedium}
              value={userContext}
              onChangeText={setUserContext}
              multiline
            />
          </View>
        ) : (
          <Text style={[styles.aiCardSub, { color: colors.textMedium, marginTop: Spacing.s }]}>
            Syncing live bio-metrics perfectly...
          </Text>
        )}
      </View>

      <Pressable style={styles.smartPlayButton} onPress={onPlayPress} disabled={isLoading}>
        <View style={styles.smartPlayContent}>
          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.smartPlayIconContainer}>
            {isLoading ? <ActivityIndicator color="#fff" /> : isPlaying ? <HugeiconsIcon icon={Pause} size={28} color="white" /> : <HugeiconsIcon icon={Play} size={28} color="white" style={{ marginLeft: 3 }} />}
          </LinearGradient>
          <View>
            <Text style={styles.sectionTitle}>{isLoading ? "Generating..." : isPlaying ? "Pause Session" : "Start Smart Session"}</Text>
            <Text style={styles.timerLabel}>One-tap AI-powered session</Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.whyCard}>
        <Text style={styles.sectionTitle}>Why This Works For You</Text>
        <View style={styles.whyItemsContainer}>
          <WhyItem num="1" text="Your peak focus time is between 2-4 PM" color={colors.primary} />
          <WhyItem num="2" text="12 Hz frequency has shown 87% improvement" color={colors.secondary} />
          <WhyItem num="3" text="30-minute sessions yield best results" color={colors.accent} />
        </View>
      </View>
    </View>
  );
};

const PlayButton = ({ isPlaying, onPress, isLoading }: any) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = isPlaying ? withRepeat(withTiming(1, { duration: 1500, easing: Easing.linear }), -1) : withTiming(0);
  }, [isPlaying]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 0.5, 1], [1, 1.3, 1]);
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0.5, 0, 0.5]);
    return { transform: [{ scale }], opacity };
  });

  return (
    <Pressable onPress={onPress} disabled={isLoading}>
      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.playButton}>
        {isPlaying && <Animated.View style={[styles.pulsingRing, animatedStyle]} />}
        {isLoading ? <ActivityIndicator size="large" color="#fff" /> : isPlaying ? <HugeiconsIcon icon={Pause} size={48} color="white" /> : <HugeiconsIcon icon={Play} size={48} color="white" style={{ marginLeft: 5 }} />}
      </LinearGradient>
    </Pressable>
  );
};

const CategoryCard = ({ category, isSelected, onPress }: any) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const Icon = ({ focus: Crosshair, relax: Wind, sleep: Moon, meditation: Sparkles, energy: Zap } as Record<string, any>)[category.id] || Zap;
  return (
    <Pressable onPress={onPress} style={{ width: '48%' }}>
      {isSelected ? (
        <LinearGradient colors={category.gradient_colors || [colors.primary, colors.secondary]} style={styles.categoryCard}>
          <View style={styles.categoryContent}>
            <View style={[styles.categoryIconContainer, { backgroundColor: 'rgba(255,255,255,0.3)' }]}><HugeiconsIcon icon={Icon} size={32} color={'#FFFFFF'} /></View>
            <Text style={[styles.categoryName, { color: '#FFFFFF' }]}>{category.name}</Text>
            <Text style={[styles.categoryFreq, { color: 'rgba(255,255,255,0.8)' }]}>{category.default_frequency_hz} Hz</Text>
          </View>
        </LinearGradient>
      ) : (
        <View style={[styles.categoryCard, { backgroundColor: colors.card }]}>
          <View style={styles.categoryContent}>
            <View style={[styles.categoryIconContainer, { backgroundColor: colors.cardAccent }]}><HugeiconsIcon icon={Icon} size={32} color={colors.primary} /></View>
            <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
            <Text style={[styles.categoryFreq, { color: colors.textMedium }]}>{category.default_frequency_hz} Hz</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
};

const WhyItem = ({ num, text, color }: { num: string, text: string, color: string }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  return (
    <View style={styles.whyItem}>
      <View style={[styles.whyNumContainer, { backgroundColor: `${color}30` }]}><Text style={[styles.whyNumText, { color }]}>{num}</Text></View>
      <Text style={[styles.whyText, { color: colors.textMedium }]}>{text}</Text>
    </View>
  );
};

const Header = () => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backButton}><HugeiconsIcon icon={ChevronLeft} size={28} color={colors.text} /></Pressable>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Session</Text>
      <View style={{ width: 48 }} />
    </View>
  );
};

const AnimatedTabs = ({ activeTab, setActiveTab }: any) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const { width } = useWindowDimensions();
  const tabContainerWidth = width - Spacing.m * 2 - Spacing.xs * 2;
  const tabWidth = tabContainerWidth / 2;
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(activeTab === 'manual' ? 0 : tabWidth, { duration: 300, easing: Easing.inOut(Easing.ease) });
  }, [activeTab, tabWidth, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.tabsContainer}>
      <AnimatedLinearGradient colors={[colors.primary, colors.secondary]} style={[styles.activeTabIndicator, { width: tabWidth }, animatedStyle]} />
      <Pressable onPress={() => setActiveTab('manual')} style={styles.tabButton}><Text style={[styles.tabText, { color: activeTab === 'manual' ? '#FFFFFF' : colors.textMedium }]}>Manual Mode</Text></Pressable>
      <Pressable onPress={() => setActiveTab('smart')} style={styles.tabButton}><Text style={[styles.tabText, { color: activeTab === 'smart' ? '#FFFFFF' : colors.textMedium }]}>Smart Mode</Text></Pressable>
    </View>
  );
};

const WaveBackground = () => <View />;

// --- STYLES ---
const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.m, paddingTop: Spacing.m, paddingBottom: Spacing.s },
  backButton: { width: 48, height: 48, borderRadius: Radius.l, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...TextVariants.h3 },
  scrollContainer: { padding: Spacing.m, paddingBottom: 100 },
  loadingContainer: { flex: 1, height: 200, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...TextVariants.body, color: colors.textMedium, marginTop: Spacing.m, textAlign: 'center' },
  tabsContainer: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: Radius.l, padding: Spacing.xs, borderWidth: 1, borderColor: colors.border, marginBottom: Spacing.l },
  tabButton: { flex: 1, paddingVertical: Spacing.m, alignItems: 'center', borderRadius: Radius.m, zIndex: 1 },
  tabText: { ...TextVariants.body, fontWeight: '600' },
  activeTabIndicator: { position: 'absolute', height: '100%', top: Spacing.xs, left: Spacing.xs, borderRadius: Radius.m },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.m, marginBottom: Spacing.l },
  categoryCard: { padding: Spacing.m, borderRadius: Radius.l, borderWidth: 1, borderColor: colors.border, alignItems: 'center', height: 180, justifyContent: 'center' },
  categoryContent: { alignItems: 'center', gap: Spacing.s },
  categoryIconContainer: { width: 64, height: 64, borderRadius: Radius.l, justifyContent: 'center', alignItems: 'center' },
  categoryName: { ...TextVariants.h3 },
  categoryFreq: { ...TextVariants.secondary },
  sliderContainer: { backgroundColor: colors.card, borderRadius: Radius.l, padding: Spacing.m, borderWidth: 1, borderColor: colors.border, marginBottom: Spacing.l },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.s },
  sectionTitle: { ...TextVariants.h3, color: colors.text },
  freqDisplay: { paddingHorizontal: Spacing.m, paddingVertical: Spacing.xs, backgroundColor: colors.cardAccent, borderRadius: Radius.m, borderWidth: 1, borderColor: `${colors.primary}50` },
  freqText: { ...TextVariants.label, color: colors.primary },
  playButton: { width: 128, height: 128, borderRadius: 64, justifyContent: 'center', alignItems: 'center' },
  pulsingRing: { position: 'absolute', width: 128, height: 128, borderRadius: 64, borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)' },
  aiCard: { borderRadius: Radius.xl, padding: Spacing.l, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.s, marginBottom: Spacing.m },
  aiCardSub: { ...TextVariants.secondary, color: 'rgba(255,255,255,0.9)' },
  aiCardTitle: { ...TextVariants.h2, color: '#FFFFFF', marginBottom: Spacing.s },
  aiCardBody: { ...TextVariants.body, color: 'rgba(255,255,255,0.9)', lineHeight: 22 },
  aiTagsContainer: { flexDirection: 'row', gap: Spacing.m, marginTop: Spacing.l },
  aiTag: { paddingHorizontal: Spacing.m, paddingVertical: Spacing.s, borderRadius: Radius.m, backgroundColor: 'rgba(255,255,255,0.2)' },
  aiTagText: { ...TextVariants.label, color: '#FFFFFF', fontWeight: '600' },

  // Watch Fallback styles
  watchFallbackContainer: { backgroundColor: colors.card, borderRadius: Radius.xl, padding: Spacing.m, borderWidth: 1, borderColor: colors.border },
  watchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.s },
  watchToggle: { backgroundColor: colors.cardAccent, paddingHorizontal: Spacing.s, paddingVertical: 4, borderRadius: Radius.s },
  watchToggleText: { ...TextVariants.label, color: colors.primary },
  inputContainer: { marginTop: Spacing.s },
  textInput: { ...TextVariants.body, color: colors.text, backgroundColor: colors.cardDarker, borderRadius: Radius.m, padding: Spacing.m, minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: colors.border },

  smartPlayButton: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: Radius.xl, padding: Spacing.m },
  smartPlayContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.m },
  smartPlayIconContainer: { width: 60, height: 60, borderRadius: Radius.l, justifyContent: 'center', alignItems: 'center' },
  timerLabel: { ...TextVariants.secondary, color: colors.textMedium },
  whyCard: { backgroundColor: colors.card, borderRadius: Radius.xl, padding: Spacing.l, borderWidth: 1, borderColor: colors.border },
  whyItemsContainer: { gap: Spacing.m, marginTop: Spacing.m },
  whyItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.m },
  whyNumContainer: { width: 32, height: 32, borderRadius: Radius.m, justifyContent: 'center', alignItems: 'center' },
  whyNumText: { ...TextVariants.label, fontWeight: 'bold' },
  whyText: { ...TextVariants.secondary, flex: 1, lineHeight: 20 },
});