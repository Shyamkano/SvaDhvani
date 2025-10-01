import { Tabs } from 'expo-router';
import React from 'react';

import CustomTabBar from '@/components/CustomTabBar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ChartIcon as metrics, HeadphonesIcon as player, AccountSetting01FreeIcons as profile } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import home from './home';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      // Use our custom component for the tab bar
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />

      {/* 
        ✅ FIX 2: Your actual Home screen.
        The name "home" now correctly corresponds to your home.tsx file.
      */}
      <Tabs.Screen
        name="home" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <HugeiconsIcon icon={home} size={28} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="player"
        options={{
          title: 'Player',
          tabBarIcon: ({ color }) => <HugeiconsIcon icon={player} size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="metrics"
        options={{
          title: 'Metrics',
          tabBarIcon: ({ color }) => <HugeiconsIcon icon={metrics} size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <HugeiconsIcon icon={profile} size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
