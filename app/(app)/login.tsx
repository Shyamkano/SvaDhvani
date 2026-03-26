import { BrainIcon as Brain } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as AuthSession from "expo-auth-session";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StatusBar, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeInDown, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

import { Colors, Radius, Spacing, TextVariants } from '../../constants/theme';

WebBrowser.maybeCompleteAuthSession();
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.replace('/(tabs)');
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.replace('/(tabs)');
      }
    };

    checkSession();
  }, []);
  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    else router.replace('/(tabs)');
    setLoading(false);
  }
  async function signInWithGoogle() {
    const redirectTo = AuthSession.makeRedirectUri();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      Alert.alert(error.message);
      return;
    }

    const res = await WebBrowser.openAuthSessionAsync(data.url!, redirectTo);

    if (res.type === "success") {
      // Extract tokens from the redirect URL (they come back as hash params)
      const accessToken = extractParam(res.url, 'access_token');
      const refreshToken = extractParam(res.url, 'refresh_token');

      if (accessToken && refreshToken) {
        // Manually set the session — this fires onAuthStateChange(SIGNED_IN)
        // which then navigates to /(tabs) via the listener above
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) Alert.alert("Sign in failed", sessionError.message);
      } else {
        // Fallback: Supabase may have already parsed the URL, just check session
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          router.replace("/(tabs)");
        } else {
          Alert.alert("Sign in failed", "Could not retrieve session after Google login.");
        }
      }
    }
  }

  function extractParam(url: string, param: string): string {
    // OAuth tokens come in the hash fragment: #access_token=...&refresh_token=...
    const hashPart = url.includes('#') ? url.split('#')[1] : '';
    const queryPart = url.includes('?') ? url.split('?')[1]?.split('#')[0] : '';
    const searchIn = hashPart || queryPart || '';
    const match = searchIn.split('&').find((p) => p.startsWith(`${param}=`));
    return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : '';
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
              <HugeiconsIcon icon={Brain} size={48} color={Colors.dark.primary} />
            </LinearGradient>
          </Animated.View>

          <Animated.Text entering={FadeInDown.duration(600).delay(300)} style={styles.title}>
            Welcome Back
          </Animated.Text>

          <Animated.View entering={FadeInDown.duration(600).delay(600)} style={styles.inputContainer}>
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
            <Pressable style={styles.signInButton} onPress={signInWithEmail} disabled={loading}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </Pressable>
            <Pressable style={styles.googleButton} onPress={signInWithGoogle}>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(600).delay(1100)}>
            <Pressable onPress={() => router.push('/register')}>
              <Text style={styles.registerText}>Don't have an account? Sign Up</Text>
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
  signInButton: {
    backgroundColor: Colors.dark.primary,
    padding: Spacing.m,
    borderRadius: Radius.l,
    alignItems: 'center',
  },
  signInButtonText: { ...TextVariants.body, fontWeight: '600', color: 'white' },
  registerText: { ...TextVariants.secondary, color: Colors.dark.primary, textAlign: 'center', marginTop: Spacing.l },
  googleButton: {
    backgroundColor: "#ffffff",
    padding: Spacing.m,
    borderRadius: Radius.l,
    alignItems: "center",
    marginTop: Spacing.m,
  },

  googleButtonText: {
    color: "#000",
    fontWeight: "600",
  }
});