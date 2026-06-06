import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedBackground } from '@/components/ThemedBackground';
import LudoBoard from '@/components/ludo/LudoBoard';
import { useColors } from '@/hooks/useColors';
import {
  COLOR_HEX,
  getMovableTokens,
  applyMove,
  getNextTurn,
  checkWinner,
  type LudoColor,
  type LudoGameState,
} from '@/lib/ludoEngine';

const { width: SCREEN_W } = Dimensions.get('window');
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

type OfflinePlayer = { name: string; color: LudoColor };
type PlayerStats = { captures: number; diceRolls: number; totalMoves: number };

function makeTokens(playerColors: LudoColor[]): Record<LudoColor, number[]> {
  const result: Partial<Record<LudoColor, number[]>> = {};
  for (const c of playerColors) result[c] = [-1, -1, -1, -1];
  return result as Record<LudoColor, number[]>;
}

function makeStats(playerColors: LudoColor[]): Record<LudoColor, PlayerStats> {
  const result: Partial<Record<LudoColor, PlayerStats>> = {};
  for (const c of playerColors) result[c] = { captures: 0, diceRolls: 0, totalMoves: 0 };
  return result as Record<LudoColor, PlayerStats>;
}

export default function OfflineGameScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { players: playersParam } = useLocalSearchParams<{ players: string }>();
  const boardSize = Math.min(SCREEN_W - 32, 380);

  const players: OfflinePlayer[] = React.useMemo(() => {
    try { return JSON.parse(playersParam ?? '[]'); } catch { return []; }
  }, [playersParam]);

  const playerColors = players.map(p => p.color);

  const [gameState, setGameState] = useState<LudoGameState>(() => ({
    tokens: makeTokens(playerColors),
    currentTurn: playerColors[0],
    diceValue: null,
    diceRolled: false,
    winner: null,
    rankings: [],
  }));

  const [stats, setStats] = useState<Record<LudoColor, PlayerStats>>(() =>
    makeStats(playerColors)
  );

  const [rolling, setRolling] = useState(false);
  const [diceDisplay, setDiceDisplay] = useState(1);
  const [processing, setProcessing] = useState(false);

  // Pass-phone overlay
  const [showPass, setShowPass] = useState(false);
  const [nextPassPlayer, setNextPassPlayer] = useState<OfflinePlayer | null>(null);

  const currentPlayer = players.find(p => p.color === gameState.currentTurn);

  const movableTokens =
    gameState.diceRolled && gameState.diceValue !== null
      ? getMovableTokens(
          gameState.tokens[gameState.currentTurn] ?? [-1, -1, -1, -1],
          gameState.diceValue
        )
      : [];

  const canRoll = !gameState.diceRolled && !rolling && !processing && !showPass;

  function triggerPassScreen(nextColor: LudoColor) {
    const next = players.find(p => p.color === nextColor);
    if (next) {
      setNextPassPlayer(next);
      setShowPass(true);
    }
  }

  function homeCount(color: LudoColor) {
    return (gameState.tokens[color] ?? [-1, -1, -1, -1]).filter(t => t >= 57).length;
  }

  function handleRollDice() {
    if (!canRoll) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRolling(true);

    let count = 0;
    const interval = setInterval(() => {
      setDiceDisplay(Math.ceil(Math.random() * 6));
      count++;
      if (count > 8) {
        clearInterval(interval);
        const finalVal = Math.ceil(Math.random() * 6);
        setDiceDisplay(finalVal);
        setRolling(false);
        commitRoll(finalVal);
      }
    }, 80);
  }

  function commitRoll(dice: number) {
    setProcessing(true);
    const currentColor = gameState.currentTurn;
    const tokens = gameState.tokens[currentColor] ?? [-1, -1, -1, -1];
    const movable = getMovableTokens(tokens, dice);

    // Track dice roll
    setStats(prev => ({
      ...prev,
      [currentColor]: { ...prev[currentColor], diceRolls: prev[currentColor].diceRolls + 1 },
    }));

    if (movable.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      const nextColor = getNextTurn(currentColor, playerColors);
      setGameState(prev => ({
        ...prev,
        diceValue: dice,
        diceRolled: false,
        currentTurn: nextColor,
      }));
      setProcessing(false);
      triggerPassScreen(nextColor);
    } else {
      setGameState(prev => ({ ...prev, diceValue: dice, diceRolled: true }));
      setProcessing(false);
    }
  }

  function handleTokenPress(tokenIdx: number) {
    if (!gameState.diceRolled || gameState.diceValue === null || processing || showPass) return;
    if (!movableTokens.includes(tokenIdx)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProcessing(true);

    const currentColor = gameState.currentTurn;
    const dice = gameState.diceValue;
    const result = applyMove(
      currentColor,
      tokenIdx,
      gameState.tokens[currentColor] ?? [-1, -1, -1, -1],
      dice,
      gameState.tokens
    );

    // Apply captures
    let newTokens = { ...gameState.tokens, [currentColor]: result.newPositions };
    for (const cap of result.captures) {
      const arr = [...(newTokens[cap.color] ?? [-1, -1, -1, -1])];
      arr[cap.tokenIdx] = -1;
      newTokens = { ...newTokens, [cap.color]: arr };
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Compute updated stats (inline so we can pass to results screen if game over)
    const newStats: Record<LudoColor, PlayerStats> = {
      ...stats,
      [currentColor]: {
        ...stats[currentColor],
        captures: stats[currentColor].captures + result.captures.length,
        totalMoves: stats[currentColor].totalMoves + 1,
      },
    };
    setStats(newStats);

    const winner = checkWinner(newTokens);
    const rankings = [...gameState.rankings];
    if (result.finished && !rankings.includes(currentColor)) rankings.push(currentColor);

    const extraTurn = result.extraTurn && !winner;
    const nextColor = extraTurn ? currentColor : getNextTurn(currentColor, playerColors);

    const newState: LudoGameState = {
      tokens: newTokens as Record<LudoColor, number[]>,
      currentTurn: nextColor,
      diceValue: null,
      diceRolled: false,
      winner: winner ?? null,
      rankings,
    };

    setGameState(newState);
    setProcessing(false);

    if (winner) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: '/ludo/offline-results',
        params: {
          players: playersParam,
          rankings: JSON.stringify(rankings),
          stats: JSON.stringify(newStats),
        },
      });
    } else if (!extraTurn) {
      triggerPassScreen(nextColor);
    }
  }

  function handleLeave() {
    Alert.alert('Quit Game', 'Are you sure you want to quit?', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Quit', style: 'destructive', onPress: () => router.replace('/ludo') },
    ]);
  }

  const topPlayers = players.slice(0, 2);
  const bottomPlayers = players.slice(2);

  return (
    <ThemedBackground>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 },
        ]}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={handleLeave}
            style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.turnIndicator}>
            <View style={[styles.turnDot, { backgroundColor: COLOR_HEX[gameState.currentTurn] }]} />
            <Text style={[styles.turnText, { color: colors.foreground }]}>
              {currentPlayer?.name ?? '?'}'s Turn
            </Text>
          </View>
          <View style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 16 }}>📱</Text>
          </View>
        </View>

        {/* Top Players */}
        <View style={styles.playersRow}>
          {topPlayers.map(p => (
            <OfflinePlayerCard
              key={p.color}
              player={p}
              isActive={gameState.currentTurn === p.color}
              homePieces={homeCount(p.color)}
            />
          ))}
        </View>

        {/* Board */}
        <View style={styles.boardContainer}>
          <LudoBoard
            gameState={gameState}
            activeColors={playerColors}
            myColor={gameState.currentTurn}
            movableTokens={movableTokens}
            onTokenPress={handleTokenPress}
            boardSize={boardSize}
            disabled={!gameState.diceRolled || processing || showPass}
          />
        </View>

        {/* Bottom Players (3–4 player games) */}
        {bottomPlayers.length > 0 && (
          <View style={styles.playersRow}>
            {bottomPlayers.map(p => (
              <OfflinePlayerCard
                key={p.color}
                player={p}
                isActive={gameState.currentTurn === p.color}
                homePieces={homeCount(p.color)}
              />
            ))}
          </View>
        )}

        {/* Dice + Hint */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={handleRollDice} disabled={!canRoll} activeOpacity={0.7}>
            <View
              style={[
                styles.dice,
                {
                  backgroundColor: canRoll
                    ? COLOR_HEX[gameState.currentTurn]
                    : colors.card,
                  borderColor: canRoll
                    ? COLOR_HEX[gameState.currentTurn]
                    : colors.border,
                  opacity: canRoll ? 1 : 0.6,
                },
              ]}
            >
              <Text style={styles.diceFace}>
                {rolling
                  ? DICE_FACES[diceDisplay - 1]
                  : gameState.diceValue !== null
                    ? DICE_FACES[gameState.diceValue - 1]
                    : '🎲'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={[styles.hint, { color: colors.foreground }]}>
              {!gameState.diceRolled
                ? canRoll
                  ? `${currentPlayer?.name}, tap to roll!`
                  : 'Rolling...'
                : movableTokens.length > 0
                  ? `Pick a token! (rolled ${gameState.diceValue})`
                  : 'No valid moves'}
            </Text>
            <View style={styles.colorRow}>
              <View
                style={[styles.colorDot, { backgroundColor: COLOR_HEX[gameState.currentTurn] }]}
              />
              <Text style={[styles.colorLabel, { color: colors.mutedForeground }]}>
                {currentPlayer?.name} · {gameState.currentTurn.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Pass Phone Overlay ───────────────────────────────────────────────── */}
      <Modal visible={showPass} transparent animationType="fade" statusBarTranslucent>
        <Pressable style={styles.passOverlay} onPress={() => setShowPass(false)}>
          <View style={[StyleSheet.absoluteFill, styles.passBackdrop]} />
          {Platform.OS !== 'android' && (
            <BlurView
              intensity={90}
              tint="dark"
              style={[StyleSheet.absoluteFill, { opacity: 0.9 }]}
            />
          )}
          {nextPassPlayer && (
            <View style={[styles.passCard, { backgroundColor: colors.card }]}>
              <Text style={styles.passHandIcon}>📱</Text>
              <Text style={[styles.passTitle, { color: colors.foreground }]}>Pass the Phone</Text>
              <View
                style={[
                  styles.passPlayerBadge,
                  {
                    backgroundColor: COLOR_HEX[nextPassPlayer.color] + '22',
                    borderColor: COLOR_HEX[nextPassPlayer.color],
                  },
                ]}
              >
                <View
                  style={[
                    styles.passDot,
                    { backgroundColor: COLOR_HEX[nextPassPlayer.color] },
                  ]}
                />
                <Text
                  style={[styles.passPlayerName, { color: COLOR_HEX[nextPassPlayer.color] }]}
                >
                  {nextPassPlayer.name}
                </Text>
              </View>
              <Text style={[styles.passSub, { color: colors.mutedForeground }]}>
                Hand the phone to {nextPassPlayer.name} to take their turn.
              </Text>
              <TouchableOpacity
                style={[
                  styles.passBtn,
                  { backgroundColor: COLOR_HEX[nextPassPlayer.color] },
                ]}
                onPress={() => setShowPass(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.passBtnText}>I'm Ready — Let's Play! 🎲</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Modal>
    </ThemedBackground>
  );
}

function OfflinePlayerCard({
  player,
  isActive,
  homePieces,
}: {
  player: OfflinePlayer;
  isActive: boolean;
  homePieces: number;
}) {
  const colorHex = COLOR_HEX[player.color];
  return (
    <View
      style={[
        styles.playerCard,
        {
          borderColor: isActive ? colorHex : 'transparent',
          borderWidth: isActive ? 2 : 1,
          backgroundColor: isActive ? colorHex + '18' : 'transparent',
        },
      ]}
    >
      <View style={[styles.playerAvatar, { backgroundColor: colorHex }]}>
        <Text style={styles.playerAvatarLetter}>
          {player.name[0]?.toUpperCase() ?? '?'}
        </Text>
      </View>
      <View>
        <Text
          style={[styles.playerName, { color: isActive ? colorHex : '#fff' }]}
          numberOfLines={1}
        >
          {player.name}
        </Text>
        <Text style={styles.playerScore}>
          {'🏠'.repeat(homePieces)}
          {'⚫'.repeat(4 - homePieces)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    gap: 10,
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF15',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  turnDot: { width: 10, height: 10, borderRadius: 5 },
  turnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  playersRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'space-between',
  },
  playerCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: '48%',
  },
  playerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerAvatarLetter: { color: '#fff', fontSize: 14, fontFamily: 'Inter_700Bold' },
  playerName: { fontSize: 12, fontFamily: 'Inter_600SemiBold', maxWidth: 80 },
  playerScore: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 2 },
  boardContainer: { alignItems: 'center', justifyContent: 'center' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    paddingHorizontal: 4,
  },
  dice: {
    width: 70,
    height: 70,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  diceFace: { fontSize: 40 },
  hint: { fontSize: 15, fontFamily: 'Inter_600SemiBold', lineHeight: 22 },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  colorLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },

  // Pass overlay
  passOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  passBackdrop: { backgroundColor: 'rgba(0,0,0,0.78)' },
  passCard: {
    width: '100%',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 30,
  },
  passHandIcon: { fontSize: 52 },
  passTitle: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  passPlayerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1.5,
  },
  passDot: { width: 12, height: 12, borderRadius: 6 },
  passPlayerName: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  passSub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 21,
  },
  passBtn: {
    width: '100%',
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  passBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
});
