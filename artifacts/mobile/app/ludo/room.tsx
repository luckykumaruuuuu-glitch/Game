import React, { useEffect, useRef, useState } from 'react';
import {
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
import { GameRoom, GameRoomPlayer, subscribeToGameRoom } from '@/lib/firestore';

function shortCode(roomId: string): string {
  return roomId.slice(0, 6).toUpperCase();
}

const MODE_EMOJI: Record<number, string> = { 2: '👤', 3: '👥', 4: '👨‍👩‍👧‍👦' };
const MODE_COLOR: Record<string, string> = {
  waiting: '#F59E0B',
  ready: '#10B981',
  starting: '#10B981',
};

function PulsingDot({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.35, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [scale]);
  return (
    <Animated.View style={[styles.pulsingDot, { backgroundColor: color, transform: [{ scale }] }]} />
  );
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
  return (
    <View
      style={[
        styles.playerRow,
        {
          backgroundColor: isMe
            ? colors.isDark
              ? 'rgba(124,58,237,0.15)'
              : 'rgba(124,58,237,0.07)'
            : colors.card,
          borderColor: isMe ? colors.primary : colors.border,
        },
      ]}
    >
      <View style={styles.avatarWrap}>
        {player.photo ? (
          <Image source={{ uri: player.photo }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarInitial}>
              {(player.name || '?')[0].toUpperCase()}
            </Text>
          </View>
        )}
        <View style={[styles.readyDot, { backgroundColor: '#10B981', borderColor: isMe ? (colors.isDark ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.07)') : colors.card }]} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[styles.playerName, { color: colors.foreground }]} numberOfLines={1}>
            {player.name}
          </Text>
          {isHost && (
            <View style={[styles.hostBadge, { backgroundColor: colors.isDark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.15)' }]}>
              <Text style={styles.hostBadgeText}>Host</Text>
            </View>
          )}
          {isMe && (
            <View style={[styles.meBadge, { backgroundColor: colors.isDark ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.12)' }]}>
              <Text style={[styles.meBadgeText, { color: colors.primary }]}>You</Text>
            </View>
          )}
        </View>
        <Text style={[styles.readyText, { color: '#10B981' }]}>Ready ✓</Text>
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
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [copied, setCopied] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const readyAnim = useRef(new Animated.Value(0)).current;
  const isReady = room ? Object.keys(room.players).length >= room.gameMode : false;

  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeToGameRoom(roomId, setRoom);
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 14 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
    return unsub;
  }, [roomId]);

  useEffect(() => {
    if (isReady) {
      Animated.spring(readyAnim, { toValue: 1, useNativeDriver: true, damping: 12 }).start();
    }
  }, [isReady]);

  async function handleCopy() {
    if (!roomId) return;
    await Clipboard.setStringAsync(shortCode(roomId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const topPad = insets.top + (Platform.OS === 'web' ? 0 : 4);

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
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading room…</Text>
        </View>
      </View>
    );
  }

  const players = Object.values(room.players).sort((a, b) => a.joinedAt - b.joinedAt);
  const playerCount = players.length;
  const neededCount = room.gameMode;
  const emptySlots = Array.from({ length: Math.max(0, neededCount - playerCount) }, (_, i) => i + playerCount + 1);
  const statusColor = MODE_COLOR[room.status] ?? '#F59E0B';

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
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
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

          {/* Game mode chip */}
          <View style={[styles.modeChip, { backgroundColor: colors.isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.1)' }]}>
            <Text style={styles.modeEmoji}>{MODE_EMOJI[room.gameMode] ?? '🎲'}</Text>
            <Text style={[styles.modeText, { color: colors.primary }]}>
              {room.gameMode}-Player Mode
            </Text>
          </View>
        </Animated.View>

        {/* ── Status Banner ──────────────────────────────────── */}
        <View style={[styles.statusBanner, { backgroundColor: colors.isDark ? `${statusColor}22` : `${statusColor}15`, borderColor: `${statusColor}55` }]}>
          <PulsingDot color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {isReady
              ? 'All players joined! Starting Game…'
              : `Waiting for players… ${playerCount}/${neededCount}`}
          </Text>
        </View>

        {/* ── Progress Bar ───────────────────────────────────── */}
        <View style={[styles.progressTrack, { backgroundColor: colors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: statusColor,
                width: `${Math.min(100, (playerCount / neededCount) * 100)}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
          {playerCount} of {neededCount} players joined
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

        {/* ── Ready Banner ───────────────────────────────────── */}
        {isReady && (
          <Animated.View
            style={[
              styles.readyBanner,
              {
                backgroundColor: '#10B981',
                transform: [{ scale: readyAnim }],
                opacity: readyAnim,
              },
            ]}
          >
            <Text style={styles.readyEmoji}>🎲</Text>
            <View>
              <Text style={styles.readyTitle}>All Players Ready!</Text>
              <Text style={styles.readySubtitle}>Starting Game…</Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>
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
  backBtn: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 15, fontFamily: 'Inter_400Regular' },

  roomCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    gap: 12,
  },
  roomLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
  },
  roomCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roomCode: {
    fontSize: 38,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 8,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  copyText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
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
  pulsingDot: {
    width: 10, height: 10, borderRadius: 5,
  },
  statusText: { fontSize: 14, fontFamily: 'Inter_500Medium', flex: 1 },

  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'right',
    marginBottom: 20,
  },

  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  emptySlot: { opacity: 0.6 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 20, color: '#fff', fontFamily: 'Inter_700Bold' },
  readyDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 13, height: 13, borderRadius: 7, borderWidth: 2,
  },
  playerName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  readyText: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  hostBadge: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  hostBadgeText: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#F59E0B' },
  meBadge: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  meBadgeText: { fontSize: 10, fontFamily: 'Inter_700Bold' },

  readyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 20,
    borderRadius: 18,
    marginTop: 8,
  },
  readyEmoji: { fontSize: 36 },
  readyTitle: {
    fontSize: 18, fontFamily: 'Inter_700Bold', color: '#fff',
  },
  readySubtitle: {
    fontSize: 14, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.8)', marginTop: 2,
  },
});
