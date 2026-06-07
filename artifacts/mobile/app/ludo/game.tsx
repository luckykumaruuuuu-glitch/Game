import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, SafeAreaView,
  StatusBar, Modal, Dimensions, ScrollView, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LudoBoard, { PLAYER_COLORS, PLAYER_LIGHT, PLAYER_DARK, PLAYER_NAMES_DEFAULT } from './components/LudoBoard';
import { useGameEngine, GameMode, PlayerConfig } from '../../lib/ludo/engine';
import { Personality } from '../../lib/ludo/bot-ai';

const { width: SCREEN_W } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_W - 24, 380);

const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

function parsePlayers(configStr: string, mode: GameMode): PlayerConfig[] {
  try {
    const raw: { name: string; type: string; personality: string | null }[] = JSON.parse(configStr);
    return raw.map(r => ({
      name: r.name || '',
      type: r.type === 'player' ? 'PLAYER' : r.type === 'bot' ? 'BOT' : undefined,
      personality: (r.personality as Personality) ?? undefined,
    }));
  } catch {
    // fallback: 1 human vs 3 bots
    return [
      { name: 'You', type: 'PLAYER' },
      { name: 'Bot Yellow', type: 'BOT', personality: 'balanced' },
      { name: 'Bot Red', type: 'BOT', personality: 'aggressive' },
      { name: 'Bot Blue', type: 'BOT', personality: 'defensive' },
    ];
  }
}

