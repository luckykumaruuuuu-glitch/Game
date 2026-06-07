import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, SafeAreaView,
  ScrollView, TextInput, StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PLAYER_COLORS, PLAYER_LIGHT, PLAYER_DARK, PLAYER_NAMES_DEFAULT } from './components/LudoBoard';
import { randomPersonality } from '../../lib/ludo/bot-ai';

const PLAYER_ICONS = ['🟢', '🟡', '🔴', '🔵'];

export default function GameSetupScreen() {
  const { mode } = useLocalSearchParams<{ mode: 'offline' | 'ai' }>();
  const isAI = mode === 'ai';

  const [playerCount, setPlayerCount] = useState(isAI ? 2 : 2);
  const [playerNames, setPlayerNames] = useState(
    PLAYER_NAMES_DEFAULT.map((n, i) => n)
  );

  const minPlayers = 2;
  const maxPlayers = isAI ? 4 : 4;

  function getActivePlayers() {
    if (isAI) {
      return [0];
    }
    if (playerCount === 2) return [0, 2];
    if (playerCount === 3) return [0, 1, 2];
    return [0, 1, 2, 3];
  }

  function handleStart() {
    const active = getActivePlayers();
    const config = Array.from({ length: 4 }, (_, i) => {
      const isActive = active.includes(i);
      if (!isActive) return { name: '', type: 'none', personality: null };
      if (isAI && i !== 0) return {
        name: `Bot ${PLAYER_NAMES_DEFAULT[i]}`,
        type: 'bot',
        personality: randomPersonality(),
      };
      return { name: playerNames[i] || PLAYER_NAMES_DEFAULT[i], type: 'player', personality: null };
    });
    const configStr = JSON.stringify(config);
    router.push(`/ludo/game?mode=${mode}&config=${encodeURIComponent(configStr)}`);
  }

  const active = getActivePlayers();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#A78BFA" />
          </Pressable>
          <Text style={styles.title}>
            {isAI ? 'Play vs Computer' : 'Offline Friends'}
          </Text>
          <Text style={styles.subtitle}>
            {isAI ? 'You vs AI bots' : 'Pass the phone between players'}
          </Text>
        </View>

        {/* Player count picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {isAI ? 'Number of Bots' : 'Number of Players'}
          </Text>
          <View style={styles.countRow}>
            {[2, 3, 4].map(n => (
              <Pressable
                key={n}
                onPress={() => setPlayerCount(n)}
                style={[styles.countBtn, playerCount === n && styles.countBtnActive]}
              >
                <Text style={[styles.countBtnText, playerCount === n && styles.countBtnTextActive]}>
                  {isAI ? `${n - 1} Bot${n > 2 ? 's' : ''}` : `${n} Players`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Player cards */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Players</Text>
          {Array.from({ length: 4 }, (_, i) => {
            const isActive = active.includes(i);
            const isBot = isAI && i !== 0;
            if (!isActive) return null;
            return (
              <View key={i} style={[styles.playerCard, { borderColor: PLAYER_COLORS[i] + '66' }]}>
                <View style={[styles.playerIcon, { backgroundColor: PLAYER_COLORS[i] + '22' }]}>
                  <Text style={{ fontSize: 22 }}>{PLAYER_ICONS[i]}</Text>
                </View>
                <View style={styles.playerInfo}>
                  {isBot ? (
                    <View>
                      <Text style={[styles.playerLabel, { color: PLAYER_COLORS[i] }]}>
                        Bot {PLAYER_NAMES_DEFAULT[i]}
                      </Text>
                      <Text style={styles.playerRole}>AI Opponent</Text>
                    </View>
                  ) : (
                    <View style={styles.inputWrap}>
                      <TextInput
                        style={[styles.nameInput, { color: PLAYER_COLORS[i] }]}
                        value={playerNames[i]}
                        onChangeText={t => {
                          const copy = [...playerNames];
                          copy[i] = t;
                          setPlayerNames(copy);
                        }}
                        placeholder={PLAYER_NAMES_DEFAULT[i]}
                        placeholderTextColor={PLAYER_COLORS[i] + '77'}
                        maxLength={16}
                      />
                      <Text style={styles.playerRole}>
                        {i === 0 && isAI ? 'You' : 'Human Player'}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={[styles.colorDot, { backgroundColor: PLAYER_COLORS[i] }]} />
              </View>
            );
          })}
        </View>

        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [styles.startBtn, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={styles.startBtnText}>Start Game</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F1A' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  header: { marginBottom: 28 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1E1B2E', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280' },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#9CA3AF', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  countRow: { flexDirection: 'row', gap: 10 },
  countBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#1A1A2E', borderWidth: 1.5, borderColor: '#374151',
    alignItems: 'center',
  },
  countBtnActive: { backgroundColor: '#2D1B69', borderColor: '#8B5CF6' },
  countBtnText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  countBtnTextActive: { color: '#A78BFA' },
  playerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A2E', borderRadius: 14,
    padding: 14, marginBottom: 10, borderWidth: 1.5, gap: 12,
  },
  playerIcon: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  playerInfo: { flex: 1 },
  playerLabel: { fontSize: 16, fontWeight: '700' },
  playerRole: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  inputWrap: { gap: 2 },
  nameInput: { fontSize: 16, fontWeight: '700', paddingVertical: 0 },
  colorDot: { width: 14, height: 14, borderRadius: 7 },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#7C3AED', borderRadius: 16,
    paddingVertical: 16, gap: 10, marginTop: 8,
  },
  startBtnText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});
