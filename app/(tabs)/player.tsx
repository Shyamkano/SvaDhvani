import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StatusBar, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, FadeInDown, FadeInUp, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import all necessary icons directly
import { Brain, ChevronLeft, Crosshair, Moon, Pause, Play, Sparkles, Wind, Zap } from 'lucide-react-native';

// Import our design system
import { Colors, Spacing, styles } from '../../constants/theme';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// --- Data ---
const categories = [
    { id: "focus", name: "Focus", Icon: Crosshair, colors: [Colors.dark.primary, Colors.dark.tint], freq: "12 Hz" },
    { id: "relax", name: "Relax", Icon: Wind, colors: [Colors.dark.secondary, '#4DD9C3'], freq: "8 Hz" },
    { id: "sleep", name: "Sleep", Icon: Moon, colors: [Colors.dark.primary, Colors.dark.secondary], freq: "4 Hz" },
    { id: "meditation", name: "Meditation", Icon: Sparkles, colors: [Colors.dark.accent, '#FFE099'], freq: "7 Hz" },
    { id: "energy", name: "Energy", Icon: Zap, colors: [Colors.dark.accent, Colors.dark.secondary], freq: "16 Hz" },
];

// --- Main Component ---
export default function PlayerScreen() {
  const [activeTab, setActiveTab] = useState<'manual' | 'smart'>('manual');
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequency, setFrequency] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('focus');
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isPlaying) {
      interval = setInterval(() => setDuration((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <LinearGradient colors={[Colors.dark.background, Colors.dark.cardDarker]} style={styles.container}>
      <WaveBackground />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" />
        <Header />
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInUp.duration(400)}>
            <AnimatedTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </Animated.View>
          {activeTab === 'manual' ? (
            <ManualModeContent
              isPlaying={isPlaying} setIsPlaying={setIsPlaying}
              frequency={frequency} setFrequency={setFrequency}
              selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
              duration={duration} formatTime={formatTime}
            />
          ) : (
            <SmartModeContent isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ========================================================================
// REUSABLE & ANIMATED COMPONENTS
// ========================================================================

const AnimatedTabs = ({ activeTab, setActiveTab }: any) => {
    const { width } = useWindowDimensions();
    const tabContainerWidth = width - Spacing.m * 2 - Spacing.xs * 2;
    const tabWidth = tabContainerWidth / 2;
  
    // ✅ FIX 1: Create a shared value to drive the animation.
    const translateX = useSharedValue(0);

    // ✅ FIX 2: Use a useEffect to watch the 'activeTab' state and trigger the animation.
    useEffect(() => {
      translateX.value = withTiming(activeTab === 'manual' ? 0 : tabWidth, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
    }, [activeTab, tabWidth, translateX]);
  
    // ✅ FIX 3: The animated style now watches the shared value, which is more reliable.
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: translateX.value }],
      };
    });
  
    return (
      <View style={styles.tabsContainer}>
        <AnimatedLinearGradient 
          colors={[Colors.dark.primary, Colors.dark.secondary]} 
          style={[styles.activeTabIndicator, { width: tabWidth }, animatedStyle]} 
        />
        <Pressable onPress={() => setActiveTab('manual')} style={styles.tabButton}>
          <Text style={[styles.tabText, { color: activeTab === 'manual' ? '#FFFFFF' : Colors.dark.textMedium }]}>Manual Mode</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('smart')} style={styles.tabButton}>
          <Text style={[styles.tabText, { color: activeTab === 'smart' ? '#FFFFFF' : Colors.dark.textMedium }]}>Smart Mode</Text>
        </Pressable>
      </View>
    );
};

// ... The rest of your components (SmartModeContent, ManualModeContent, etc.) remain unchanged.
// For brevity, I'll include the full, correct code below this point.

const SmartModeContent = ({ isPlaying, setIsPlaying }: any) => (
  <Animated.View entering={FadeInDown.duration(400).delay(100)} style={{ gap: Spacing.l }}>
    <LinearGradient colors={[Colors.dark.primary, Colors.dark.secondary]} style={styles.aiCard}>
      <View style={styles.aiHeader}><Brain size={20} color={'rgba(255,255,255,0.9)'} /><Text style={styles.aiCardSub}>AI Recommendation</Text></View>
      <Text style={styles.aiCardTitle}>Focus Session</Text>
      <Text style={styles.aiCardBody}>Based on your recent activity and time of day, we recommend a Focus session at 12 Hz to boost concentration.</Text>
      <View style={styles.aiTagsContainer}>
        <View style={styles.aiTag}><Text style={styles.aiTagText}>12 Hz</Text></View>
        <View style={styles.aiTag}><Text style={styles.aiTagText}>30 min</Text></View>
        <View style={styles.aiTag}><Text style={styles.aiTagText}>95% Match</Text></View>
      </View>
    </LinearGradient>
    <Pressable style={styles.smartPlayButton} onPress={() => setIsPlaying(!isPlaying)}>
      <View style={styles.smartPlayContent}>
        <LinearGradient colors={[Colors.dark.primary, Colors.dark.secondary]} style={styles.smartPlayIconContainer}>
          {isPlaying ? <Pause size={28} color="white" /> : <Play size={28} color="white" style={{ marginLeft: 3 }} />}
        </LinearGradient>
        <View><Text style={styles.sectionTitle}>{isPlaying ? "Pause Session" : "Start Smart Session"}</Text><Text style={styles.timerLabel}>One-tap AI-powered session</Text></View>
      </View>
    </Pressable>
    <View style={styles.whyCard}>
      <Text style={styles.sectionTitle}>Why This Works For You</Text>
      <View style={styles.whyItemsContainer}>
        <WhyItem num="1" text="Your peak focus time is between 2-4 PM based on past sessions" color={Colors.dark.primary} />
        <WhyItem num="2" text="12 Hz frequency has shown 87% improvement in your productivity" color={Colors.dark.secondary} />
        <WhyItem num="3" text="30-minute sessions yield best results for your focus goals" color={Colors.dark.accent} />
      </View>
    </View>
  </Animated.View>
);

