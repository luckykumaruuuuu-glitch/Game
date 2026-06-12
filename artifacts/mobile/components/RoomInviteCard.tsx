import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import {
  UserProfile,
  getGameRoom,
  joinGameRoom,
  subscribeToRoomStatus,
} from '@/lib/firestore';

interface Props {
  roomId: string;
  isMine: boolean;
  isDark: boolean;
}

export function RoomInviteCard({ roomId, isMine, isDark }: Props) {
  const { user, profile } = useAuth();
  const [status, setStatus] = useState<'loading' | 'live' | 'offline'>('loading');
  const [joining, setJoining] = useState(false);
  const shortCode = roomId.slice(-6).toUpperCase();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const unsub = subscribeToRoomStatus(roomId, setStatus);
    return unsub;
  }, [roomId]);

  useEffect(() => {
    if (status !== 'live') {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [status]);

  async function handleJoin() {
    if (!user || joining) return;
    setJoining(true);
    try {
      const room = await getGameRoom(roomId);
      if (!room || room.status === 'finished' || room.roomStatus === 'INACTIVE') {
        setStatus('offline');
        return;
      }
      const playerProfile: UserProfile = profile ?? ({
        userId: user.uid,
        name: user.displayName || 'Player',
        username: (user.email ?? '').split('@')[0] || 'player',
        photo: (user as any).photoURL || '',
        bio: '',
        qrCode: '',
        email: user.email || '',
        createdAt: Date.now(),
      } as UserProfile);
      await joinGameRoom(roomId, user.uid, playerProfile);
      router.push({ pathname: '/ludo/room', params: { id: roomId } } as any);
    } catch (e) {
      console.error('[RoomInviteCard] join error:', e);
    } finally {
      setJoining(false);
    }
  }

  const isLive = status === 'live';
  const isLoading = status === 'loading';

  const cardBg = isDark
    ? isLive ? 'rgba(30,18,52,0.97)' : 'rgba(25,25,30,0.95)'
    : isLive ? 'rgba(243,239,255,1)' : 'rgba(243,244,246,1)';

  const borderColor = isDark
    ? isLive ? 'rgba(139,92,246,0.45)' : 'rgba(255,255,255,0.07)'
    : isLive ? 'rgba(139,92,246,0.3)' : 'rgba(0,0,0,0.07)';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor,
          alignSelf: isMine ? 'flex-end' : 'flex-start',
        },
      ]}
    >
      {/* ── Top row: icon + title + badge ── */}
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: isLive ? 'rgba(139,92,246,0.15)' : 'rgba(150,150,150,0.1)' }]}>
          <Text style={styles.gameEmoji}>🎮</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            Ludo Match Invite
          </Text>
          <Text style={[styles.roomCode, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Room #{shortCode}
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color="#8B5CF6" />
        ) : isLive ? (
          <View style={styles.liveBadge}>
            <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        ) : (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineText}>OFFLINE</Text>
          </View>
        )}
      </View>

      {/* ── Divider ── */}
      <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />

      {/* ── Bottom: action row ── */}
      {isLive ? (
        <TouchableOpacity
          style={styles.joinBtn}
          onPress={handleJoin}
          disabled={joining}
          activeOpacity={0.85}
        >
          {joining ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Feather name="play-circle" size={14} color="#fff" />
              <Text style={styles.joinBtnText}>Join Room</Text>
            </>
          )}
        </TouchableOpacity>
      ) : !isLoading ? (
        <View style={styles.closedRow}>
          <Feather name="lock" size={12} color={isDark ? '#6B7280' : '#9CA3AF'} />
          <Text style={[styles.closedText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            Room closed or ended
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameEmoji: { fontSize: 20 },
  cardTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 17,
  },
  roomCode: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  offlineBadge: {
    backgroundColor: 'rgba(107,114,128,0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  offlineText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 0 },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    paddingVertical: 9,
    margin: 10,
    borderRadius: 10,
  },
  joinBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  closedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
  },
  closedText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
});
