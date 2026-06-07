import React, { useEffect, useRef, useState } from 'react';
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
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import {
  GameInvite,
  UserPresence,
  UserProfile,
  sendGameInvite,
  subscribeToFriends,
  subscribeToFriendsPresence,
} from '@/lib/firestore';

type GameMode = 2 | 3 | 4;

const MODES: { value: GameMode; label: string; icon: string }[] = [
  { value: 2, label: '2 Players', icon: '👤' },
  { value: 3, label: '3 Players', icon: '👥' },
  { value: 4, label: '4 Players', icon: '👨‍👩‍👧‍👦' },
];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function OnlineFriendScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const [mode, setMode] = useState<GameMode | null>(null);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [presence, setPresence] = useState<Record<string, UserPresence>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const presenceUnsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToFriends(user.uid, (list) => {
      setFriends(list);
      setLoading(false);
      if (presenceUnsubRef.current) presenceUnsubRef.current();
      if (list.length > 0) {
        presenceUnsubRef.current = subscribeToFriendsPresence(
          list.map((f) => f.userId),
          setPresence
        );
      }
    });
    return () => {
      unsub();
      if (presenceUnsubRef.current) presenceUnsubRef.current();
    };
  }, [user]);

  useEffect(() => {
    setSelected(new Set());
  }, [mode]);

  const maxSelectable = mode ? mode - 1 : 0;

  const sortedFriends = [...friends].sort((a, b) => {
    const aOnline = presence[a.userId]?.online ? 1 : 0;
    const bOnline = presence[b.userId]?.online ? 1 : 0;
    return bOnline - aOnline;
  });

  function toggleSelect(friendId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(friendId)) {
        next.delete(friendId);
      } else if (next.size < maxSelectable) {
        next.add(friendId);
      }
      return next;
    });
  }

  async function handleSendInvite() {
    if (!user || !profile || !mode || selected.size === 0) return;
    setSending(true);
    try {
      const roomId = await sendGameInvite(user.uid, profile, Array.from(selected), mode);
      router.replace({ pathname: '/ludo/room', params: { id: roomId } } as any);
    } catch (e) {
      console.error('sendGameInvite error', e);
      setSending(false);
    }
  }

  const topPad = insets.top + (Platform.OS === 'web' ? 0 : 4);
  const canSend = mode !== null && selected.size === maxSelectable && !sending && !sent;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Online Friend</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Game Mode ──────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          GAME MODE
        </Text>
        <View style={styles.modeRow}>
          {MODES.map((m) => {
            const active = mode === m.value;
            return (
              <TouchableOpacity
                key={m.value}
                style={[
                  styles.modeChip,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setMode(m.value)}
                activeOpacity={0.8}
              >
                <Text style={styles.modeEmoji}>{m.icon}</Text>
                <Text
                  style={[
                    styles.modeLabel,
                    { color: active ? '#fff' : colors.foreground },
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Friends List ───────────────────────────────────── */}
      {mode !== null && (
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginHorizontal: 16, marginBottom: 8 }]}>
            SELECT {maxSelectable} FRIEND{maxSelectable > 1 ? 'S' : ''}
            <Text style={{ color: colors.primary }}> ({selected.size}/{maxSelectable})</Text>
          </Text>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : sortedFriends.length === 0 ? (
            <View style={styles.center}>
              <Feather name="users" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No friends yet
              </Text>
            </View>
          ) : (
            <FlatList
              data={sortedFriends}
              keyExtractor={(f) => f.userId}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 120 }}
              renderItem={({ item }) => {
                const isOnline = presence[item.userId]?.online ?? false;
                const isSelected = selected.has(item.userId);
                const isMaxed = selected.size >= maxSelectable && !isSelected;

                return (
                  <TouchableOpacity
                    style={[
                      styles.friendCard,
                      {
                        backgroundColor: isSelected
                          ? colors.isDark
                            ? 'rgba(124,58,237,0.18)'
                            : 'rgba(124,58,237,0.08)'
                          : colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                        opacity: isMaxed ? 0.45 : 1,
                      },
                    ]}
                    onPress={() => !isMaxed && toggleSelect(item.userId)}
                    activeOpacity={0.8}
                    disabled={isMaxed}
                  >
                    <View style={styles.avatarWrap}>
                      {item.photo ? (
                        <Image source={{ uri: item.photo }} style={styles.avatar} />
                      ) : (
                        <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.primary }]}>
                          <Text style={styles.avatarInitial}>
                            {(item.name || item.username || '?')[0].toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View
                        style={[
                          styles.onlineDot,
                          {
                            backgroundColor: isOnline ? '#10B981' : '#9CA3AF',
                            borderColor: isSelected
                              ? colors.isDark ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.08)'
                              : colors.card,
                          },
                        ]}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.friendName, { color: colors.foreground }]} numberOfLines={1}>
                        {item.name || item.username}
                      </Text>
                      <Text style={[styles.friendStatus, { color: isOnline ? '#10B981' : colors.mutedForeground }]}>
                        {isOnline ? 'Online' : 'Offline'}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: isSelected ? colors.primary : 'transparent',
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      {isSelected && (
                        <Feather name="check" size={14} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      )}

      {/* ── Send Button ────────────────────────────────────── */}
      {mode !== null && (
        <View
          style={[
            styles.footer,
            {
              paddingBottom: insets.bottom + 16,
              borderTopColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.sendBtn,
              {
                backgroundColor: sent
                  ? '#10B981'
                  : canSend
                  ? colors.primary
                  : colors.isDark
                  ? 'rgba(255,255,255,0.08)'
                  : '#E5E5E5',
                opacity: sending ? 0.7 : 1,
              },
            ]}
            onPress={handleSendInvite}
            disabled={!canSend}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : sent ? (
              <>
                <Feather name="check-circle" size={18} color="#fff" />
                <Text style={styles.sendBtnText}>Invite Sent!</Text>
              </>
            ) : (
              <>
                <Feather name="send" size={18} color={canSend ? '#fff' : colors.mutedForeground} />
                <Text
                  style={[
                    styles.sendBtnText,
                    { color: canSend ? '#fff' : colors.mutedForeground },
                  ]}
                >
                  Send Game Invite
                </Text>
              </>
            )}
          </TouchableOpacity>
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
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  modeChip: {
    flex: 1,
    minWidth: 90,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  modeEmoji: { fontSize: 16 },
  modeLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 60,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  avatarWrap: { position: 'relative' },
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
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
  },
  friendName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  friendStatus: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  sendBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
