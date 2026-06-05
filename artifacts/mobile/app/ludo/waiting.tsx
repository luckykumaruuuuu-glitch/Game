import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedBackground } from '@/components/ThemedBackground';
import { GlassCard } from '@/components/GlassCard';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import {
  subscribeToRoom,
  cancelLudoRoom,
  startLudoGame,
  type LudoRoom,
  type LudoPlayer,
} from '@/lib/ludoFirestore';
import { COLOR_HEX } from '@/lib/ludoEngine';

const COUNTDOWN_SECONDS = 5;

export default function WaitingRoom() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [room, setRoom] = useState<LudoRoom | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownStartAtRef = useRef<number | null>(null);
  const gameStartedRef = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for countdown number
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 150, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 350, useNativeDriver: true, easing: Easing.in(Easing.ease) }),
      ]).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [countdown]);

  useEffect(() => {
    if (!roomId) return;

    const unsub = subscribeToRoom(roomId, async (r) => {
      if (!r || r.status === 'cancelled') {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        Alert.alert('Game Cancelled', 'The game was cancelled. All players have been removed from the room.');
        router.replace('/ludo');
        return;
      }

      setRoom(r);

      if (r.status === 'started') {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace({ pathname: '/ludo/[roomId]', params: { roomId } });
        return;
      }

      if (r.status === 'ready' && r.countdownStartedAt) {
        countdownStartAtRef.current = r.countdownStartedAt;

        const computeRemaining = () => {
          const elapsed = (Date.now() - r.countdownStartedAt!) / 1000;
          return Math.max(0, COUNTDOWN_SECONDS - elapsed);
        };

        const remaining = computeRemaining();
        setCountdown(Math.ceil(remaining));

        if (remaining <= 0 && !gameStartedRef.current) {
          if (user?.uid === r.hostId) {
            gameStartedRef.current = true;
            await startLudoGame(roomId, r.playerCount, r.players).catch(() => {});
          }
          return;
        }

        if (!countdownIntervalRef.current) {
          countdownIntervalRef.current = setInterval(async () => {
            const rem = computeRemaining();
            setCountdown(Math.ceil(rem));

            if (rem <= 0) {
              clearInterval(countdownIntervalRef.current!);
              countdownIntervalRef.current = null;
              if (user?.uid === r.hostId && !gameStartedRef.current) {
                gameStartedRef.current = true;
                await startLudoGame(roomId, r.playerCount, r.players).catch(() => {});
              }
            }
          }, 200);
        }
      }
    });

    return () => {
      unsub();
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [roomId, user?.uid]);

  async function handleExit() {
    Alert.alert(
      'Leave Game',
      'Leaving will cancel the game for everyone. Continue?',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            if (roomId) await cancelLudoRoom(roomId).catch(() => {});
            router.replace('/ludo');
          },
        },
      ]
    );
  }

  const allJoined = room?.players.every(p => p.accepted) ?? false;
  const pendingCount = room?.players.filter(p => !p.accepted).length ?? 0;
  const isReady = room?.status === 'ready';

  return (
    <ThemedBackground>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 44 }} />
          <View style={styles.headerCenter}>
            <Text style={[styles.titleText, { color: colors.foreground }]}>Waiting Room</Text>
            {room && (
              <Text style={[styles.titleSub, { color: colors.mutedForeground }]}>
                {room.playerCount}-Player Game
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleExit}
            style={[styles.exitBtn, { backgroundColor: colors.destructive + '18', borderColor: colors.destructive + '40' }]}
          >
            <Feather name="log-out" size={18} color={colors.destructive} />
          </TouchableOpacity>
        </View>

        {/* Status / Countdown Banner */}
        <GlassCard style={styles.statusBanner} padding={28}>
          {isReady && countdown !== null ? (
            <>
              <Animated.View style={[styles.countdownCircle, { borderColor: colors.primary, transform: [{ scale: pulseAnim }] }]}>
                <Text style={[styles.countdownNumber, { color: colors.primary }]}>
                  {countdown > 0 ? countdown : '🎲'}
                </Text>
              </Animated.View>
              <Text style={[styles.statusTitle, { color: colors.foreground }]}>Game Starting!</Text>
              <Text style={[styles.statusSub, { color: colors.mutedForeground }]}>Get ready to play Ludo!</Text>
            </>
          ) : allJoined ? (
            <>
              <Text style={styles.statusEmoji}>🎉</Text>
              <Text style={[styles.statusTitle, { color: colors.foreground }]}>All players joined!</Text>
              <Text style={[styles.statusSub, { color: colors.mutedForeground }]}>Starting countdown...</Text>
            </>
          ) : (
            <>
              <Text style={styles.statusEmoji}>⏳</Text>
              <Text style={[styles.statusTitle, { color: colors.foreground }]}>
                Waiting for {pendingCount} player{pendingCount !== 1 ? 's' : ''}...
              </Text>
              <Text style={[styles.statusSub, { color: colors.mutedForeground }]}>
                {pendingCount === 1 ? '1 player' : `${pendingCount} players`} yet to join
              </Text>
            </>
          )}
        </GlassCard>

        {/* Players List */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          PLAYERS ({room?.players.filter(p => p.accepted).length ?? 0}/{room?.playerCount ?? 0})
        </Text>
        {room?.players.map((player) => (
          <PlayerRow
            key={player.userId}
            player={player}
            colors={colors}
            isMe={player.userId === user?.uid}
          />
        ))}

        {/* Room Info */}
        {room && (
          <GlassCard style={styles.roomInfo} padding={14}>
            <Feather name="hash" size={14} color={colors.mutedForeground} />
            <Text style={[styles.roomIdText, { color: colors.mutedForeground }]}>
              Room ID: {room.roomId.substring(0, 10)}...
            </Text>
          </GlassCard>
        )}

        {/* Leave Button (for all players) */}
        <TouchableOpacity
          style={[styles.leaveBtn, { backgroundColor: colors.destructive + '12', borderColor: colors.destructive + '35' }]}
          onPress={handleExit}
          activeOpacity={0.8}
        >
          <Feather name="x-circle" size={18} color={colors.destructive} />
          <Text style={[styles.leaveBtnText, { color: colors.destructive }]}>Leave & Cancel Game</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedBackground>
  );
}

