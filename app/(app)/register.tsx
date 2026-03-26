import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Headphones } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StatusBar, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeInDown, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

import { Colors, Radius, Spacing, TextVariants } from '../../constants/theme';

const AnimatedWave = ({ top, duration, direction = 'forward', color }: any) => {
  const { width } = useWindowDimensions();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, true);
  }, [duration, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const start = direction === 'forward' ? -width : width;
    const end = direction === 'forward' ? width : -width;
    const translateX = interpolate(progress.value, [0, 1], [start, end]);
    return { transform: [{ translateX }] };
  });

  return (
    <Animated.View style={[{ position: 'absolute', top }, animatedStyle]}>
      <LinearGradient colors={['transparent', color, 'transparent']} style={{ width, height: 128, opacity: 0.2, borderRadius: 64 }} />
    </Animated.View>
  );
};

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: data.user.id, name: firstName, last: lastName }]);

      if (profileError) {
        Alert.alert(profileError.message);
      } else {
        Alert.alert('Registration successful! Please check your email for a confirmation link.');
        router.replace('/login');
      }
    }

    setLoading(false);
  }

  return (
    <LinearGradient colors={[Colors.dark.background, Colors.dark.cardDarker]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
        <View style={StyleSheet.absoluteFillObject}>
          <AnimatedWave top="25%" duration={8000} color={Colors.dark.primary} />
          <AnimatedWave top="50%" duration={10000} direction="backward" color={Colors.dark.secondary} />
          <AnimatedWave top="75%" duration={12000} color={Colors.dark.accent} />
        </View>

        <View style={styles.content}>
          <Animated.View entering={FadeIn.duration(800).springify()} style={styles.logoContainer}>
            <View style={styles.logoGlow} />
            <LinearGradient colors={[Colors.dark.primary, Colors.dark.secondary]} style={styles.logo}>
              <Headphones size={48} color="white" />
            </LinearGradient>
          </Animated.View>

          <Animated.Text entering={FadeInDown.duration(600).delay(300)} style={styles.title}>
            Create Account
          </Animated.Text>

          <Animated.View entering={FadeInDown.duration(600).delay(600)} style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor={Colors.dark.textMedium}
              onChangeText={setFirstName}
              value={firstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor={Colors.dark.textMedium}
              onChangeText={setLastName}
              value={lastName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.dark.textMedium}
              onChangeText={setEmail}
              value={email}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.dark.textMedium}
              onChangeText={setPassword}
              value={password}
              secureTextEntry
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(900)} style={styles.buttonContainer}>
            <Pressable onPress={signUpWithEmail} disabled={loading}>
              <LinearGradient colors={[Colors.dark.primary, Colors.dark.secondary]} style={styles.guestButton}>
                <Text style={styles.guestButtonText}>Sign Up</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(600).delay(1100)}>
            <Pressable onPress={() => router.replace('/login')}>
              <Text style={styles.loginText}>Already have an account? Sign In</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.l, alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: Spacing.l },
  logoGlow: { position: 'absolute', width: 96, height: 96, borderRadius: Radius.xl, backgroundColor: Colors.dark.primary, opacity: 0.6 },
  logo: { width: 96, height: 96, borderRadius: Radius.xl, justifyContent: 'center', alignItems: 'center' },
  title: { ...TextVariants.h1, color: Colors.dark.text, marginBottom: Spacing.s },
  inputContainer: { width: '100%', gap: Spacing.m, marginBottom: Spacing.l },
  input: {
    backgroundColor: 'rgba(26, 26, 46, 0.5)',
    color: Colors.dark.text,
    padding: Spacing.m,
    borderRadius: Radius.l,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    ...TextVariants.body,
  },
  buttonContainer: { width: '100%', gap: Spacing.m, marginBottom: Spacing.l },
  guestButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.m,
    borderRadius: Radius.l,
  },
  guestButtonText: { ...TextVariants.body, fontWeight: '600', color: 'white' },
  loginText: { ...TextVariants.secondary, color: Colors.dark.primary, textAlign: 'center', marginTop: Spacing.l },
});
