import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type FitMetrics = {
  steps: number | null;          // steps today
  heartRate: number | null;      // avg BPM today
  calories: number | null;       // kcal burned today
  sleepHours: number | null;     // hours slept last night
  activeMinutes: number | null;  // move minutes today
  distance: number | null;       // km today
};

export type FitStatus = 'idle' | 'loading' | 'success' | 'no_token' | 'error';

// ─────────────────────────────────────────────
// Google Fit data-source IDs
// ─────────────────────────────────────────────
const DATASOURCE = {
  steps:         'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
  heartRate:     'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm',
  calories:      'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended',
  activeMinutes: 'derived:com.google.active_minutes:com.google.android.gms:merge_active_minutes',
  distance:      'derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta',
  sleep:         'derived:com.google.sleep.segment:com.google.android.gms:merged',
};

// ─────────────────────────────────────────────
// Helper: build midnight-to-now range in nanoseconds
// ─────────────────────────────────────────────
function todayRangeNs(): { startNs: string; endNs: string } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  return {
    startNs: (midnight.getTime() * 1_000_000).toString(),
    endNs:   (now.getTime()     * 1_000_000).toString(),
  };
}

// ─────────────────────────────────────────────
// Helper: Refresh Google Token
// ─────────────────────────────────────────────
async function refreshGoogleToken(userId: string, refreshToken: string): Promise<string | null> {
  try {
    // Note: To refresh, we ideally need CLIENT_ID.
    // However, since we are using Supabase OAuth, the provider handles it.
    // If the manual refresh fails, we tell the user to re-link.
    const url = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams({
      client_id: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '', // Might be empty if not in .env
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!res.ok) {
      throw new Error(`Refresh failed: ${res.status}`);
    }

    const data = await res.json();
    const newAccessToken = data.access_token;
    const expiresIn = data.expires_in || 3600;

    // Update Supabase with the new token
    await supabase.from('user_google_tokens').update({
      access_token: newAccessToken,
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', userId);

    return newAccessToken;
  } catch (err) {
    console.error('[refreshGoogleToken] error:', err);
    return null;
  }
}

// Yesterday midnight → today midnight (for sleep)
function yesterdayRangeNs(): { startNs: string; endNs: string } {
  const now = new Date();
  const todayMidnight = new Date(now);
  todayMidnight.setHours(0, 0, 0, 0);
  const yesterdayMidnight = new Date(todayMidnight);
  yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);
  return {
    startNs: (yesterdayMidnight.getTime() * 1_000_000).toString(),
    endNs:   (todayMidnight.getTime()     * 1_000_000).toString(),
  };
}

// ─────────────────────────────────────────────
// Fetcher: aggregate a single datasource
// ─────────────────────────────────────────────
async function fetchAggregate(
  token: string,
  dataTypeName: string,
  startNs: string,
  endNs: string,
): Promise<any[]> {
  const url = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate';
  const body = {
    aggregateBy: [{ dataTypeName }],
    bucketByTime: { durationMillis: (Number(endNs) - Number(startNs)) / 1_000_000 },
    startTimeMillis: Math.floor(Number(startNs) / 1_000_000),
    endTimeMillis:   Math.floor(Number(endNs)   / 1_000_000),
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Fit API error (${res.status}): ${text}`);
  }

  const json = await res.json();
  // Flatten all datasets → all data-points across all buckets
  const points: any[] = [];
  for (const bucket of json.bucket ?? []) {
    for (const dataset of bucket.dataset ?? []) {
      points.push(...(dataset.point ?? []));
    }
  }
  return points;
}

// ─────────────────────────────────────────────
// Main hook
// ─────────────────────────────────────────────
export function useGoogleFit() {
  const [metrics, setMetrics] = useState<FitMetrics>({
    steps: null, heartRate: null, calories: null,
    sleepHours: null, activeMinutes: null, distance: null,
  });
  const [status, setStatus] = useState<FitStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setStatus('loading');
    setError(null);

    try {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      // 2. Load stored Google tokens
      const { data: tokenRow, error: tokenErr } = await supabase
        .from('user_google_tokens')
        .select('access_token, refresh_token, expires_at')
        .eq('id', user.id)
        .single();

      if (tokenErr || !tokenRow?.access_token) {
        setStatus('no_token');
        return;
      }

      let token = tokenRow.access_token;
      const refreshToken = tokenRow.refresh_token;
      const expiresAt = new Date(tokenRow.expires_at);
      const now = new Date();

      // IF TOKEN IS EXPIRED (or close to it), REFRESH NOW
      if (now >= expiresAt && refreshToken) {
        console.log('[useGoogleFit] Token expired, refreshing...');
        const newToken = await refreshGoogleToken(user.id, refreshToken);
        if (newToken) token = newToken;
      }

      const { startNs, endNs } = todayRangeNs();
      const { startNs: sleepStart, endNs: sleepEnd } = yesterdayRangeNs();

      // Helper to fetch with retry on 401
      const fetchWithRetry = async (dataType: string, sNs: string, eNs: string): Promise<any[]> => {
        try {
          return await fetchAggregate(token, dataType, sNs, eNs);
        } catch (err: any) {
          if (err.message.includes('401') && refreshToken) {
            console.log(`[useGoogleFit] 401 on ${dataType}, refreshing...`);
            const refreshedToken = await refreshGoogleToken(user.id, refreshToken);
            if (refreshedToken) {
              return await fetchAggregate(refreshedToken, dataType, sNs, eNs);
            }
          }
          throw err;
        }
      };

      // 3. Fetch all 6 metrics in parallel
      const [stepsPoints, hrPoints, calPoints, activePoints, distPoints, sleepPoints] =
        await Promise.all([
          fetchWithRetry('com.google.step_count.delta',    startNs, endNs),
          fetchWithRetry('com.google.heart_rate.bpm',      startNs, endNs),
          fetchWithRetry('com.google.calories.expended',   startNs, endNs),
          fetchWithRetry('com.google.active_minutes',      startNs, endNs),
          fetchWithRetry('com.google.distance.delta',      startNs, endNs),
          fetchWithRetry('com.google.sleep.segment',       sleepStart, sleepEnd),
        ]);

      // ── Steps: sum of intVal
      const steps = stepsPoints.reduce((acc, p) =>
        acc + (p.value?.[0]?.intVal ?? 0), 0);

      // ── Heart rate: average of fpVal
      const hrValues = hrPoints.flatMap((p: any) =>
        p.value?.map((v: any) => v.fpVal ?? 0).filter((v: number) => v > 0) ?? []);
      const heartRate = hrValues.length
        ? Math.round(hrValues.reduce((a: number, b: number) => a + b, 0) / hrValues.length)
        : null;

      // ── Calories: sum of fpVal
      const calories = calPoints.reduce((acc, p) =>
        acc + (p.value?.[0]?.fpVal ?? 0), 0);

      // ── Active minutes: sum of intVal
      const activeMinutes = activePoints.reduce((acc, p) =>
        acc + (p.value?.[0]?.intVal ?? 0), 0);

      // ── Distance: sum in meters → km
      const distMeters = distPoints.reduce((acc, p) =>
        acc + (p.value?.[0]?.fpVal ?? 0), 0);
      const distance = distMeters / 1000;

      // ── Sleep: sum of segment durations (values 57-63 = asleep stages)
      const SLEEP_STAGES = [57, 58, 59, 60, 61, 62, 63]; // Google Fit sleep stage types
      let sleepMs = 0;
      for (const p of sleepPoints) {
        const stage = p.value?.[0]?.intVal;
        if (SLEEP_STAGES.includes(stage)) {
          const start = Number(p.startTimeNanos) / 1_000_000;
          const end   = Number(p.endTimeNanos)   / 1_000_000;
          sleepMs += (end - start);
        }
      }
      const sleepHours = sleepMs > 0 ? parseFloat((sleepMs / 3_600_000).toFixed(1)) : null;

      const finalSteps     = steps > 0 ? steps : null;
      const finalHeartRate = heartRate;
      const finalSleep     = sleepHours;
      const finalCalories  = calories > 0 ? Math.round(calories) : null;
      const finalActive    = activeMinutes > 0 ? activeMinutes : null;
      const finalDistance  = distance > 0 ? parseFloat(distance.toFixed(2)) : null;

      // Derive stress_level (0-10) from resting heart rate as a proxy:
      // < 60 bpm → 2, 60-70 → 3, 70-80 → 5, 80-90 → 7, > 90 → 9
      let stressLevel: number | null = null;
      if (finalHeartRate !== null) {
        if (finalHeartRate < 60)       stressLevel = 2;
        else if (finalHeartRate < 70)  stressLevel = 3;
        else if (finalHeartRate < 80)  stressLevel = 5;
        else if (finalHeartRate < 90)  stressLevel = 7;
        else                           stressLevel = 9;
      }

      setMetrics({
        steps:         finalSteps,
        heartRate:     finalHeartRate,
        calories:      finalCalories,
        sleepHours:    finalSleep,
        activeMinutes: finalActive,
        distance:      finalDistance,
      });
      setStatus('success');

      // Persist supported columns into health_metrics table
      // Only insert if we have at least one real data point
      if (finalSteps !== null || finalHeartRate !== null || finalSleep !== null) {
        await supabase.from('health_metrics').insert({
          user_id:        user.id,
          steps:          finalSteps,
          heart_rate:     finalHeartRate,
          sleep_hours:    finalSleep,
          stress_level:   stressLevel,
          calories:       finalCalories,
          active_minutes: finalActive,
          distance_km:    finalDistance,
        });
      }
    } catch (e: any) {
      console.error('[useGoogleFit] error:', e.message);
      setError(e.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return { metrics, status, error, refetch: fetchMetrics };
}