export default function GameScreen() {
  const { mode, config: configStr } = useLocalSearchParams<{ mode: string; config: string }>();
  const gameMode = (mode === 'offline' ? 'offline' : 'ai') as GameMode;
  const playerConfigs = parsePlayers(configStr ?? '', gameMode);

  const { state, rollDice, selectToken, dismissPassPrompt, restart, triggerBotMove } = useGameEngine(
    playerConfigs,
    gameMode
  );

  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [rolling, setRolling] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const currentIsBot = state.playerTypes[state.currentPlayerIndex] === 'BOT';
  const playerNames = state.playerNames;

  // Bot auto-play
  useEffect(() => {
    if (
      state.phase === 'AWAITING_ROLL' &&
      currentIsBot &&
      !state.passPhonePrompt
    ) {
      botTimerRef.current = setTimeout(() => {
        triggerBotMove();
      }, 900);
    }
    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [state.phase, state.currentPlayerIndex, state.passPhonePrompt, currentIsBot]);

  // Show result when game ends
  useEffect(() => {
    if (state.phase === 'GAME_ENDED') {
      setTimeout(() => setShowResult(true), 600);
    }
  }, [state.phase]);

  function handleRoll() {
    if (state.phase !== 'AWAITING_ROLL' || currentIsBot) return;
    setRolling(true);
    setTimeout(() => {
      rollDice();
      setRolling(false);
    }, 300);
  }

  function handleRestart() {
    setShowResult(false);
    restart(playerConfigs, gameMode);
  }

  const activeName = playerNames[state.currentPlayerIndex] ||
    PLAYER_NAMES_DEFAULT[state.currentPlayerIndex];
  const activeColor = PLAYER_COLORS[state.currentPlayerIndex];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => {
          Alert.alert('Quit Game?', 'Progress will be lost.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Quit', style: 'destructive', onPress: () => router.back() },
          ]);
        }}>
          <Ionicons name="chevron-back" size={22} color="#A78BFA" />
        </Pressable>
        <Text style={styles.headerTitle}>🎲 Ludo</Text>
        <View style={styles.turnCount}>
          <Text style={styles.turnCountText}>Turn {state.turnCount}</Text>
        </View>
      </View>

      {/* Turn indicator */}
      <View style={[styles.turnBanner, { backgroundColor: activeColor + '22', borderColor: activeColor + '55' }]}>
        <View style={[styles.turnDot, { backgroundColor: activeColor }]} />
        <Text style={[styles.turnText, { color: activeColor }]}>
          {currentIsBot
            ? `${activeName} is thinking...`
            : state.phase === 'AWAITING_SELECTION'
            ? `${activeName} — pick a token`
            : `${activeName}'s turn`}
        </Text>
        {state.diceRoll > 0 && state.phase !== 'AWAITING_ROLL' && (
          <Text style={styles.diceFace}>{DICE_FACES[state.diceRoll]}</Text>
        )}
      </View>

      {/* Board */}
      <View style={styles.boardWrap}>
        <LudoBoard
          tokenPositions={state.tokenPositions}
          activePlayerIndex={state.currentPlayerIndex}
          movableTokenIndexes={state.phase === 'AWAITING_SELECTION' ? state.movableTokenIndexes : []}
          onTokenPress={selectToken}
          boardSize={BOARD_SIZE}
          playerNames={playerNames.map((n, i) => n || PLAYER_NAMES_DEFAULT[i])}
        />
      </View>

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>
        {/* Player captures */}
        <View style={styles.statsRow}>
          {state.playerTypes.map((type, i) => {
            if (!type) return null;
            return (
              <View key={i} style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: PLAYER_COLORS[i] }]} />
                <Text style={styles.statText}>
                  ×{state.playerCaptures[i]}
                </Text>
                {state.playerRanks[i] > 0 && (
                  <Text style={[styles.rankBadge, { color: state.playerRanks[i] === 1 ? '#F59E0B' : '#9CA3AF' }]}>
                    #{state.playerRanks[i]}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Roll button */}
        {!currentIsBot && state.phase === 'AWAITING_ROLL' && (
          <Pressable
            onPress={handleRoll}
            style={({ pressed }) => [
              styles.rollBtn,
              { backgroundColor: activeColor, opacity: pressed || rolling ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.rollBtnText}>
              {rolling ? '...' : `Roll Dice ${state.consecutiveSixes > 0 ? '🎲🎲' : '🎲'}`}
            </Text>
          </Pressable>
        )}

        {state.phase === 'AWAITING_SELECTION' && (
          <View style={[styles.hintBox, { borderColor: activeColor + '44' }]}>
            <Ionicons name="hand-left-outline" size={18} color={activeColor} />
            <Text style={[styles.hintText, { color: activeColor }]}>
              Tap a highlighted token to move it
            </Text>
          </View>
        )}

        {currentIsBot && state.phase === 'AWAITING_ROLL' && (
          <View style={styles.botThinking}>
            <Text style={styles.botThinkingText}>🤖 Bot is deciding...</Text>
          </View>
        )}
      </View>

      {/* Pass phone modal (offline mode) */}
      <Modal
        visible={state.passPhonePrompt}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.passCard}>
            <Text style={styles.passEmoji}>📱</Text>
            <Text style={styles.passTitle}>Pass the Phone</Text>
            <Text style={styles.passSubtitle}>
              Hand it to{' '}
              <Text style={{ color: PLAYER_COLORS[state.currentPlayerIndex], fontWeight: '700' }}>
                {playerNames[state.currentPlayerIndex] || PLAYER_NAMES_DEFAULT[state.currentPlayerIndex]}
              </Text>
            </Text>
            <Pressable
              onPress={dismissPassPrompt}
              style={[styles.passBtn, { backgroundColor: PLAYER_COLORS[state.currentPlayerIndex] }]}
            >
              <Text style={styles.passBtnText}>Ready! ✓</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Game result modal */}
      <Modal
        visible={showResult}
        transparent
        animationType="slide"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>🏆</Text>
            <Text style={styles.resultTitle}>Game Over!</Text>
            {state.playerRanks.map((rank, i) => {
              if (!state.playerTypes[i] || rank === 0) return null;
              return (
                <View key={i} style={styles.resultRow}>
                  <Text style={styles.resultRank}>#{rank}</Text>
                  <View style={[styles.resultDot, { backgroundColor: PLAYER_COLORS[i] }]} />
                  <Text style={styles.resultName}>
                    {playerNames[i] || PLAYER_NAMES_DEFAULT[i]}
                  </Text>
                  {rank === 1 && <Text style={styles.winnerBadge}>🥇</Text>}
                </View>
              );
            })}
            <View style={styles.resultBtns}>
              <Pressable
                onPress={handleRestart}
                style={[styles.resultBtn, { backgroundColor: '#7C3AED' }]}
              >
                <Text style={styles.resultBtnText}>Play Again</Text>
              </Pressable>
              <Pressable
                onPress={() => { setShowResult(false); router.replace('/ludo'); }}
                style={[styles.resultBtn, { backgroundColor: '#374151' }]}
              >
                <Text style={styles.resultBtnText}>Menu</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F1A' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8, gap: 12,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#1E1B2E', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  turnCount: { backgroundColor: '#1E1B2E', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  turnCountText: { fontSize: 12, color: '#6B7280' },
  turnBanner: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 12, marginBottom: 8,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, gap: 8,
  },
  turnDot: { width: 8, height: 8, borderRadius: 4 },
  turnText: { flex: 1, fontSize: 14, fontWeight: '600' },
  diceFace: { fontSize: 22 },
  boardWrap: { alignItems: 'center', paddingVertical: 4 },
  bottomPanel: { flex: 1, paddingHorizontal: 16, paddingTop: 8, justifyContent: 'flex-start', gap: 8 },
  statsRow: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statDot: { width: 10, height: 10, borderRadius: 5 },
  statText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  rankBadge: { fontSize: 11, fontWeight: '700' },
  rollBtn: {
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 6, elevation: 6,
  },
  rollBtnText: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  hintBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: '#1A1A2E',
  },
  hintText: { fontSize: 14, fontWeight: '600' },
  botThinking: {
    alignItems: 'center', paddingVertical: 14,
    backgroundColor: '#1A1A2E', borderRadius: 12,
  },
  botThinkingText: { fontSize: 14, color: '#6B7280' },
  modalOverlay: {
    flex: 1, backgroundColor: '#000000BB',
    alignItems: 'center', justifyContent: 'center',
  },
  passCard: {
    backgroundColor: '#1A1A2E', borderRadius: 24,
    padding: 32, alignItems: 'center', width: '80%', gap: 12,
  },
  passEmoji: { fontSize: 48 },
  passTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  passSubtitle: { fontSize: 16, color: '#9CA3AF', textAlign: 'center' },
  passBtn: {
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32,
    marginTop: 8,
  },
  passBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  resultCard: {
    backgroundColor: '#1A1A2E', borderRadius: 24,
    padding: 28, alignItems: 'center', width: '85%', gap: 10,
  },
  resultEmoji: { fontSize: 48 },
  resultTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  resultRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, width: '100%', paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: '#374151',
  },
  resultRank: { fontSize: 18, fontWeight: '800', color: '#9CA3AF', width: 32 },
  resultDot: { width: 12, height: 12, borderRadius: 6 },
  resultName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#F9FAFB' },
  winnerBadge: { fontSize: 20 },
  resultBtns: { flexDirection: 'row', gap: 12, marginTop: 8, width: '100%' },
  resultBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center',
  },
  resultBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
