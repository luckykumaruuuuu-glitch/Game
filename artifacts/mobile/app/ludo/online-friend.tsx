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
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedBackground } from '@/components/ThemedBackground';
import { AppModal } from '@/components/AppModal';
import { GlassCard } from '@/components/GlassCard';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useLudo } from '@/context/LudoContext';
import {
  GameInvite,
  UserPresence,
  UserProfile,
  getGameRoom,
  getGameRoomByShortCode,
  joinRoomAsSpectator,
  sendGameInvite,
  subscribeToFriends,
  subscribeToFriendsPresence,
  subscribeToGameInvites,
} from '@/lib/firestore';

const AMBER = '#F59E0B';

type GameMode = 2 | 3 | 4;

const MODES: { value: GameMode; label: string; desc: string }[] = [
  { value: 2, label: '2P', desc: '1 vs 1' },
  { value: 3, label: '3P', desc: '3 Players' },
  { value: 4, label: '4P', desc: '4 Squad' },
];

const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#A78BFA';
const GREEN = '#10B981';

// ── Premium player icons — consistent stroke style ──────────────────────────
function Icon2P({ color }: { color: string }) {
  return (
    <Svg width={44} height={36} viewBox="0 0 44 36" fill="none">
      <Circle cx="28" cy="10" r="6" stroke={color} strokeWidth="1.7" strokeOpacity="0.55" />
      <Path
        d="M16 34c0-5.523 5.373-10 12-10"
        stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeOpacity="0.55"
      />
      <Circle cx="16" cy="11" r="7" stroke={color} strokeWidth="2" />
      <Path
        d="M2 35c0-6.075 6.268-11 14-11s14 4.925 14 11"
        stroke={color} strokeWidth="2" strokeLinecap="round"
      />
    </Svg>
  );
}

