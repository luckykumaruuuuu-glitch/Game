import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedBackground } from '@/components/ThemedBackground';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import LudoBoard from '@/components/ludo/LudoBoard';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import {
  subscribeToRoom,
  updateGameState,
  updatePlayerOnlineStatus,
  pickAIMove,
  type LudoRoom,
  type LudoGameState,
  type LudoPlayer,
} from '@/lib/ludoFirestore';
import {
  COLOR_HEX,
  COLORS_FOR_COUNT,
  getMovableTokens,
  applyMove,
  getNextTurn,
  checkWinner,
  type LudoColor,
} from '@/lib/ludoEngine';

const { width: SCREEN_W } = Dimensions.get('window');
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function GameScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [room, setRoom] = useState<LudoRoom | null>(null);
  const [rolling, setRolling] = useState(false);
  const [diceDisplay, setDiceDisplay] = useState(1);
  const diceAnim = useRef(new Animated.Value(1)).current;
  const [processing, setProcessing] = useState(false);
  const aiProcessingRef = useRef(false);
  const boardSize = Math.min(SCREEN_W - 32, 380);

  // ── Room subscription ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeToRoom(roomId, (r) => {
      if (!r || r.status === 'cancelled') {
        Alert.alert('Game Cancelled', 'The game was cancelled.');
        router.replace('/ludo');
        return;
      }
      setRoom(r);
      if (r.status === 'finished' && r.gameState?.winner) {
        router.replace({ pathname: '/ludo/results', params: { roomId } });
      }
    });
    return unsub;
  }, [roomId]);

  // ── Online status ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId || !user) return;
    updatePlayerOnlineStatus(roomId, user.uid, true).catch(() => {});
    return () => { updatePlayerOnlineStatus(roomId, user.uid, false).catch(() => {}); };
  }, [roomId, user]);

  // ── AI Turn Handler ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!room || !room.gameState || !room.isAIGame) return;

    const gameState = room.gameState;
    const currentColor = gameState.currentTurn;
    const currentPlayer = room.players.find(p => p.color === currentColor);

    if (!currentPlayer?.isAI) return;
    if (aiProcessingRef.current) return;

    const difficulty = currentPlayer.aiDifficulty ?? room.aiDifficulty ?? 'medium';
    const activeColors = COLORS_FOR_COUNT[room.playerCount];
    const delay = 800 + Math.random() * 700; // 0.8-1.5s thinking delay

    const timer = setTimeout(async () => {
      if (aiProcessingRef.current) return;
      aiProcessingRef.current = true;

      try {
        const dice = Math.ceil(Math.random() * 6);
        const tokens = gameState.tokens[currentColor] ?? [-1, -1, -1, -1];
        const movable = getMovableTokens(tokens, dice);

        if (movable.length === 0) {
          // No valid moves — skip turn
          const newGameState: LudoGameState = {
            ...gameState,
            diceValue: dice,
            diceRolled: false,
            currentTurn: getNextTurn(currentColor, activeColors),
            lastActionAt: Date.now(),
          };
          await updateGameState(room.roomId, newGameState);
        } else {
          // Pick best token index
          const tokenIdx = pickAIMove(currentColor, tokens, dice, gameState.tokens, difficulty);
          const result = applyMove(currentColor, tokenIdx, tokens, dice, gameState.tokens);

          let newTokens = { ...gameState.tokens, [currentColor]: result.newPositions };
          for (const cap of result.captures) {
            const arr = [...(newTokens[cap.color] ?? [-1, -1, -1, -1])];
            arr[cap.tokenIdx] = -1;
            newTokens = { ...newTokens, [cap.color]: arr };
          }

          const winner = checkWinner(newTokens);
          const rankings = [...(gameState.rankings ?? [])];
          if (result.finished && !rankings.includes(currentColor)) rankings.push(currentColor);

          const nextTurn = result.extraTurn && !winner
            ? currentColor
            : getNextTurn(currentColor, activeColors);

          const newGameState: LudoGameState = {
            tokens: newTokens as Record<LudoColor, number[]>,
            currentTurn: nextTurn,
            diceValue: null,
            diceRolled: false,
            winner: winner ?? null,
            rankings,
            lastActionAt: Date.now(),
          };

          await updateGameState(room.roomId, newGameState, winner ? 'finished' : undefined);

          if (winner) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace({ pathname: '/ludo/results', params: { roomId: room.roomId } });
          }
        }
      } catch {
        // silently ignore AI errors
      } finally {
        aiProcessingRef.current = false;
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [room?.gameState?.currentTurn, room?.gameState?.lastActionAt, room?.isAIGame]);

  // ── Human actions ─────────────────────────────────────────────────────────
  const gameState = room?.gameState;
  const myPlayer = room?.players.find(p => p.userId === user?.uid);
  const myColor = myPlayer?.color ?? null;
  const activeColors = room ? COLORS_FOR_COUNT[room.playerCount] : [];

  const isMyTurn = gameState?.currentTurn === myColor;
  const canRoll = isMyTurn && !gameState?.diceRolled && !rolling && !processing;
  const diceValue = gameState?.diceValue ?? null;
  const diceRolled = gameState?.diceRolled ?? false;
  const isAITurn = room?.isAIGame && room.players.find(p => p.color === gameState?.currentTurn)?.isAI;

  const movableTokens =
    isMyTurn && diceValue !== null && diceRolled && myColor && gameState
      ? getMovableTokens(gameState.tokens[myColor] ?? [-1, -1, -1, -1], diceValue)
      : [];

  async function handleRollDice() {
    if (!canRoll || !room || !myColor || !gameState) return;
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

  async function commitRoll(dice: number) {
    if (!room || !myColor || !gameState) return;
    setProcessing(true);
    try {
      const tokens = gameState.tokens[myColor] ?? [-1, -1, -1, -1];
      const movable = getMovableTokens(tokens, dice);

      let newGameState: LudoGameState;
      if (movable.length === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        newGameState = {
          ...gameState,
          diceValue: dice,
          diceRolled: false,
          currentTurn: getNextTurn(myColor, activeColors),
          lastActionAt: Date.now(),
        };
      } else {
        newGameState = { ...gameState, diceValue: dice, diceRolled: true, lastActionAt: Date.now() };
      }
      await updateGameState(room.roomId, newGameState);
    } finally {
      setProcessing(false);
    }
  }

  async function handleTokenPress(tokenIdx: number) {
    if (!isMyTurn || !diceRolled || diceValue === null || !myColor || !room || !gameState || processing) return;
    if (!movableTokens.includes(tokenIdx)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProcessing(true);

    try {
      const result = applyMove(myColor, tokenIdx, gameState.tokens[myColor] ?? [-1, -1, -1, -1], diceValue, gameState.tokens);

      let newTokens = { ...gameState.tokens, [myColor]: result.newPositions };
      for (const cap of result.captures) {
        const arr = [...(newTokens[cap.color] ?? [-1, -1, -1, -1])];
        arr[cap.tokenIdx] = -1;
        newTokens = { ...newTokens, [cap.color]: arr };
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const winner = checkWinner(newTokens);
      const rankings = [...(gameState.rankings ?? [])];
      if (result.finished && myColor && !rankings.includes(myColor)) rankings.push(myColor);

      const nextTurn = result.extraTurn && !winner ? myColor : getNextTurn(myColor, activeColors);

      const newGameState: LudoGameState = {
        tokens: newTokens as Record<LudoColor, number[]>,
        currentTurn: nextTurn,
        diceValue: null,
        diceRolled: false,
        winner: winner ?? null,
        rankings,
        lastActionAt: Date.now(),
      };

      await updateGameState(room.roomId, newGameState, winner ? 'finished' : undefined);

      if (winner) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace({ pathname: '/ludo/results', params: { roomId: room.roomId } });
      }
    } finally {
      setProcessing(false);
    }
  }

  async function handleLeave() {
    if (room?.isAIGame) {
      // AI game — just leave
      router.replace('/ludo');
      return;
    }
    Alert.alert('Leave Game', 'Are you sure you want to leave?', [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          if (roomId) await updatePlayerOnlineStatus(roomId, user?.uid ?? '', false).catch(() => {});
          router.replace('/ludo');
        },
      },
    ]);
  }

  if (!room || !gameState) {
    return (
      <ThemedBackground>
        <View style={styles.loadingContainer}>
          <Text style={{ fontSize: 48 }}>🎲</Text>
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading game...</Text>
        </View>
      </ThemedBackground>
    );
  }

  const currentPlayerInfo = room.players.find(p => p.color === gameState.currentTurn);

  return (
    <ThemedBackground>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}
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
              {isMyTurn
                ? '🎯 Your Turn!'
                : isAITurn
                ? `🤖 CPU thinking...`
                : `${currentPlayerInfo?.username ?? '?'}'s turn`}
            </Text>
          </View>
          <View style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {room.isAIGame
              ? <MaterialCommunityIcons name="robot" size={18} color={colors.primary} />
              : <Text style={{ fontSize: 16 }}>🎲</Text>
            }
          </View>
        </View>

        {/* Players Row (top) */}
        <View style={styles.playersTop}>
          {room.players.slice(0, 2).map(player => (
            <PlayerCard
              key={player.userId}
              player={player}
              gameState={gameState}
              isActive={gameState.currentTurn === player.color}
              isMe={player.userId === user?.uid}
            />
          ))}
        </View>

        {/* Board */}
        <View style={styles.boardContainer}>
          <LudoBoard
            gameState={gameState}
            activeColors={activeColors}
            myColor={myColor}
            movableTokens={movableTokens}
            onTokenPress={handleTokenPress}
            boardSize={boardSize}
            disabled={!isMyTurn || !diceRolled || processing || !!isAITurn}
          />
        </View>

        {/* Players Row (bottom) */}
        {room.players.length > 2 && (
          <View style={styles.playersTop}>
            {room.players.slice(2).map(player => (
              <PlayerCard
                key={player.userId}
                player={player}
                gameState={gameState}
                isActive={gameState.currentTurn === player.color}
                isMe={player.userId === user?.uid}
              />
            ))}
          </View>
        )}

        {/* Dice + Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={handleRollDice} disabled={!canRoll} activeOpacity={0.7}>
            <View style={[
              styles.dice,
              {
                backgroundColor: canRoll ? COLOR_HEX[myColor ?? 'red'] : colors.card,
                borderColor: canRoll ? COLOR_HEX[myColor ?? 'red'] : colors.border,
                opacity: isAITurn ? 0.4 : canRoll ? 1 : 0.6,
              },
            ]}>
              <Text style={styles.diceFace}>
                {rolling
                  ? DICE_FACES[diceDisplay - 1]
                  : diceValue !== null
                    ? DICE_FACES[diceValue - 1]
                    : '🎲'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            {isAITurn ? (
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                🤖 CPU is thinking...
              </Text>
            ) : isMyTurn ? (
              <Text style={[styles.hint, { color: colors.foreground }]}>
                {!diceRolled
                  ? canRoll ? '👆 Tap to roll!' : 'Rolling...'
                  : movableTokens.length > 0
                    ? `👇 Pick a token! (${diceValue})`
                    : 'No valid moves'}
              </Text>
            ) : (
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                ⌛ Waiting for {currentPlayerInfo?.username}...
              </Text>
            )}

            {myColor && (
              <View style={styles.myColorRow}>
                <View style={[styles.colorDot, { backgroundColor: COLOR_HEX[myColor] }]} />
                <Text style={[styles.colorLabel, { color: colors.mutedForeground }]}>
                  You: {myColor.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedBackground>
  );
}

function PlayerCard({
  player,
  gameState,
  isActive,
  isMe,
}: {
  player: LudoPlayer;
  gameState: LudoGameState;
  isActive: boolean;
  isMe: boolean;
}) {
  const tokens = gameState.tokens[player.color] ?? [-1, -1, -1, -1];
  const homeCount = tokens.filter(t => t >= 57).length;
  const colorHex = COLOR_HEX[player.color];

  return (
    <View style={[
      styles.playerCard,
      {
        borderColor: isActive ? colorHex : 'transparent',
        borderWidth: isActive ? 2 : 1,
        backgroundColor: isActive ? colorHex + '18' : 'transparent',
      },
    ]}>
      <View style={styles.playerAvatarWrap}>
        {player.isAI ? (
          <View style={[styles.aiAvatar, { backgroundColor: colorHex }]}>
            <MaterialCommunityIcons name="robot" size={16} color="#fff" />
          </View>
        ) : (
          <ProfileAvatar uri={player.photo} size={32} name={player.username} />
        )}
        <View style={[styles.playerOnlineDot, { backgroundColor: player.online ? '#22C55E' : '#9CA3AF' }]} />
      </View>
      <View>
        <Text style={[styles.playerCardName, { color: isActive ? colorHex : '#fff' }]} numberOfLines={1}>
          {isMe ? 'You' : player.isAI ? '🤖 CPU' : player.username}
        </Text>
        <Text style={[styles.playerCardScore, { color: '#ffffff88' }]}>
          {'🏠'.repeat(homeCount)}{'⚫'.repeat(4 - homeCount)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 16, gap: 10, alignItems: 'center' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { fontSize: 16, fontFamily: 'Inter_400Regular' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  turnIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFFFFF15', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  turnDot: { width: 10, height: 10, borderRadius: 5 },
  turnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  playersTop: { flexDirection: 'row', gap: 10, width: '100%', justifyContent: 'space-between' },
  playerCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, maxWidth: '48%' },
  playerAvatarWrap: { position: 'relative' },
  aiAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  playerOnlineDot: { position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: '#000' },
  playerCardName: { fontSize: 12, fontFamily: 'Inter_600SemiBold', maxWidth: 80 },
  playerCardScore: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 2 },
  boardContainer: { alignItems: 'center', justifyContent: 'center' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 16, width: '100%', paddingHorizontal: 4 },
  dice: { width: 70, height: 70, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  diceFace: { fontSize: 40 },
  hint: { fontSize: 15, fontFamily: 'Inter_600SemiBold', lineHeight: 22 },
  myColorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  colorLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});
