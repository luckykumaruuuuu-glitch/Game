import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedBackground } from '@/components/ThemedBackground';
import { GlassCard } from '@/components/GlassCard';
import { useColors } from '@/hooks/useColors';

export default function GamePlaceholder() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <ThemedBackground>
      <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>

        <GlassCard style={styles.card} padding={36}>
          <Text style={styles.icon}>🎲</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Game Coming Soon</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            A new and improved game system is being set up. Stay tuned!
          </Text>
        </GlassCard>
      </View>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'stretch',
    gap: 24,
  },
  backBtn: {
    alignSelf: 'flex-start',
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    gap: 16,
    marginTop: 40,
  },
  icon: { fontSize: 64 },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  subtitle: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    textAlign: 'center', lineHeight: 22, maxWidth: 260,
  },
});