function Icon3P({ color }: { color: string }) {
  return (
    <Svg width={52} height={36} viewBox="0 0 52 36" fill="none">
      <Circle cx="10" cy="12" r="5.5" stroke={color} strokeWidth="1.7" strokeOpacity="0.5" />
      <Path d="M2 35c0-4.97 3.582-9 8-9" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeOpacity="0.5" />
      <Circle cx="42" cy="12" r="5.5" stroke={color} strokeWidth="1.7" strokeOpacity="0.5" />
      <Path d="M50 35c0-4.97-3.582-9-8-9" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeOpacity="0.5" />
      <Circle cx="26" cy="10" r="7" stroke={color} strokeWidth="2" />
      <Path d="M12 35c0-6.075 6.268-11 14-11s14 4.925 14 11" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function Icon4P({ color }: { color: string }) {
  return (
    <Svg width={52} height={42} viewBox="0 0 52 42" fill="none">
      <Circle cx="13" cy="8" r="5" stroke={color} strokeWidth="1.7" strokeOpacity="0.55" />
      <Path d="M4 24c0-4.418 4.03-8 9-8" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeOpacity="0.55" />
      <Circle cx="39" cy="8" r="5" stroke={color} strokeWidth="1.7" strokeOpacity="0.55" />
      <Path d="M48 24c0-4.418-4.03-8-9-8" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeOpacity="0.55" />
      <Circle cx="13" cy="28" r="5" stroke={color} strokeWidth="1.9" strokeOpacity="0.8" />
      <Path d="M4 42c0-4.418 4.03-8 9-8" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeOpacity="0.8" />
      <Circle cx="39" cy="28" r="5" stroke={color} strokeWidth="1.9" strokeOpacity="0.8" />
      <Path d="M48 42c0-4.418-4.03-8-9-8" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeOpacity="0.8" />
    </Svg>
  );
}

const MODE_ICONS = { 2: Icon2P, 3: Icon3P, 4: Icon4P } as const;

// ── Animated premium mode card ───────────────────────────────────────────────
function ModeCard({
  mode,
  active,
  onPress,
}: {
  mode: typeof MODES[number];
  active: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(active ? 1.04 : 1)).current;
  const glow = useRef(new Animated.Value(active ? 1 : 0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: active ? 1.05 : 1,
      useNativeDriver: true,
      damping: 14,
      stiffness: 180,
    }).start();
    Animated.timing(glow, {
      toValue: active ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => { anim.stop(); pulse.setValue(1); };
  }, [active]);

  const IconComp = MODE_ICONS[mode.value];
  const iconColor = active ? '#C4B5FD' : colors.isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.3)';
  const inactiveBg = colors.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const borderColor = glow.interpolate({ inputRange: [0, 1], outputRange: [colors.border, 'rgba(167,139,250,0.75)'] });
  const bgColor = glow.interpolate({ inputRange: [0, 1], outputRange: [inactiveBg, 'rgba(124,58,237,0.18)'] });

  return (
    <Pressable
      style={styles.modeChipWrap}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onPress(); }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {active && (
          <Animated.View
            style={[StyleSheet.absoluteFill, styles.modeGlowRing, { transform: [{ scale: pulse }] }]}
          />
        )}
        <Animated.View style={[styles.modeChip, { borderColor, backgroundColor: bgColor }]}>
          <View style={[
            styles.modeChipHighlight,
            { backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)' },
          ]} />

          <View style={[styles.modeIconWrap, active && styles.modeIconWrapActive,
            !active && { backgroundColor: colors.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
          ]}>
            <IconComp color={iconColor} />
          </View>

          <Text style={[
            styles.modeLabel,
            { color: active ? '#E9D5FF' : colors.mutedForeground },
            active && styles.modeLabelActive,
          ]}>
            {mode.label}
          </Text>

          <Text style={[
            styles.modeDesc,
            { color: active ? 'rgba(196,181,253,0.7)' : colors.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)' },
          ]}>
            {mode.desc}
          </Text>

          {active && <View style={styles.modeActiveDot} />}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  const colors = useColors();
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
  const skBg = colors.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
  const skEl = colors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  return (
    <Animated.View style={[styles.skeletonCard, { opacity, backgroundColor: skBg, borderColor: colors.border }]}>
      <View style={[styles.skeletonAvatar, { backgroundColor: skEl }]} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={[styles.skeletonLine, { backgroundColor: skEl }]} />
        <View style={[styles.skeletonLine, { width: '45%', backgroundColor: skEl }]} />
      </View>
      <View style={[styles.skeletonCheck, { backgroundColor: skEl }]} />
    </Animated.View>
  );
}

// ── Online pulse dot ──────────────────────────────────────────────────────────
function OnlinePulse({ cardBg }: { cardBg: string }) {
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
      <View style={[styles.pulseCore, { borderColor: cardBg }]} />
    </View>
  );
}

// ── Friend card ───────────────────────────────────────────────────────────────
interface FriendCardProps {
  item: UserProfile;
  isOnline: boolean;
  isSelected: boolean;
  isMaxed: boolean;
  onPress: () => void;
}

function FriendCard({ item, isOnline, isSelected, isMaxed, onPress }: FriendCardProps) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;
  const displayName = item.name || item.username || '?';

  const cardBg = isSelected
    ? colors.isDark ? 'rgba(124,58,237,0.14)' : 'rgba(124,58,237,0.08)'
    : colors.isDark ? 'rgba(255,255,255,0.04)' : colors.card;
  const cardBorder = isSelected ? 'rgba(124,58,237,0.45)' : colors.border;
  const offlineBg = colors.isDark ? '#374151' : '#D1D5DB';

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
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
            transform: [{ scale }],
            opacity: isMaxed ? 0.38 : 1,
          },
          isSelected && styles.friendCardSelected,
        ]}
      >
        <View style={styles.avatarWrap}>
          {item.photo ? (
            <Image source={{ uri: item.photo }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={isOnline ? [PURPLE, '#4C1D95'] : colors.isDark ? ['#374151', '#1F2937'] : ['#D1D5DB', '#9CA3AF']}
              style={[styles.avatar, styles.avatarFallback]}
            >
              <Text style={styles.avatarInitial}>{displayName[0].toUpperCase()}</Text>
            </LinearGradient>
          )}
          {isOnline
            ? <OnlinePulse cardBg={cardBg} />
            : <View style={[styles.offlineDot, { backgroundColor: offlineBg, borderColor: cardBg }]} />
          }
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.friendName, { color: colors.foreground }]} numberOfLines={1}>
            {displayName}
          </Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? GREEN : colors.isDark ? '#4B5563' : '#9CA3AF' }]} />
            <Text style={[styles.friendStatus, { color: isOnline ? GREEN : colors.mutedForeground }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        <View style={[
          styles.checkbox,
          { borderColor: isSelected ? PURPLE : colors.isDark ? 'rgba(255,255,255,0.18)' : colors.border },
          isSelected && styles.checkboxSelected,
        ]}>
          {isSelected && <Feather name="check" size={13} color="#fff" />}
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  const colors = useColors();
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
        <View style={[styles.emptyIconBg, {
          backgroundColor: colors.isDark ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.08)',
          borderColor: colors.isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.15)',
        }]}>
          <Feather name="wifi-off" size={34} color={PURPLE_LIGHT} />
        </View>
      </Animated.View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Friends Yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
        Add friends using the QR scanner to start playing Ludo together!
      </Text>
    </View>
  );
}

