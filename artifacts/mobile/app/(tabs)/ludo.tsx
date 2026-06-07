import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { useLudo } from '@/context/LudoContext';

export default function LudoTab() {
  const { show } = useLudo();

  useFocusEffect(useCallback(() => {
    if (Platform.OS === 'web') {
      router.push('/ludo' as any);
    } else {
      show();
    }
  }, [show]));

  return null;
}