function PlayerRow({
  player,
  colors,
  isMe,
}: {
  player: LudoPlayer;
  colors: ReturnType<typeof import('@/hooks/useColors').useColors>;
  isMe: boolean;
}) {
  const colorHex = COLOR_HEX[player.color];
  return (
    <GlassCard
      style={[styles.playerRow, isMe && { borderColor: colors.primary, borderWidth: 1.5 }]}
      padding={14}
    >
      <View style={styles.avatarWrap}>
        <ProfileAvatar uri={player.photo} size={46} name={player.username} />
        <View style={[styles.colorBadge, { backgroundColor: colorHex }]} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.nameRow}>
          <Text style={[styles.playerName, { color: colors.foreground }]}>{player.username}</Text>
          {isMe && (
            <View style={[styles.youTag, { backgroundColor: colors.primary + '22' }]}>
              <Text style={[styles.youTagText, { color: colors.primary }]}>You</Text>
            </View>
          )}
        </View>
        <Text style={[styles.playerColor, { color: colorHex }]}>
          ● {player.color.toUpperCase()}
        </Text>
      </View>
      <View style={[
        styles.statusBadge,
        { backgroundColor: player.accepted ? '#22C55E22' : '#F59E0B22' },
      ]}>
        <Feather
          name={player.accepted ? 'check-circle' : 'clock'}
          size={15}
          color={player.accepted ? '#22C55E' : '#F59E0B'}
        />
        <Text style={[styles.statusText, { color: player.accepted ? '#22C55E' : '#F59E0B' }]}>
          {player.accepted ? 'Joined' : 'Pending'}
        </Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 4,
  },
  headerCenter: { alignItems: 'center', flex: 1 },
  titleText: { fontSize: 19, fontFamily: 'Inter_700Bold' },
  titleSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  exitBtn: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  statusBanner: { alignItems: 'center', gap: 10 },
  statusEmoji: { fontSize: 44 },
  countdownCircle: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 5, alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  countdownNumber: { fontSize: 46, fontFamily: 'Inter_700Bold', lineHeight: 54 },
  statusTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  statusSub: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.2 },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: { position: 'relative' },
  colorBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 15, height: 15, borderRadius: 8, borderWidth: 2, borderColor: '#fff',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  playerName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  youTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  youTagText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  playerColor: { fontSize: 12, fontFamily: 'Inter_600SemiBold', marginTop: 3 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
  },
  statusText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  roomInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roomIdText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  leaveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15, borderRadius: 14, borderWidth: 1, marginTop: 6,
  },
  leaveBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});
