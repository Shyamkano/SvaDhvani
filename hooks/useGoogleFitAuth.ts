/**
 * useGoogleFitAuth
 *
 * Connects Google Fit by reusing the SAME Supabase Google OAuth flow that the
 * login screen uses (supabase.auth.signInWithOAuth + WebBrowser). This avoids
 * the need for separate EXPO_PUBLIC_GOOGLE_CLIENT_ID_* env vars entirely.
 *
 * The only difference from login: we pass extra `scopes` query params so Google
 * also grants access to the Fitness API data types.
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

// Google Fit scopes — these are appended to the standard Google OAuth scopes
// that Supabase already requests (email, profile, openid).
const FITNESS_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
  'https://www.googleapis.com/auth/fitness.body.read',
  'https://www.googleapis.com/auth/fitness.location.read',
].join(' ');

// Extract a param value from either the hash fragment or query string of a URL
function extractParam(url: string, param: string): string {
  const hashPart = url.includes('#') ? url.split('#')[1] : '';
  const queryPart = url.includes('?') ? url.split('?')[1]?.split('#')[0] : '';
  const searchIn = hashPart || queryPart || '';
  const match = searchIn.split('&').find((p) => p.startsWith(`${param}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : '';
}

export function useGoogleFitAuth() {
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async () => {
    setIsConnecting(true);
    try {
      const redirectTo = AuthSession.makeRedirectUri();

      // Use Supabase OAuth but pass the extra Fitness scopes via query params.
      // Supabase passes unknown options through to Google's auth URL.
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          scopes: FITNESS_SCOPES,
          queryParams: {
            // Force Google to show the account selector every time
            // and always return a refresh_token (offline access)
            access_type: 'offline',
            prompt: 'consent select_account',
          },
        },
      });

      if (error || !data.url) {
        throw new Error(error?.message ?? 'Failed to generate Google auth URL.');
      }

      // Open the Google sign-in inside an in-app browser
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (res.type !== 'success') {
        // User cancelled or browser closed — not an error, just bail
        return;
      }

      // Extract the tokens from the redirect URL
      const accessToken  = extractParam(res.url, 'access_token');
      const refreshToken = extractParam(res.url, 'refresh_token');
      const expiresInRaw = extractParam(res.url, 'expires_in');
      const expiresIn    = expiresInRaw ? parseInt(expiresInRaw, 10) : 3600;

      if (!accessToken) {
        throw new Error('No access token returned from Google. Please try again.');
      }

      // Get the currently logged-in Supabase user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Could not get current user. Please log in first.');
      }

      // Persist the fitness tokens in user_google_tokens
      const { error: upsertError } = await supabase
        .from('user_google_tokens')
        .upsert({
          id: user.id,
          access_token: accessToken,
          refresh_token_encrypted: refreshToken || '',
          // Convert expires_in (seconds) to a timestamp for the database
          expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
          updated_at: new Date().toISOString()
        });

      if (upsertError) throw upsertError;

      Alert.alert('✅ Connected!', 'Google Fit has been linked. Your smartwatch data will now appear in Health Metrics.');
    } catch (err: any) {
      console.error('[useGoogleFitAuth] connect error:', err.message);
      Alert.alert('Connection Failed', err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('user_google_tokens').delete().eq('id', user.id);
    } catch (err: any) {
      console.error('[useGoogleFitAuth] disconnect error:', err.message);
    }
  };

  return { isConnecting, connect, disconnect };
}