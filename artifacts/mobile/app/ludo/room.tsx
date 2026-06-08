import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { useLudo } from '@/context/LudoContext';
import {
  GameRoom,
  GameRoomPlayer,
  cancelRoomStart,
  setRoomInGame,
  setRoomStarting,
  subscribeToGameRoom,
  togglePlayerReady,
} from '@/lib/firestore';

function shortCode(roomId: string): string {
  return roomId.slice(0, 6).toUpperCase();
}

const MODE_EMOJI: Record<number, string> = { 2: '👤', 3: '👥', 4: '👨‍👩‍👧‍👦' };

function PulsingDot({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.4, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [scale]);
  return <Animated.View style={[styles.pulsingDot, { backgroundColor: color, transform: [{ scale }] }]} />;
}

function PlayerRow({
  player,
  isHost,
  isMe,
  colors,
}: {
  player: GameRoomPlayer;
  isHost: boolean;
  isMe: boolean;
  colors: any;
}) {
  const dotColor = player.isReady ? '#10B981' : '#9CA3AF';
  const cardBg = isMe
    ? colors.isDark ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.07)'
    : colors.card;
  const dotBorder = isMe ? cardBg : colors.card;

  return (
    <View
      style={[
        styles.playerRow,
        { backgroundColor: cardBg, borderColor: isMe ? colors.primary : colors.border },
      ]}
    >
      <View style={styles.avatarWrap}>
        {player.photo ? (
          <Image source={{ uri: player.photo }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarInitial}>{(player.name || '?')[0].toUpperCase()}</Text>
          </View>
        )}
        <View style={[styles.statusDot, { backgroundColor: dotColor, borderColor: dotBorder }]} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Text style={[styles.playerName, { color: colors.foreground }]} numberOfLines={1}>
            {player.name}
          </Text>
          {isHost && (
            <View style={[styles.badge, { backgroundColor: colors.isDark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.15)' }]}>
              <Text style={[styles.badgeText, { color: '#F59E0B' }]}>Host</Text>
            </View>
          )}
          {isMe && (
            <View style={[styles.badge, { backgroundColor: colors.isDark ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.12)' }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>You</Text>
            </View>
          )}
        </View>
        <Text style={[styles.readyLabel, { color: dotColor }]}>
          {player.isReady ? '✓ Ready' : '○ Not Ready'}
        </Text>
      </View>

      {/* Right-side ready pill */}
      <View
        style={[
          styles.readyPill,
          {
            backgroundColor: player.isReady
              ? colors.isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.12)'
              : colors.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderColor: player.isReady ? '#10B98140' : colors.border,
          },
        ]}
      >
        <Text style={[styles.readyPillText, { color: player.isReady ? '#10B981' : '#9CA3AF' }]}>
          {player.isReady ? 'Ready' : 'Waiting'}
        </Text>
      </View>
    </View>
  );
}

function EmptySlot({ slot, colors }: { slot: number; colors: any }) {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);
  return (
    <Animated.View
      style={[
        styles.playerRow,
        styles.emptySlot,
        { borderColor: colors.border, borderStyle: 'dashed', opacity },
      ]}
    >
      <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
        <Feather name="user" size={20} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.playerName, { color: colors.mutedForeground }]}>
        Waiting for player {slot}…
      </Text>
    </Animated.View>
  );
}