// ── Choose mode prompt ────────────────────────────────────────────────────────
function ChooseModePrompt() {
  const colors = useColors();
  return (
    <View style={styles.promptWrap}>
      <View style={[styles.promptIconWrap, {
        backgroundColor: colors.isDark ? 'rgba(124,58,237,0.07)' : 'rgba(124,58,237,0.06)',
        borderColor: colors.isDark ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.2)',
      }]}>
        <Feather name="arrow-up-circle" size={30} color="rgba(124,58,237,0.5)" />
      </View>
      <Text style={[styles.promptText, { color: colors.mutedForeground }]}>
        Choose a game mode above{'\n'}to invite your friends
      </Text>
    </View>
  );
}

// ── Room Spectator Modal ──────────────────────────────────────────────────────
function RoomModal({
  visible,
  onClose,
  roomInput,
  setRoomInput,
  roomError,
  setRoomError,
  roomLoading,
  onWatch,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  roomInput: string;
  setRoomInput: (v: string) => void;
  roomError: string;
  setRoomError: (v: string) => void;
  roomLoading: boolean;
  onWatch: () => void;
  colors: any;
}) {
  const [focused, setFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;
  const watchScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const inputBorderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: roomError
      ? ['#EF4444', '#EF4444']
      : ['rgba(245,158,11,0.28)', 'rgba(245,158,11,0.85)'],
  });
  const inputGlow = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12],
  });

  function onWatchPressIn() {
    Animated.spring(watchScale, { toValue: 0.95, useNativeDriver: true, damping: 15 }).start();
  }
  function onWatchPressOut() {
    Animated.spring(watchScale, { toValue: 1, useNativeDriver: true, damping: 12 }).start();
  }

  return (
    <AppModal visible={visible} onClose={onClose}>
      <GlassCard
        style={[
          styles.rmCard,
          {
            borderColor: 'rgba(245,158,11,0.30)',
            shadowColor: AMBER,
          },
        ]}
        intensity={40}
        padding={0}
      >
        {/* ── Amber glow strip at top */}
        <View style={styles.rmGlowStrip} />

        <View style={styles.rmInner}>
          {/* ── Icon + Title */}
          <View style={styles.rmHeader}>
            <View style={styles.rmIconRing}>
              <View style={styles.rmIconGlow} />
              <Feather name="eye" size={20} color={AMBER} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rmTitle, { color: colors.foreground }]}>Watch a Match</Text>
              <Text style={[styles.rmSubtitle, { color: colors.mutedForeground }]}>Enter the Room ID to spectate</Text>
            </View>
          </View>

          {/* ── Input */}
          <Animated.View
            style={[
              styles.rmInputWrap,
              {
                borderColor: roomError ? '#EF4444' : inputBorderColor,
                shadowColor: roomError ? '#EF4444' : AMBER,
                shadowRadius: inputGlow,
                shadowOpacity: focused ? 0.45 : 0,
                shadowOffset: { width: 0, height: 0 },
                elevation: focused ? 6 : 0,
                backgroundColor: colors.isDark
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(0,0,0,0.04)',
              },
            ]}
          >
            <Feather
              name="hash"
              size={16}
              color={focused ? AMBER : colors.mutedForeground}
              style={styles.rmInputIcon}
            />
            <TextInput
              style={[styles.rmInput, { color: colors.foreground }]}
              placeholder="Enter Room ID"
              placeholderTextColor={colors.mutedForeground}
              value={roomInput}
              onChangeText={(t) => { setRoomInput(t.toUpperCase()); setRoomError(''); }}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={20}
              returnKeyType="go"
              onSubmitEditing={onWatch}
              editable={!roomLoading}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </Animated.View>

          {/* ── Error */}
          {roomError ? (
            <View style={styles.rmErrorRow}>
              <Feather name="alert-circle" size={13} color="#EF4444" />
              <Text style={styles.rmErrorText}>{roomError}</Text>
            </View>
          ) : null}

          {/* ── Buttons */}
          <View style={styles.rmBtnRow}>
            {/* Cancel */}
            <Pressable
              style={[styles.rmCancelBtn, {
                borderColor: colors.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)',
                backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              }]}
              onPress={onClose}
              disabled={roomLoading}
            >
              <Text style={[styles.rmCancelText, { color: colors.mutedForeground }]}>Cancel</Text>
            </Pressable>

            {/* Watch Match */}
            <Animated.View style={[styles.rmWatchOuter, { transform: [{ scale: watchScale }] }]}>
              <Pressable
                style={[styles.rmWatchBtn, { opacity: roomLoading ? 0.7 : 1 }]}
                onPress={onWatch}
                onPressIn={onWatchPressIn}
                onPressOut={onWatchPressOut}
                disabled={roomLoading}
              >
                <LinearGradient
                  colors={['#FBBF24', '#F59E0B', '#D97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                {roomLoading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <>
                    <Feather name="eye" size={15} color="#000" />
                    <Text style={styles.rmWatchText}>Watch Match</Text>
                  </>
                )}
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </GlassCard>
    </AppModal>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function OnlineFriendScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { user, profile } = useAuth();
  const { playSound } = useLudo();

  const [mode, setMode] = useState<GameMode | null>(null);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [presence, setPresence] = useState<Record<string, UserPresence>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const presenceUnsubRef = useRef<(() => void) | null>(null);

  // ── Invite notification ──────────────────────────────────────────────────
  const [inviteCount, setInviteCount] = useState(0);
  const [seenInviteCount, setSeenInviteCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToGameInvites(user.uid, (list: GameInvite[]) => {
      setInviteCount(list.length);
    });
    return unsub;
  }, [user]);

  const hasUnseenInvites = inviteCount > seenInviteCount;

  // ── Room spectator dialog ────────────────────────────────────────────────
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomInput, setRoomInput] = useState('');
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState('');

  async function handleWatchRoom() {
    const input = roomInput.trim().toUpperCase();
    if (!input) { setRoomError('Please enter a Room ID'); return; }
    setRoomLoading(true);
    setRoomError('');
    try {
      // Resolve: short code (≤6 chars) uses suffix search; longer input tries
      // direct full-ID lookup first, then falls back to short-code search.
      let room = null;
      if (input.length <= 6) {
        room = await getGameRoomByShortCode(input);
      } else {
        room = await getGameRoom(input);
        if (!room) room = await getGameRoomByShortCode(input.slice(-6));
      }

      if (!room) { setRoomError('Room not found. Check the ID and try again.'); setRoomLoading(false); return; }
      if (room.roomStatus === 'INACTIVE') { setRoomError('This room is no longer active'); setRoomLoading(false); return; }
      if (room.status === 'finished') { setRoomError('Match has ended'); setRoomLoading(false); return; }
      if (room.status !== 'in_game') { setRoomError('Match has not started yet'); setRoomLoading(false); return; }

      const fullRoomId = room.roomId;
      if (user?.uid) {
        await joinRoomAsSpectator(fullRoomId, user.uid, profile?.name || 'Spectator', profile?.photo || undefined);
      }
      setShowRoomModal(false);
      setRoomInput('');
      router.push(`/ludo/spectator?roomId=${fullRoomId}` as any);
    } catch {
      setRoomError('Something went wrong. Try again.');
    } finally {
      setRoomLoading(false);
    }
  }

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playSound();
    setSending(true);
    try {
      const roomId = await sendGameInvite(user.uid, profile, Array.from(selected), mode);
      router.push({ pathname: '/ludo/room', params: { id: roomId } } as any);
    } catch (e) {
      console.error('sendGameInvite error', e);
      setSending(false);
    }
  }

  const topPad = insets.top + (Platform.OS === 'web' ? 0 : 4);
  const canSend = mode !== null && selected.size === maxSelectable && !sending && !sent;

  // Derived theme-aware colors for inline use
  const pillBg = colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const pillBorder = colors.border;
  const statTextColor = colors.mutedForeground;
  const backBtnBg = colors.isDark ? 'rgba(255,255,255,0.06)' : colors.secondary;
  const sendDisabledBg = colors.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const sendDisabledText = colors.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)';

  return (
    <ThemedBackground>
      <Animated.View style={[{ flex: 1 }, { opacity: screenOpacity }]}>

        {/* ── Header ─────────────────────────────────────────── */}
        <View style={[styles.header, { paddingTop: topPad }]}>
          {/* Row 1: back button + title */}
          <View style={styles.headerTopRow}>
            <Pressable
              style={[styles.backBtn, { backgroundColor: backBtnBg, borderColor: colors.border }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); playSound(); router.back(); }}
              hitSlop={12}
            >
              <Ionicons name="chevron-back" size={22} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>Online Friends</Text>
            <View style={{ width: 38 }} />
          </View>

          {/* Row 2: stats (left) + action tabs (right) */}
          <View style={styles.headerBottomRow}>
            <View style={styles.statsRow}>
              <View style={[styles.statPill, { backgroundColor: pillBg, borderColor: pillBorder }]}>
                <Feather name="users" size={9} color={statTextColor} />
                <Text style={[styles.statText, { color: statTextColor }]}>{friends.length} total</Text>
              </View>
              <View style={[styles.statPill, styles.statPillGreen, { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' }]}>
                <View style={styles.statGreenDot} />
                <Text style={[styles.statText, { color: GREEN }]}>{onlineCount} online</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <Pressable
                style={[styles.actionPill, { borderColor: 'rgba(124,58,237,0.4)',
                  backgroundColor: colors.isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.07)' }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); playSound(); router.push('/ludo/active-games' as any); }}
                hitSlop={8}
              >
                <Feather name="activity" size={13} color={PURPLE_LIGHT} />
                <Text style={[styles.actionPillText, { color: PURPLE_LIGHT }]}>Active</Text>
              </Pressable>

              <Pressable
                style={[styles.actionPill, { borderColor: 'rgba(16,185,129,0.35)',
                  backgroundColor: colors.isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.07)' }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  playSound();
                  setSeenInviteCount(inviteCount);
                  router.push('/ludo/invites' as any);
                }}
                hitSlop={8}
              >
                <View style={{ position: 'relative' }}>
                  <Feather name="mail" size={13} color="#34D399" />
                  {hasUnseenInvites && (
                    <View style={styles.redDot} />
                  )}
                </View>
                <Text style={[styles.actionPillText, { color: '#34D399' }]}>Invite</Text>
              </Pressable>

              <Pressable
                style={[styles.actionPill, { borderColor: 'rgba(245,158,11,0.4)',
                  backgroundColor: colors.isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.07)' }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  playSound();
                  setRoomInput('');
                  setRoomError('');
                  setShowRoomModal(true);
                }}
                hitSlop={8}
              >
                <Feather name="eye" size={13} color={AMBER} />
                <Text style={[styles.actionPillText, { color: AMBER }]}>Room</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── Mode Selector ──────────────────────────────────── */}
        <View style={styles.modeSection}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SELECT PLAYERS</Text>
          <View style={styles.modeRow}>
            {MODES.map((m) => (
              <ModeCard
                key={m.value}
                mode={m}
                active={mode === m.value}
                onPress={() => { playSound(); setMode(m.value); }}
              />
            ))}
          </View>
        </View>

        {/* ── Divider ────────────────────────────────────────── */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* ── Friends List ───────────────────────────────────── */}
        {mode !== null ? (
          <View style={{ flex: 1 }}>
            <View style={styles.listHeader}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                SELECT {maxSelectable} FRIEND{maxSelectable > 1 ? 'S' : ''}
              </Text>
              <View style={[styles.countBadge, {
                backgroundColor: colors.isDark ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.1)',
                borderColor: colors.isDark ? 'rgba(124,58,237,0.38)' : 'rgba(124,58,237,0.25)',
              }]}>
                <Text style={[styles.countBadgeText, { color: PURPLE_LIGHT }]}>
                  {selected.size}/{maxSelectable}
                </Text>
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
                      onPress={() => {
                        if (!isMaxed) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          playSound();
                          toggleSelect(item.userId);
                        }
                      }}
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
          <View style={[styles.footer, { paddingBottom: insets.bottom + 16, borderTopColor: colors.border }]}>
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
                  <View style={[styles.sendBtn, { backgroundColor: sendDisabledBg, borderWidth: 1, borderColor: colors.border }]}>
                    <Feather name="send" size={17} color={sendDisabledText} />
                    <Text style={[styles.sendBtnText, { color: sendDisabledText }]}>
                      Send Game Invite
                    </Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          </View>
        )}
      </Animated.View>

      {/* ── Room Spectator Modal ──────────────────────────────────── */}
      <RoomModal
        visible={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        roomInput={roomInput}
        setRoomInput={setRoomInput}
        roomError={roomError}
        setRoomError={setRoomError}
        roomLoading={roomLoading}
        onWatch={handleWatchRoom}
        colors={colors}
      />

    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, gap: 5, minWidth: 0 },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 7 },
  redDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  statPillGreen: {},
  statGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
  },
  statText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionPillText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },

  // ── Mode cards ──────────────────────────────────────────────────────────────
  modeSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  modeRow: { flexDirection: 'row', gap: 10 },
  modeChipWrap: { flex: 1 },
  modeChip: {
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    overflow: 'hidden',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0,
    shadowRadius: 18,
    elevation: 0,
  },
  modeGlowRing: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(167,139,250,0.3)',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 12,
  },
  modeChipHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 36,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modeIconWrap: {
    width: 58,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginBottom: 2,
  },
  modeIconWrapActive: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  modeLabel: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  modeLabelActive: {
    letterSpacing: 0.8,
    textShadowColor: 'rgba(167,139,250,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  modeDesc: {
    fontSize: 9,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.3,
  },
  modeActiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#A78BFA',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 2,
  },

  // ── Divider ─────────────────────────────────────────────────────────────────
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
    marginBottom: 14,
  },

  // ── List header ─────────────────────────────────────────────────────────────
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
    borderWidth: 1,
  },
  countBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },

  // ── Friend card ─────────────────────────────────────────────────────────────
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  friendCardSelected: {
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
  },
  offlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
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

  // ── Skeleton ────────────────────────────────────────────────────────────────
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  skeletonAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  skeletonLine: {
    height: 11,
    width: '70%',
    borderRadius: 6,
  },
  skeletonCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },

  // ── Empty state ─────────────────────────────────────────────────────────────
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
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 21,
  },

  // ── Choose mode prompt ──────────────────────────────────────────────────────
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 21,
  },

  // ── Footer / Send button ────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
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
  sendBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },

  // ── Room Modal (premium glass) ───────────────────────────────────────────────
  rmCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 20,
  },
  rmGlowStrip: {
    height: 2,
    backgroundColor: 'rgba(245,158,11,0.55)',
    shadowColor: AMBER,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  rmInner: {
    padding: 24,
    gap: 18,
  },
  rmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rmIconRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(245,158,11,0.45)',
    backgroundColor: 'rgba(245,158,11,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rmIconGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(245,158,11,0.18)',
    shadowColor: AMBER,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
  },
  rmTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.2,
  },
  rmSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  rmInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    overflow: 'hidden',
  },
  rmInputIcon: {
    paddingLeft: 14,
    paddingRight: 8,
  },
  rmInput: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 14,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 2,
  },
  rmErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -6,
  },
  rmErrorText: {
    color: '#EF4444',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  rmBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rmCancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 13,
    borderWidth: 1,
  },
  rmCancelText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  rmWatchOuter: {
    flex: 1.6,
    borderRadius: 13,
    overflow: 'hidden',
    shadowColor: AMBER,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 8,
  },
  rmWatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 14,
    borderRadius: 13,
    overflow: 'hidden',
  },
  rmWatchText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#000',
  },
});
