import { Stack } from 'expo-router';
import React from 'react';
import { useColors } from '@/hooks/useColors';

export default function LudoLayout() {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
