import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { ConfirmModal } from '@/components/ConfirmModal';
import {
  GameInvite,
  UserProfile,
  getGameRoom,
  joinGameRoom,
  respondToGameInvite,
  subscribeToGameInvites,
} from '@/lib/firestore';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function GameModeTag({ mode, colors }: { mode: number; colors: any }) {
  return (
    <View style={[styles.modeTag, { backgroundColor: colors.isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.1)' }]}>
      <Text style={[styles.modeTagText, { color: colors.primary }]}>
        {mode}P
      </Text>
    </View>
  );
}

export default function InvitesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const [invites, setInvites] = useState<GameInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<Record<string, 'accepting' | 'declining'>>({});
  const [roomGoneError, setRoomGoneError] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToGameInvites(user.uid, (list) => {
      setInvites(list);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  async function handleRespond(invite: GameInvite, accept: boolean) {
    if (!user) return;
    Haptics.impactAsync(accept ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    setResponding((prev) => ({
      ...prev,
      [invite.inviteId]: accept ? 'accepting' : 'declining',
    }));

    if (!accept) {
      try { await respondToGameInvite(invite.inviteId, false); } catch { /* ignore */ }
      setResponding((prev) => { const next = { ...prev }; delete next[invite.inviteId]; return next; });
      return;
    }

    // ── Accept flow ──────────────────────────────────────────
    try {
      if (!invite.roomId) throw new Error('invite has no roomId');

      // Step 1: Verify the room still exists and is joinable
      const room = await getGameRoom(invite.roomId);
      if (!room || room.status === 'finished' || room.roomStatus === 'INACTIVE') {
        // Clean up the stale invite silently
        respondToGameInvite(invite.inviteId, false).catch(() => {});
        setRoomGoneError(true);
        setResponding((prev) => { const next = { ...prev }; delete next[invite.inviteId]; return next; });
        return;
      }

      // Step 2: Mark invite as accepted (best-effort, don't block navigation)
      try { await respondToGameInvite(invite.inviteId, true); } catch (e) {
        console.warn('invite status update failed (non-fatal):', (e as any)?.code || e);
      }

      // Step 3: Join the room
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

      await joinGameRoom(invite.roomId, user.uid, playerProfile);

      // Step 4: Navigate directly to lobby
      router.push({ pathname: '/ludo/room', params: { id: invite.roomId } } as any);
    } catch (e) {
      console.error('join room error:', (e as any)?.message || e);
    } finally {
      setResponding((prev) => { const next = { ...prev }; delete next[invite.inviteId]; return next; });
    }
  }

  const topPad = insets.top + (Platform.OS === 'web' ? 0 : 4);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Game Invites</Text>
          {invites.length > 0 && (
            <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.countBadgeText}>{invites.length}</Text>
            </View>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Content ────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : invites.length === 0 ? (
        <View style={styles.center}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.card }]}>
            <Feather name="inbox" size={36} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Invites</Text>
          <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
            When friends invite you to a game,{'\n'}they'll appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={invites}
          keyExtractor={(inv) => inv.inviteId}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 30 }}
          renderItem={({ item }) => {
            const busy = responding[item.inviteId];
            return (
              <View
                style={[
                  styles.inviteCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                {/* Left: Avatar */}
                <View style={styles.cardLeft}>
                  {item.senderPhoto ? (
                    <Image source={{ uri: item.senderPhoto }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.primary }]}>
                      <Text style={styles.avatarInitial}>
                        {(item.senderName || '?')[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <GameModeTag mode={item.gameMode} colors={colors} />
                </View>

                {/* Center: Info */}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.senderName, { color: colors.foreground }]} numberOfLines={1}>
                    {item.senderName}
                  </Text>
                  <Text style={[styles.inviteBody, { color: colors.mutedForeground }]}>
                    {item.gameMode}-player Ludo game
                  </Text>
                  <Text style={[styles.timeAgo, { color: colors.mutedForeground }]}>
                    {timeAgo(item.createdAt)}
                  </Text>
                </View>

                {/* Right: Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.acceptBtn]}
                    onPress={() => handleRespond(item, true)}
                    disabled={!!busy}
                    activeOpacity={0.8}
                  >
                    {busy === 'accepting' ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Feather name="check" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      styles.declineBtn,
                      { borderColor: colors.border },
                    ]}
                    onPress={() => handleRespond(item, false)}
                    disabled={!!busy}
                    activeOpacity={0.8}
                  >
                    {busy === 'declining' ? (
                      <ActivityIndicator color="#EF4444" size="small" />
                    ) : (
                      <Feather name="x" size={16} color="#EF4444" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
      <ConfirmModal
        visible={roomGoneError}
        onClose={() => setRoomGoneError(false)}
        onConfirm={() => { setRoomGoneError(false); router.replace('/(tabs)' as any); }}
        title="Room Unavailable"
        message={"This room has been closed, deleted, or the game has already ended.\n\nThe invite has been removed."}
        confirmLabel="Go Home"
        cancelLabel="Close"
        confirmColor="#7C3AED"
        iconName="alert-circle"
        iconColor="#F59E0B"
        iconBg="rgba(245,158,11,0.12)"
      />
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingBottom: 60,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  emptyBody: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardLeft: {
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
  },
  modeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  modeTagText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  senderName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  inviteBody: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  timeAgo: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'column',
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtn: {
    backgroundColor: '#10B981',
  },
  declineBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
});
