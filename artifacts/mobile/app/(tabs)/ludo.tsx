import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { router } from 'expo-router';
import { useLudo } from '@/context/LudoContext';
import { useColors } from '@/hooks/useColors';

export default function LudoTab() {
  const { show } = useLudo();
  const colors = useColors();

  useFocusEffect(useCallback(() => {
    if (Platform.OS === 'web') {
      router.push('/ludo' as any);
    } else {
      show();
    }
  }, [show]));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