const WhyItem = ({ num, text, color }: { num: string, text: string, color: string }) => (
  <View style={styles.whyItem}>
    <View style={[styles.whyNumContainer, { backgroundColor: `${color}30` }]}><Text style={[styles.whyNumText, { color }]}>{num}</Text></View>
    <Text style={styles.whyText}>{text}</Text>
  </View>
);

const ManualModeContent = ({ isPlaying, setIsPlaying, frequency, setFrequency, selectedCategory, setSelectedCategory, duration, formatTime }: any) => (
  <Animated.View entering={FadeInDown.duration(400).delay(100)}>
    <View style={styles.categoryGrid}>
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} isSelected={selectedCategory === category.id} onPress={() => setSelectedCategory(category.id)} />
      ))}
    </View>
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}><Text style={styles.sectionTitle}>Frequency</Text><View style={styles.freqDisplay}><Text style={styles.freqText}>{frequency} Hz</Text></View></View>
      <Slider
        value={frequency}
        onValueChange={(value) => setFrequency(Math.round(Array.isArray(value) ? value[0] : value))}
        minimumValue={1} maximumValue={40} step={1}
        minimumTrackTintColor={Colors.dark.primary} maximumTrackTintColor={Colors.dark.border}
        thumbTintColor={Colors.dark.tint}
      />
    </View>
    <View style={{ alignItems: 'center' }}>
      <PlayButton isPlaying={isPlaying} onPress={() => setIsPlaying(!isPlaying)} />
    </View>
    {isPlaying && (
      <Animated.View entering={FadeInDown.duration(500)} style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(duration)}</Text>
        <Text style={styles.timerLabel}>Session Duration</Text>
      </Animated.View>
    )}
  </Animated.View>
);

const Header = () => (
    <Animated.View entering={FadeInUp.duration(500)} style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backButton}><ChevronLeft size={28} color={Colors.dark.text} /></Pressable>
      <Text style={styles.headerTitle}>Session</Text>
      <View style={{ width: 48 }} />
    </Animated.View>
);
  
const CategoryCard = ({ category, isSelected, onPress }: any) => {
    const { Icon, name, freq, colors } = category;
    const content = (
      <View style={styles.categoryContent}>
        <View style={[styles.categoryIconContainer, { backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : Colors.dark.cardAccent }]}><Icon size={32} color={isSelected ? '#FFFFFF' : Colors.dark.primary} /></View>
        <Text style={[styles.categoryName, { color: isSelected ? '#FFFFFF' : Colors.dark.text }]}>{name}</Text>
        <Text style={[styles.categoryFreq, { color: isSelected ? 'rgba(255,255,255,0.8)' : Colors.dark.textMedium }]}>{freq}</Text>
      </View>
    );
  
    return (
      <Pressable onPress={onPress} style={{ width: '48%' }}>
        {isSelected ? <LinearGradient colors={colors} style={styles.categoryCard}>{content}</LinearGradient> : <View style={[styles.categoryCard, { backgroundColor: Colors.dark.card }]}>{content}</View>}
      </Pressable>
    );
};

const PlayButton = ({ isPlaying, onPress }: any) => {
    const progress = useSharedValue(0);
    useEffect(() => {
      progress.value = isPlaying ? withRepeat(withTiming(1, { duration: 1500, easing: Easing.linear }), -1) : withTiming(0);
    }, [isPlaying, progress]);
  
    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(progress.value, [0, 0.5, 1], [1, 1.3, 1]);
      const opacity = interpolate(progress.value, [0, 0.5, 1], [0.5, 0, 0.5]);
      return { transform: [{ scale }], opacity };
    });
  
    return (
      <Pressable onPress={onPress}>
        <LinearGradient colors={[Colors.dark.primary, Colors.dark.secondary]} style={styles.playButton}>
          {isPlaying && <Animated.View style={[styles.pulsingRing, animatedStyle]} />}
          {isPlaying ? <Pause size={48} color="white" fill="white" /> : <Play size={48} color="white" fill="white" style={{ marginLeft: 5 }} />}
        </LinearGradient>
      </Pressable>
    );
};

const WaveBackground = () => ( <View /> );