export default function RoomLobbyScreen() {
  const { id: roomId } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { show: showLudo, startOnlineGame } = useLudo();

  // Board positions assigned to human players in order of joining.
  // Matches HUMAN_PREFERRED_POSITIONS inside the Ludo game HTML bundle.
  const HUMAN_PREFERRED_POSITIONS = [2, 0, 1, 3];

  function buildQuickStartId(gameMode: 2 | 3 | 4): string {
    if (gameMode === 4) return 'qs,4,0';
    const colors = Array.from({ length: gameMode }, (_, i) => i).join(',');
    return `qs,${gameMode},0,${colors}`;
  }

  function buildNamesByPlayerIndex(sortedPlayers: GameRoomPlayer[], gameMode: 2 | 3 | 4): string[] {
    const names = ['', '', '', ''];
    sortedPlayers.slice(0, gameMode).forEach((player, i) => {
      names[HUMAN_PREFERRED_POSITIONS[i]] = player.name || '';
    });
    return names;
  }

  const [room, setRoom] = useState<GameRoom | null>(null);
  const [copied, setCopied] = useState(false);
  const [readyToggling, setReadyToggling] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const readyBannerAnim = useRef(new Animated.Value(0)).current;
  const prevGameReady = useRef(false);
  const hasNavigated = useRef(false);
  const hasStartedCountdown = useRef(false);

  const isHost = !!user && !!room && room.hostId === user.uid;

  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeToGameRoom(roomId, setRoom);
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 14 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
    return unsub;
  }, [roomId]);

  // ── Status machine: ready → starting → in_game ──────────────────
  useEffect(() => {
    if (!room || !roomId || !user) return;

    if (room.status === 'ready' && isHost) {
      // HOST: transition room to "starting" immediately
      setRoomStarting(roomId).catch(console.error);
      return;
    }

    if (room.status === 'starting' && !hasStartedCountdown.current && !hasNavigated.current) {
      // ALL players: begin local countdown
      hasStartedCountdown.current = true;
      console.log('[COUNTDOWN_STARTED]');
      setCountdown(3);
      return;
    }

    if (room.status === 'waiting' && hasStartedCountdown.current) {
      // Countdown was cancelled (a player left)
      hasStartedCountdown.current = false;
      setCountdown(null);
    }
  }, [room?.status, isHost, roomId, user]);

  // ── Launch game — single function used by countdown ──────────────
  function launchGame() {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    if (isHost && roomId) setRoomInGame(roomId).catch(console.error);
    if (Platform.OS !== 'web') {
      if (room) {
        // Build game params from room data and start the existing Ludo game.
        // The LudoNativeOverlay is a full-screen overlay — no navigation needed.
        const sortedPlayers = Object.values(room.players).sort((a, b) => a.joinedAt - b.joinedAt);
        const quickStartId = buildQuickStartId(room.gameMode);
        const namesByPlayerIndex = buildNamesByPlayerIndex(sortedPlayers, room.gameMode);
        startOnlineGame(quickStartId, namesByPlayerIndex);
      } else {
        // Fallback: just open the game home screen
        showLudo();
        router.replace('/(tabs)/ludo' as any);
      }
    } else {
      router.replace('/ludo' as any);
    }
  }

  // ── Countdown tick ──────────────────────────────────────────────
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 2) console.log('[COUNTDOWN_2]');
    if (countdown === 1) console.log('[COUNTDOWN_1]');

    if (countdown === 0) {
      console.log('[COUNTDOWN_FINISHED]');
      launchGame();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => (c !== null ? c - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, isHost, roomId]);

  // ── HOST: cancel countdown if a player leaves during "starting" ──
  useEffect(() => {
    if (!room || !isHost || !roomId) return;
    if (room.status !== 'starting') return;
    const players = Object.values(room.players);
    if (players.length < room.gameMode) {
      cancelRoomStart(roomId).catch(console.error);
    }
  }, [room?.players, room?.status, isHost, roomId]);

  // Animate ready banner in/out
  useEffect(() => {
    if (!room) return;
    const players = Object.values(room.players);
    const allJoined = players.length >= room.gameMode;
    const allReady = players.length > 0 && players.every((p) => p.isReady);
    const gameReady = allJoined && allReady;
    if (gameReady && !prevGameReady.current) {
      Animated.spring(readyBannerAnim, { toValue: 1, useNativeDriver: true, damping: 10 }).start();
    } else if (!gameReady && prevGameReady.current) {
      Animated.timing(readyBannerAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
    prevGameReady.current = gameReady;
  }, [room]);

  async function handleCopy() {
    if (!roomId) return;
    await Clipboard.setStringAsync(shortCode(roomId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleToggleReady() {
    if (!room || !user || !roomId || readyToggling) return;
    const myPlayer = room.players[user.uid];
    if (!myPlayer) return;
    setReadyToggling(true);
    try {
      await togglePlayerReady(roomId, user.uid, !myPlayer.isReady);
    } catch (e) {
      console.error('togglePlayerReady error', e);
    } finally {
      setReadyToggling(false);
    }
  }

  const topPad = insets.top + (Platform.OS === 'web' ? 0 : 4);
  const bottomPad = insets.bottom + 16;

  if (!room) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Game Room</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading room…</Text>
        </View>
      </View>
    );
  }

  const players = Object.values(room.players).sort((a, b) => a.joinedAt - b.joinedAt);
  const playerCount = players.length;
  const neededCount = room.gameMode;
  const readyCount = players.filter((p) => p.isReady).length;
  const allJoined = playerCount >= neededCount;
  const allReady = allJoined && readyCount === playerCount && playerCount > 0;
  const emptySlots = Array.from({ length: Math.max(0, neededCount - playerCount) }, (_, i) => i + playerCount + 1);

  const myPlayer = user ? room.players[user.uid] : null;
  const amIReady = myPlayer?.isReady ?? false;

  // Status config
  let statusColor = '#F59E0B'; // amber — waiting
  let statusMsg = `Waiting for players… ${playerCount}/${neededCount}`;
  let progressValue = playerCount / neededCount;

  if (allJoined && !allReady) {
    statusColor = '#3B82F6'; // blue — all joined, waiting for ready
    statusMsg = `Waiting for everyone to ready up… ${readyCount}/${playerCount} ready`;
    progressValue = readyCount / playerCount;
  } else if (allReady) {
    statusColor = '#10B981'; // green — all ready
    statusMsg = 'All Players Ready! Starting Game…';
    progressValue = 1;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Game Room</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad + 88 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Room ID Card ───────────────────────────────────── */}
        <Animated.View
          style={[
            styles.roomCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Text style={[styles.roomLabel, { color: colors.mutedForeground }]}>ROOM ID</Text>
          <View style={styles.roomCodeRow}>
            <Text style={[styles.roomCode, { color: colors.foreground }]}>
              {shortCode(roomId!)}
            </Text>
            <TouchableOpacity
              style={[styles.copyBtn, { backgroundColor: copied ? '#10B981' : colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}
              onPress={handleCopy}
              activeOpacity={0.8}
            >
              <Feather name={copied ? 'check' : 'copy'} size={15} color={copied ? '#fff' : colors.mutedForeground} />
              <Text style={[styles.copyText, { color: copied ? '#fff' : colors.mutedForeground }]}>
                {copied ? 'Copied!' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.modeChip, { backgroundColor: colors.isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.1)' }]}>
            <Text style={styles.modeEmoji}>{MODE_EMOJI[room.gameMode] ?? '🎲'}</Text>
            <Text style={[styles.modeText, { color: colors.primary }]}>
              {room.gameMode}-Player Mode
            </Text>
          </View>
        </Animated.View>

        {/* ── Status Banner ──────────────────────────────────── */}
        <View style={[styles.statusBanner, { backgroundColor: `${statusColor}18`, borderColor: `${statusColor}40` }]}>
          <PulsingDot color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusMsg}</Text>
        </View>

        {/* ── Progress Bar ───────────────────────────────────── */}
        <View style={[styles.progressTrack, { backgroundColor: colors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: statusColor, width: `${Math.min(100, progressValue * 100)}%` },
            ]}
          />
        </View>
        <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
          {allJoined
            ? `${readyCount} of ${playerCount} players ready`
            : `${playerCount} of ${neededCount} players joined`}
        </Text>

        {/* ── Players ────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PLAYERS</Text>

        {players.map((player) => (
          <PlayerRow
            key={player.userId}
            player={player}
            isHost={player.userId === room.hostId}
            isMe={player.userId === user?.uid}
            colors={colors}
          />
        ))}

        {emptySlots.map((slot) => (
          <EmptySlot key={slot} slot={slot} colors={colors} />
        ))}

        {/* ── Ready Legend ───────────────────────────────────── */}
        <View style={[styles.legend, { backgroundColor: colors.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Ready</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#9CA3AF' }]} />
            <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Not Ready</Text>
          </View>
        </View>

        {/* ── All Ready Banner ───────────────────────────────── */}
        {allReady && (
          <Animated.View
            style={[
              styles.allReadyBanner,
              {
                backgroundColor: '#10B981',
                transform: [{ scale: readyBannerAnim }],
                opacity: readyBannerAnim,
              },
            ]}
          >
            <Text style={styles.allReadyEmoji}>🎲</Text>
            <View>
              <Text style={styles.allReadyTitle}>All Players Ready!</Text>
              <Text style={styles.allReadySubtitle}>Starting Game…</Text>
            </View>
          </Animated.View>
        )}

        {/* ── TEST BUTTON — remove after diagnosis ───────────── */}
        <TouchableOpacity
          style={{
            marginTop: 24,
            backgroundColor: '#2563EB',
            borderRadius: 12,
            padding: 14,
            alignItems: 'center',
          }}
          onPress={() => {
            hasNavigated.current = false;
            launchGame();
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
            🎮 Launch Existing Game (TEST)
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Ready Toggle Button (sticky footer) ────────────── */}
      {myPlayer && (
        <View
          style={[
            styles.footer,
            {
              paddingBottom: bottomPad,
              borderTopColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.readyBtn,
              {
                backgroundColor: amIReady
                  ? colors.isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)'
                  : colors.primary,
                borderColor: amIReady ? '#10B981' : 'transparent',
                borderWidth: amIReady ? 2 : 0,
                opacity: readyToggling ? 0.7 : 1,
              },
            ]}
            onPress={handleToggleReady}
            disabled={readyToggling}
            activeOpacity={0.8}
          >
            {readyToggling ? (
              <ActivityIndicator color={amIReady ? '#10B981' : '#fff'} size="small" />
            ) : (
              <>
                <Text style={styles.readyBtnIcon}>{amIReady ? '✓' : '○'}</Text>
                <Text style={[styles.readyBtnText, { color: amIReady ? '#10B981' : '#fff' }]}>
                  {amIReady ? "I'm Ready!" : 'Tap to Ready Up'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ── Countdown Overlay ───────────────────────────────── */}
      {countdown !== null && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownNumber}>
            {countdown > 0 ? String(countdown) : '🎲'}
          </Text>
          <Text style={styles.countdownLabel}>
            {countdown > 0 ? 'Game Starting…' : 'Get Ready!'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 15, fontFamily: 'Inter_400Regular' },

  roomCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    gap: 12,
  },
  roomLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1 },
  roomCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roomCode: { fontSize: 38, fontFamily: 'Inter_700Bold', letterSpacing: 8 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  copyText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  modeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  modeEmoji: { fontSize: 16 },
  modeText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  pulsingDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 14, fontFamily: 'Inter_500Medium', flex: 1 },

  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'right', marginBottom: 20 },

  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginBottom: 10 },

  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  emptySlot: {},
  avatarWrap: { position: 'relative' },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 20, color: '#fff', fontFamily: 'Inter_700Bold' },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  playerName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  readyLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', marginTop: 2 },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontFamily: 'Inter_700Bold' },
  readyPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  readyPillText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  legend: {
    flexDirection: 'row',
    gap: 20,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    justifyContent: 'center',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 13, fontFamily: 'Inter_400Regular' },

  allReadyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 20,
    borderRadius: 18,
    marginTop: 4,
  },
  allReadyEmoji: { fontSize: 36 },
  allReadyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#fff' },
  allReadySubtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  footer: {
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  readyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  readyBtnIcon: { fontSize: 20, color: '#fff' },
  readyBtnText: { fontSize: 17, fontFamily: 'Inter_700Bold' },

  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  countdownNumber: {
    fontSize: 120,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    lineHeight: 130,
  },
  countdownLabel: {
    fontSize: 20,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255,255,255,0.65)',
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
