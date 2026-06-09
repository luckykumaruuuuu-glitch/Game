import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import {
  UserPresence,
  UserProfile,
  sendGameInvite,
  subscribeToFriends,
  subscribeToFriendsPresence,
} from '@/lib/firestore';

type GameMode = 2 | 3 | 4;

const MODES: { value: GameMode; label: string; icon: string; desc: string }[] = [
  { value: 2, label: '2P', icon: '👤', desc: '1 vs 1' },
  { value: 3, label: '3P', icon: '👥', desc: '3 Players' },
  { value: 4, label: '4P', icon: '👨‍👩‍👧‍👦', desc: '4 Players' },
];

const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#A78BFA';
const GREEN = '#10B981';

function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [shimmer]);
  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] });
  return (
    <Animated.View style={[styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonAvatar} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '45%' }]} />
      </View>
      <View style={styles.skeletonCheck} />
    </Animated.View>
  );
}

function OnlinePulse() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 2, duration: 1100, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 1100, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.7, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, [scale, opacity]);
  return (
    <View style={styles.pulseWrap}>
      <Animated.View style={[styles.pulseRing, { transform: [{ scale }], opacity }]} />
      <View style={styles.pulseCore} />
    </View>
  );
}

interface FriendCardProps {
  item: UserProfile;
  isOnline: boolean;
  isSelected: boolean;
  isMaxed: boolean;
  onPress: () => void;
}

function FriendCard({ item, isOnline, isSelected, isMaxed, onPress }: FriendCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const displayName = item.name || item.username || '?';

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() =>
        Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 0 }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }).start()
      }
      disabled={isMaxed}
    >
      <Animated.View
        style={[
          styles.friendCard,
          isSelected && styles.friendCardSelected,
          { transform: [{ scale }], opacity: isMaxed ? 0.38 : 1 },
        ]}
      >
        <View style={styles.avatarWrap}>
          {item.photo ? (
            <Image source={{ uri: item.photo }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={isOnline ? [PURPLE, '#4C1D95'] : ['#374151', '#1F2937']}
              style={[styles.avatar, styles.avatarFallback]}
            >
              <Text style={styles.avatarInitial}>{displayName[0].toUpperCase()}</Text>
            </LinearGradient>
          )}
          {isOnline ? <OnlinePulse /> : <View style={styles.offlineDot} />}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.friendName} numberOfLines={1}>{displayName}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? GREEN : '#4B5563' }]} />
            <Text style={[styles.friendStatus, { color: isOnline ? GREEN : 'rgba(255,255,255,0.3)' }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Feather name="check" size={13} color="#fff" />}
        </View>
      </Animated.View>
    </Pressable>
  );
}

function EmptyState() {
  const breathe = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, [breathe]);
  return (
    <View style={styles.emptyWrap}>
      <Animated.View style={{ transform: [{ scale: breathe }] }}>
        <LinearGradient
          colors={['rgba(124,58,237,0.25)', 'rgba(124,58,237,0.08)']}
          style={styles.emptyIconBg}
        >
          <Feather name="wifi-off" size={34} color={PURPLE_LIGHT} />
        </LinearGradient>
      </Animated.View>
      <Text style={styles.emptyTitle}>No Friends Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add friends using the QR scanner to start playing Ludo together!
      </Text>
    </View>
  );
}

function ChooseModePrompt() {
  return (
    <View style={styles.promptWrap}>
      <View style={styles.promptIconWrap}>
        <Feather name="arrow-up-circle" size={30} color="rgba(124,58,237,0.4)" />
      </View>
      <Text style={styles.promptText}>Choose a game mode above{'\n'}to invite your friends</Text>
    </View>
  );
}

