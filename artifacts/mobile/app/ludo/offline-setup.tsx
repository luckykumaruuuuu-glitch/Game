import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { ThemedBackground } from '@/components/ThemedBackground';
import { useColors } from '@/hooks/useColors';
import { COLOR_HEX, type LudoColor } from '@/lib/ludoEngine';

const OFFLINE_COLORS: Record<number, LudoColor[]> = {
  2: ['red', 'green'],
  3: ['red', 'green', 'yellow'],
  4: ['red', 'green', 'yellow', 'blue'],
};

const COLOR_EMOJIS: Record<LudoColor, string> = {
  red: '🔴',
  green: '🟢',
  yellow: '🟡',
  blue: '🔵',
};

export default function OfflineSetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [names, setNames] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4']);

  const playerColors = OFFLINE_COLORS[playerCount];

  function updateName(i: number, text: string) {
    const updated = [...names];
    updated[i] = text;
    setNames(updated);
  }

  function handleStart() {
    const trimmed = names
      .slice(0, playerCount)
      .map((n, i) => ({ name: n.trim() || `Player ${i + 1}`, color: playerColors[i] }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push({
      pathname: '/ludo/offline-game',
      params: { players: JSON.stringify(trimmed) },
    });
  }

  return (
    <ThemedBackground>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.title, { color: colors.foreground }]}>🎲 Offline Friends</Text>
            <Text style={[styles.titleSub, { color: colors.mutedForeground }]}>Pass & Play · No Internet</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Player Count */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>NUMBER OF PLAYERS</Text>
        <View style={styles.countRow}>
          {([2, 3, 4] as const).map(n => {
            const active = playerCount === n;
            return (
              <TouchableOpacity
                key={n}
                style={[
                  styles.countCard,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  setPlayerCount(n);
                  Haptics.selectionAsync();
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.countNum, { color: active ? '#fff' : colors.foreground }]}>{n}</Text>
                <Text style={[styles.countSub, { color: active ? '#ffffffcc' : colors.mutedForeground }]}>
                  Players
                </Text>
                <View style={styles.colorDots}>
                  {OFFLINE_COLORS[n].map(c => (
                    <View key={c} style={[styles.colorDot, { backgroundColor: COLOR_HEX[c] }]} />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Player Names */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PLAYER NAMES</Text>
        {playerColors.map((color, i) => (
          <GlassCard key={color} padding={14} style={styles.playerRow}>
            <View style={[styles.colorCircle, { backgroundColor: COLOR_HEX[color] }]}>
              <Text style={styles.colorEmoji}>{COLOR_EMOJIS[color]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.playerTag, { color: colors.mutedForeground }]}>
                Player {i + 1} · {color.toUpperCase()}
              </Text>
              <TextInput
                style={[styles.nameInput, { color: colors.foreground, borderBottomColor: colors.border }]}
                value={names[i]}
                onChangeText={text => updateName(i, text)}
                placeholder={`Player ${i + 1}`}
                placeholderTextColor={colors.mutedForeground}
                maxLength={16}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          </GlassCard>
        ))}

        {/* Info */}
        <GlassCard padding={14} style={styles.infoCard}>
          <Text style={styles.infoIcon}>📱</Text>
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            Pass your phone to each player on their turn. No internet required — completely offline!
          </Text>
        </GlassCard>

        {/* Start */}
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: colors.primary }]}
          onPress={handleStart}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>🎲 Start Game</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  titleSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1, marginTop: 4 },
  countRow: { flexDirection: 'row', gap: 12 },
  countCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  countNum: { fontSize: 32, fontFamily: 'Inter_700Bold' },
  countSub: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  colorDots: { flexDirection: 'row', gap: 4, marginTop: 6 },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  colorCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorEmoji: { fontSize: 22 },
  playerTag: { fontSize: 11, fontFamily: 'Inter_500Medium', marginBottom: 5 },
  nameInput: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  infoIcon: { fontSize: 26 },
  infoText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  startBtn: {
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 6,
  },
  startBtnText: { color: '#fff', fontSize: 17, fontFamily: 'Inter_700Bold' },
});
