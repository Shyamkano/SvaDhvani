import CustomTabBar from '@/components/CustomTabBar';
import { Tabs } from 'expo-router';
import React from 'react';


// Corrected icon imports
import {
  Home01Icon as home,
  ChartIcon as metrics,
  HeadphonesIcon as player,
  AccountSetting01Icon as profile
} from '@hugeicons/core-free-icons';

import { HugeiconsIcon } from '@hugeicons/react-native';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* This handles the redirect from your splash screen */}
      <Tabs.Screen
        name="index"
        options={{ href: null }}
      />

      {/* Your actual screens */}
      <Tabs.Screen
        name="home" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <HugeiconsIcon icon={home} size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="player"
        options={{
          title: 'Player',
          tabBarIcon: ({ color, focused }) => <HugeiconsIcon icon={player} size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="metrics"
        options={{
          title: 'Metrics',
          tabBarIcon: ({ color, focused }) => <HugeiconsIcon icon={metrics} size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <HugeiconsIcon icon={profile} size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}