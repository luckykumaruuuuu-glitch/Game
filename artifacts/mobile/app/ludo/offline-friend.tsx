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
  UserPresence,
  UserProfile,
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
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function OfflineFriendScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [mode, setMode] = useState<GameMode | null>(null);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [presence, setPresence] = useState<Record<string, UserPresence>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

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

  const offlineFriends = [...friends]
    .filter((f) => !presence[f.userId]?.online)
    .sort((a, b) => {
      const aLast = presence[a.userId]?.lastSeen ?? 0;
      const bLast = presence[b.userId]?.lastSeen ?? 0;
      return bLast - aLast;
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

  const topPad = insets.top + (Platform.OS === 'web' ? 0 : 4);

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
        <Text style={[styles.title, { color: colors.foreground }]}>Offline Friend</Text>
        <View style={styles.backBtn} />
      </View>

      {/* ── Info Banner ─────────────────────────────────────── */}
      <View style={[styles.infoBanner, { backgroundColor: colors.isDark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.07)' }]}>
        <Feather name="wifi-off" size={14} color="#dc2626" />
        <Text style={styles.infoText}>
          These friends are currently offline. They'll get a notification when you send an invite.
        </Text>
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
                    backgroundColor: active ? '#dc2626' : colors.card,
                    borderColor: active ? '#dc2626' : colors.border,
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
            <Text style={{ color: '#dc2626' }}> ({selected.size}/{maxSelectable})</Text>
          </Text>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color="#dc2626" size="large" />
            </View>
          ) : offlineFriends.length === 0 ? (
            <View style={styles.center}>
              <View style={[styles.emptyIconWrap, { backgroundColor: colors.isDark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.08)' }]}>
                <Feather name="wifi" size={32} color="#dc2626" />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                All friends are online!
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No offline friends right now.{'\n'}Try the Online Friend button instead.
              </Text>
              <TouchableOpacity
                style={styles.switchBtn}
                onPress={() => {
                  router.push('/ludo/online-friend' as any);
                }}
                activeOpacity={0.8}
              >
                <Feather name="wifi" size={14} color="#fff" />
                <Text style={styles.switchBtnText}>Switch to Online Friend</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={offlineFriends}
              keyExtractor={(f) => f.userId}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 120 }}
              renderItem={({ item }) => {
                const lastSeen = presence[item.userId]?.lastSeen ?? 0;
                const isSelected = selected.has(item.userId);
                const isMaxed = selected.size >= maxSelectable && !isSelected;

                return (
                  <TouchableOpacity
                    style={[
                      styles.friendCard,
                      {
                        backgroundColor: isSelected
                          ? colors.isDark
                            ? 'rgba(220,38,38,0.15)'
                            : 'rgba(220,38,38,0.07)'
                          : colors.card,
                        borderColor: isSelected ? '#dc2626' : colors.border,
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
                        <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: '#dc2626' }]}>
                          <Text style={styles.avatarInitial}>
                            {(item.name || item.username || '?')[0].toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View
                        style={[
                          styles.offlineDot,
                          {
                            borderColor: isSelected
                              ? colors.isDark ? 'rgba(220,38,38,0.15)' : 'rgba(220,38,38,0.07)'
                              : colors.card,
                          },
                        ]}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.friendName, { color: colors.foreground }]} numberOfLines={1}>
                        {item.name || item.username}
                      </Text>
                      <Text style={[styles.friendStatus, { color: colors.mutedForeground }]}>
                        {lastSeen > 0 ? `Last seen ${timeAgo(lastSeen)}` : 'Offline'}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: isSelected ? '#dc2626' : 'transparent',
                          borderColor: isSelected ? '#dc2626' : colors.border,
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#dc2626',
    lineHeight: 17,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4,
    backgroundColor: '#16a34a',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 22,
  },
  switchBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
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
  offlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: '#9CA3AF',
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
});
