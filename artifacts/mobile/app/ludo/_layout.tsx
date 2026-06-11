import { Stack } from 'expo-router';
import React from 'react';
import { useColors } from '@/hooks/useColors';

export default function LudoLayout() {
  const colors = useColors();
  const bg = colors.background;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 200,
        contentStyle: { backgroundColor: bg },
        freezeOnBlur: true,
      }}
    />
  );
}