export default function OnlineFriendScreen() {
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

  const screenOpacity = useRef(new Animated.Value(0)).current;
  const sendBtnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(screenOpacity, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, [screenOpacity]);

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
  const onlineCount = friends.filter((f) => presence[f.userId]?.online).length;

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
    <LinearGradient colors={['#09090B', '#0D0A1A', '#0A0A0F']} locations={[0, 0.5, 1]} style={styles.root}>
      <Animated.View style={[{ flex: 1 }, { opacity: screenOpacity }]}>

        {/* ── Header ─────────────────────────────────────────── */}
        <View style={[styles.header, { paddingTop: topPad }]}>
          <Pressable
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={22} color="rgba(255,255,255,0.85)" />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Online Friends</Text>
            <View style={styles.statsRow}>
              <View style={styles.statPill}>
                <Feather name="users" size={9} color="rgba(255,255,255,0.4)" />
                <Text style={styles.statText}>{friends.length} total</Text>
              </View>
              <View style={[styles.statPill, styles.statPillGreen]}>
                <View style={styles.statGreenDot} />
                <Text style={[styles.statText, { color: GREEN }]}>{onlineCount} online</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={styles.activeBtn}
              onPress={() => router.push('/ludo/active-games' as any)}
              hitSlop={8}
            >
              <LinearGradient
                colors={['rgba(124,58,237,0.35)', 'rgba(91,33,182,0.2)']}
                style={styles.activeBtnGrad}
              >
                <Feather name="activity" size={13} color={PURPLE_LIGHT} />
                <Text style={styles.activeBtnText}>Active Game</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.inviteBtn}
              onPress={() => router.push('/ludo/invites' as any)}
              hitSlop={8}
            >
              <LinearGradient
                colors={['rgba(16,185,129,0.25)', 'rgba(5,150,105,0.15)']}
                style={styles.inviteBtnGrad}
              >
                <Feather name="mail" size={13} color="#34D399" />
                <Text style={styles.inviteBtnText}>Invite</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* ── Mode Selector ──────────────────────────────────── */}
        <View style={styles.modeSection}>
          <Text style={styles.sectionLabel}>SELECT PLAYERS</Text>
          <View style={styles.modeRow}>
            {MODES.map((m) => {
              const active = mode === m.value;
              return (
                <Pressable
                  key={m.value}
                  style={styles.modeChipWrap}
                  onPress={() => setMode(m.value)}
                >
                  {active ? (
                    <LinearGradient colors={[PURPLE, '#4C1D95']} style={[styles.modeChip, styles.modeChipActive]}>
                      <Text style={styles.modeEmoji}>{m.icon}</Text>
                      <Text style={styles.modeLabel}>{m.label}</Text>
                      <Text style={styles.modeDesc}>{m.desc}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.modeChip, styles.modeChipInactive]}>
                      <Text style={styles.modeEmoji}>{m.icon}</Text>
                      <Text style={[styles.modeLabel, { color: 'rgba(255,255,255,0.45)' }]}>{m.label}</Text>
                      <Text style={[styles.modeDesc, { color: 'rgba(255,255,255,0.25)' }]}>{m.desc}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Divider ────────────────────────────────────────── */}
        <View style={styles.divider} />

        {/* ── Friends List ───────────────────────────────────── */}
        {mode !== null ? (
          <View style={{ flex: 1 }}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionLabel}>
                SELECT {maxSelectable} FRIEND{maxSelectable > 1 ? 'S' : ''}
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{selected.size}/{maxSelectable}</Text>
              </View>
            </View>

            {loading ? (
              <View style={{ paddingHorizontal: 16, gap: 10 }}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </View>
            ) : sortedFriends.length === 0 ? (
              <EmptyState />
            ) : (
              <FlatList
                data={sortedFriends}
                keyExtractor={(f) => f.userId}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingBottom: insets.bottom + 120,
                  gap: 10,
                }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isOnline = presence[item.userId]?.online ?? false;
                  const isSelected = selected.has(item.userId);
                  const isMaxed = selected.size >= maxSelectable && !isSelected;
                  return (
                    <FriendCard
                      item={item}
                      isOnline={isOnline}
                      isSelected={isSelected}
                      isMaxed={isMaxed}
                      onPress={() => !isMaxed && toggleSelect(item.userId)}
                    />
                  );
                }}
              />
            )}
          </View>
        ) : (
          <ChooseModePrompt />
        )}

        {/* ── Send Button ────────────────────────────────────── */}
        {mode !== null && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <Animated.View style={{ transform: [{ scale: sendBtnScale }], borderRadius: 16, overflow: 'hidden' }}>
              <Pressable
                onPress={handleSendInvite}
                onPressIn={() =>
                  Animated.spring(sendBtnScale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 0 }).start()
                }
                onPressOut={() =>
                  Animated.spring(sendBtnScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start()
                }
                disabled={!canSend}
                style={{ borderRadius: 16, overflow: 'hidden' }}
              >
                {sent ? (
                  <LinearGradient colors={['#059669', '#10B981']} style={styles.sendBtn}>
                    <Feather name="check-circle" size={18} color="#fff" />
                    <Text style={styles.sendBtnText}>Invite Sent!</Text>
                  </LinearGradient>
                ) : canSend ? (
                  <LinearGradient colors={[PURPLE, '#4C1D95']} style={[styles.sendBtn, styles.sendBtnGlow]}>
                    {sending ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Feather name="send" size={17} color="#fff" />
                        <Text style={styles.sendBtnText}>Send Game Invite</Text>
                      </>
                    )}
                  </LinearGradient>
                ) : (
                  <View style={[styles.sendBtn, styles.sendBtnDisabled]}>
                    <Feather name="send" size={17} color="rgba(255,255,255,0.2)" />
                    <Text style={[styles.sendBtnText, { color: 'rgba(255,255,255,0.2)' }]}>
                      Send Game Invite
                    </Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          </View>
        )}
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, gap: 7 },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    letterSpacing: -0.3,
  },
  statsRow: { flexDirection: 'row', gap: 7 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  statPillGreen: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderColor: 'rgba(16,185,129,0.25)',
  },
  statGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
  },
  statText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255,255,255,0.45)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  activeBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
  },
  activeBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  activeBtnText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: PURPLE_LIGHT,
  },
  inviteBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.35)',
  },
  inviteBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  inviteBtnText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#34D399',
  },

  modeSection: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.3,
    marginBottom: 11,
  },
  modeRow: { flexDirection: 'row', gap: 10 },
  modeChipWrap: { flex: 1 },
  modeChip: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    gap: 4,
  },
  modeChipActive: {
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },
  modeChipInactive: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modeEmoji: { fontSize: 22 },
  modeLabel: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  modeDesc: {
    fontSize: 9,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.7)',
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginHorizontal: 16,
    marginBottom: 14,
  },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  countBadge: {
    paddingHorizontal: 11,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: 'rgba(124,58,237,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.38)',
  },
  countBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: PURPLE_LIGHT,
  },

  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  friendCardSelected: {
    backgroundColor: 'rgba(124,58,237,0.14)',
    borderColor: 'rgba(124,58,237,0.45)',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },

  avatarWrap: {
    position: 'relative',
    width: 52,
    height: 52,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
  },

  pulseWrap: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: GREEN,
  },
  pulseCore: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: GREEN,
    borderWidth: 2,
    borderColor: '#09090B',
  },
  offlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#374151',
    borderWidth: 2,
    borderColor: '#09090B',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  friendName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  friendStatus: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 5,
  },

  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  skeletonAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skeletonLine: {
    height: 11,
    width: '70%',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skeletonCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 80,
    paddingHorizontal: 36,
  },
  emptyIconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    lineHeight: 21,
  },

  promptWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingBottom: 60,
  },
  promptIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(124,58,237,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.28)',
    textAlign: 'center',
    lineHeight: 21,
  },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingVertical: 17,
    borderRadius: 16,
  },
  sendBtnGlow: {
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 10,
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  sendBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
});
