import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  getOnlineFriends,
  createLudoRoom,
  createAIGame,
  sendLudoInvitations,
  subscribeToPendingInvites,
  subscribeToActiveGames,
  respondToLudoInvite,
  type LudoInvitation,
  type LudoRoom,
} from '@/lib/ludoFirestore';
import { COLOR_HEX, COLORS_FOR_COUNT } from '@/lib/ludoEngine';
import type { UserProfile } from '@/lib/firestore';

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAYER_COLORS = ['#EF4444', '#22C55E', '#3B82F6', '#EAB308'];

type GameMode = 'ai' | 2 | 3 | 4;
type AIDifficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG: Record<AIDifficulty, { label: string; icon: string; desc: string; color: string }> = {
  easy:   { label: 'Easy',   icon: '😊', desc: 'Random moves',     color: '#22C55E' },
  medium: { label: 'Medium', icon: '🤔', desc: 'Basic strategy',   color: '#F59E0B' },
  hard:   { label: 'Hard',   icon: '🧠', desc: 'Smart & strategic', color: '#EF4444' },
};

// ─── Character token icons (👥 style) ─────────────────────────────────────────

function CharacterTokens({ count, active }: { count: number; active: boolean }) {
  const pColors = count === 0
    ? ['#9333EA', '#6366F1', '#EC4899', '#F59E0B'] // AI: purple/indigo/pink/orange
    : PLAYER_COLORS.slice(0, count);
  const size = count <= 2 ? 30 : count === 3 ? 25 : 22;
  const iconSize = count <= 2 ? 17 : count === 3 ? 14 : 12;
  const isGrid = count >= 4;

  const tokenEl = (color: string, i: number) => (
    <View
      key={i}
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2,
        borderColor: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.28)',
        shadowColor: color, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 3, elevation: 4,
      }}
    >
      <MaterialCommunityIcons
        name={count === 0 ? 'robot' : 'account'}
        size={iconSize}
        color="#fff"
      />
    </View>
  );

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: 52, marginBottom: 2 }}>
      {count === 0 && (
        <Text style={{ position: 'absolute', top: -4, fontSize: 13, zIndex: 10 }}>⚡</Text>
      )}
      {count >= 4 && (
        <MaterialCommunityIcons
          name="crown"
          size={12}
          color={active ? '#FFD700' : '#EAB30870'}
          style={{ position: 'absolute', top: -4, zIndex: 10 }}
        />
      )}
      {isGrid ? (
        <View style={{ width: 60, height: 46, flexDirection: 'row', flexWrap: 'wrap', gap: 5, alignItems: 'center', justifyContent: 'center', paddingTop: 10 }}>
          {pColors.map((c, i) => tokenEl(c, i))}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {pColors.map((c, i) => tokenEl(c, i))}
        </View>
      )}
    </View>
  );
}

// ─── Active Game Card ─────────────────────────────────────────────────────────

function ActiveGameCard({ game, userId, colors }: { game: LudoRoom; userId: string; colors: ReturnType<typeof import('@/hooks/useColors').useColors> }) {
  const currentColor = game.gameState?.currentTurn;
  const currentPlayer = game.players.find(p => p.color === currentColor);
  const isMyTurn = currentColor === game.players.find(p => p.userId === userId)?.color;
  const elapsed = Math.floor((Date.now() - game.createdAt) / 60000);

  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/ludo/[roomId]', params: { roomId: game.roomId } })}
      activeOpacity={0.85}
    >
      <GlassCard style={[styles.activeCard, isMyTurn && { borderColor: colors.primary, borderWidth: 2 }]} padding={16}>
        <View style={styles.activeCardHeader}>
          <View style={styles.activeCardLeft}>
            <View style={styles.activeStatus}>
              <View style={styles.liveIndicator} />
              <Text style={[styles.liveText, { color: colors.foreground }]}>LIVE</Text>
            </View>
            <Text style={[styles.activeCardTitle, { color: colors.foreground }]}>
              {game.isAIGame ? '🤖 vs Computer' : `${game.playerCount}-Player Game`}
            </Text>
            <Text style={[styles.activeCardSub, { color: colors.mutedForeground }]}>
              {isMyTurn ? '🎯 Your turn!' : `${currentPlayer?.username ?? '?'}'s turn`} · {elapsed}m ago
            </Text>
          </View>
          <View style={styles.activeAvatars}>
            {game.players.slice(0, 4).map((p, i) => (
              <View key={p.userId} style={[styles.activeAvatar, { marginLeft: i > 0 ? -10 : 0, zIndex: 4 - i }]}>
                {p.isAI ? (
                  <View style={[styles.aiAvatarCircle, { backgroundColor: COLOR_HEX[p.color] }]}>
                    <MaterialCommunityIcons name="robot" size={14} color="#fff" />
                  </View>
                ) : (
                  <ProfileAvatar uri={p.photo} size={28} name={p.username} />
                )}
              </View>
            ))}
          </View>
        </View>
        <View style={[styles.rejoinBtn, { backgroundColor: colors.primary }]}>
          <Feather name="play" size={13} color="#fff" />
          <Text style={styles.rejoinBtnText}>Rejoin Game</Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

// ─── Invite Card ──────────────────────────────────────────────────────────────

function InviteCard({
  invite,
  onJoin,
  onReject,
  processing,
  colors,
}: {
  invite: LudoInvitation;
  onJoin: () => void;
  onReject: () => void;
  processing: boolean;
  colors: ReturnType<typeof import('@/hooks/useColors').useColors>;
}) {
  return (
    <GlassCard padding={14}>
      <View style={styles.inviteRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.inviteFrom, { color: colors.foreground }]}>🎲 {invite.fromUsername}</Text>
          <Text style={[styles.inviteSub, { color: colors.mutedForeground }]}>
            {invite.playerCount}-Player Game Invite
          </Text>
        </View>
        <View style={styles.inviteBubbles}>
          {Array.from({ length: invite.playerCount }).map((_, i) => (
            <View key={i} style={[styles.inviteBubble, { backgroundColor: PLAYER_COLORS[i] }]}>
              <MaterialCommunityIcons name="account" size={10} color="#fff" />
            </View>
          ))}
        </View>
      </View>
      <View style={styles.inviteActions}>
        <TouchableOpacity
          style={[styles.rejectBtn, { borderColor: colors.destructive + '45', backgroundColor: colors.destructive + '12' }]}
          onPress={onReject}
          disabled={processing}
          activeOpacity={0.8}
        >
          {processing ? <ActivityIndicator size="small" color={colors.destructive} /> : (
            <>
              <Feather name="x" size={14} color={colors.destructive} />
              <Text style={[styles.rejectTxt, { color: colors.destructive }]}>Reject</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.joinBtn, { backgroundColor: colors.primary }]}
          onPress={onJoin}
          disabled={processing}
          activeOpacity={0.8}
        >
          {processing ? <ActivityIndicator size="small" color="#fff" /> : (
            <>
              <Feather name="play" size={14} color="#fff" />
              <Text style={styles.joinTxt}>Join Game</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LudoLobby() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, user } = useAuth();

  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>('medium');
  const [aiRobotCount, setAIRobotCount] = useState<1 | 2 | 3>(3);

  // Multiplayer state
  const [friends, setFriends] = useState<{ profile: UserProfile; online: boolean; lastSeen: number }[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<UserProfile[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [sending, setSending] = useState(false);

  // Real-time data
  const [activeGames, setActiveGames] = useState<LudoRoom[]>([]);
  const [invites, setInvites] = useState<LudoInvitation[]>([]);
  const [inviteProcessing, setInviteProcessing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;
    const unsubGames = subscribeToActiveGames(user.uid, setActiveGames);
    const unsubInvites = subscribeToPendingInvites(user.uid, setInvites);
    return () => { unsubGames(); unsubInvites(); };
  }, [user]);

  useEffect(() => {
    if (typeof selectedMode !== 'number' || !user) return;
    setLoadingFriends(true);
    setSelectedFriends([]);
    getOnlineFriends(user.uid)
      .then(setFriends)
      .catch(() => {})
      .finally(() => setLoadingFriends(false));
  }, [selectedMode, user]);

  function selectMode(mode: GameMode) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMode(mode);
    setSelectedFriends([]);
  }

  function toggleFriend(p: UserProfile) {
    if (typeof selectedMode !== 'number') return;
    const needed = selectedMode - 1;
    const isSelected = selectedFriends.some(f => f.userId === p.userId);
    if (isSelected) {
      setSelectedFriends(prev => prev.filter(f => f.userId !== p.userId));
    } else {
      if (selectedFriends.length >= needed) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      setSelectedFriends(prev => [...prev, p]);
    }
    Haptics.selectionAsync();
  }

  async function handleStartAI() {
    if (!profile) return;
    setSending(true);
    try {
      const roomId = await createAIGame(profile, aiDifficulty, aiRobotCount);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({ pathname: '/ludo/[roomId]', params: { roomId } });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to start game.');
    } finally {
      setSending(false);
    }
  }

  async function handleSendInvites() {
    if (!profile || typeof selectedMode !== 'number') return;
    const needed = selectedMode - 1;
    if (selectedFriends.length !== needed) {
      Alert.alert('Select Friends', `Please select exactly ${needed} friend${needed > 1 ? 's' : ''}.`);
      return;
    }
    setSending(true);
    try {
      const roomId = await createLudoRoom(profile, selectedMode, selectedFriends);
      await sendLudoInvitations(roomId, profile, selectedFriends, selectedMode);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({ pathname: '/ludo/waiting', params: { roomId } });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to create game.');
    } finally {
      setSending(false);
    }
  }

  async function handleJoinInvite(invite: LudoInvitation) {
    if (!user || inviteProcessing[invite.inviteId]) return;
    setInviteProcessing(prev => ({ ...prev, [invite.inviteId]: true }));
    try {
      await respondToLudoInvite(invite.inviteId, invite.roomId, user.uid, true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({ pathname: '/ludo/waiting', params: { roomId: invite.roomId } });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to join.');
      setInviteProcessing(prev => ({ ...prev, [invite.inviteId]: false }));
    }
  }

  async function handleRejectInvite(invite: LudoInvitation) {
    if (!user || inviteProcessing[invite.inviteId]) return;
    setInviteProcessing(prev => ({ ...prev, [invite.inviteId]: true }));
    try {
      await respondToLudoInvite(invite.inviteId, invite.roomId, user.uid, false);
    } catch {
      setInviteProcessing(prev => ({ ...prev, [invite.inviteId]: false }));
    }
  }

  const onlineFriends = friends.filter(f => f.online);
  const offlineFriends = friends.filter(f => !f.online);
  const needed = typeof selectedMode === 'number' ? selectedMode - 1 : 0;
  const canSend = typeof selectedMode === 'number' && selectedFriends.length === needed;

  const MODES: { mode: GameMode; label: string; sub: string; tokenCount: number }[] = [
    { mode: 'ai', label: 'vs Computer', sub: 'Instant · No wait', tokenCount: 0 },
    { mode: 2,    label: '2 Players',   sub: '1 friend',           tokenCount: 2 },
    { mode: 3,    label: '3 Players',   sub: '2 friends',          tokenCount: 3 },
    { mode: 4,    label: '4 Players',   sub: '3 friends',          tokenCount: 4 },
  ];

  return (
    <ThemedBackground>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.titleText, { color: colors.foreground }]}>🎲 Ludo</Text>
            <Text style={[styles.titleSub, { color: colors.mutedForeground }]}>Multiplayer</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Active Games */}
        {activeGames.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACTIVE GAMES</Text>
              <View style={[styles.livePill, { backgroundColor: '#EF444420' }]}>
                <View style={styles.liveIndicator} />
                <Text style={[styles.livePillText, { color: '#EF4444' }]}>{activeGames.length} Live</Text>
              </View>
            </View>
            {activeGames.map(game => (
              <ActiveGameCard key={game.roomId} game={game} userId={user?.uid ?? ''} colors={colors} />
            ))}
          </>
        )}

        {/* Pending Invites */}
        {invites.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              GAME INVITATIONS ({invites.length})
            </Text>
            {invites.map(invite => (
              <InviteCard
                key={invite.inviteId}
                invite={invite}
                onJoin={() => handleJoinInvite(invite)}
                onReject={() => handleRejectInvite(invite)}
                processing={!!inviteProcessing[invite.inviteId]}
                colors={colors}
              />
            ))}
          </>
        )}

        {/* Mode Selection */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SELECT MODE</Text>
        <View style={styles.modesGrid}>
          {MODES.map(({ mode, label, sub, tokenCount }) => {
            const active = selectedMode === mode;
            return (
              <TouchableOpacity
                key={String(mode)}
                style={[
                  styles.modeCard,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => selectMode(mode)}
                activeOpacity={0.8}
              >
                <CharacterTokens count={tokenCount} active={active} />
                <Text style={[styles.modeLabel, { color: active ? '#fff' : colors.foreground }]}>{label}</Text>
                <Text style={[styles.modeSub, { color: active ? '#ffffff99' : colors.mutedForeground }]}>{sub}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* AI Difficulty + Start */}
        {selectedMode === 'ai' && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DIFFICULTY</Text>
            <View style={styles.diffRow}>
              {(['easy', 'medium', 'hard'] as AIDifficulty[]).map(diff => {
                const cfg = DIFFICULTY_CONFIG[diff];
                const isActive = aiDifficulty === diff;
                return (
                  <TouchableOpacity
                    key={diff}
                    style={[
                      styles.diffCard,
                      {
                        backgroundColor: isActive ? cfg.color + '22' : colors.card,
                        borderColor: isActive ? cfg.color : colors.border,
                        borderWidth: isActive ? 2 : 1,
                      },
                    ]}
                    onPress={() => { setAIDifficulty(diff); Haptics.selectionAsync(); }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.diffIcon}>{cfg.icon}</Text>
                    <Text style={[styles.diffLabel, { color: isActive ? cfg.color : colors.foreground }]}>{cfg.label}</Text>
                    <Text style={[styles.diffDesc, { color: colors.mutedForeground }]}>{cfg.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ROBOT COUNT</Text>
            <View style={styles.diffRow}>
              {([1, 2, 3] as const).map((count) => {
                const isActive = aiRobotCount === count;
                const label = count === 1 ? '1 Robot' : count === 2 ? '2 Robots' : '3 Robots';
                const icon = count === 1 ? '🤖' : count === 2 ? '🤖🤖' : '🤖🤖🤖';
                return (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.diffCard,
                      {
                        backgroundColor: isActive ? colors.primary + '22' : colors.card,
                        borderColor: isActive ? colors.primary : colors.border,
                        borderWidth: isActive ? 2 : 1,
                      },
                    ]}
                    onPress={() => { setAIRobotCount(count); Haptics.selectionAsync(); }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: count === 3 ? 14 : 20 }}>{icon}</Text>
                    <Text style={[styles.diffLabel, { color: isActive ? colors.primary : colors.foreground }]}>{label}</Text>
                    <Text style={[styles.diffDesc, { color: colors.mutedForeground }]}>
                      {count + 1} Player Game
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <GlassCard style={styles.aiInfoCard} padding={14}>
              <MaterialCommunityIcons name="robot" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.aiInfoTitle, { color: colors.foreground }]}>
                  {aiRobotCount + 1}-Player AI Game
                </Text>
                <Text style={[styles.aiInfoSub, { color: colors.mutedForeground }]}>
                  You (🔴 Red) vs {aiRobotCount} CPU {aiRobotCount === 1 ? 'opponent' : 'opponents'} · Game starts instantly
                </Text>
              </View>
            </GlassCard>

            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: colors.primary, opacity: sending ? 0.7 : 1 }]}
              onPress={handleStartAI}
              disabled={sending}
              activeOpacity={0.8}
            >
              {sending ? <ActivityIndicator color="#fff" /> : (
                <>
                  <MaterialCommunityIcons name="robot" size={20} color="#fff" />
                  <Text style={styles.startBtnText}>Start vs Computer</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* Multiplayer Friend Invite */}
        {typeof selectedMode === 'number' && (
          <>
            <GlassCard style={styles.colorPreview} padding={12}>
              <Text style={[styles.colorLabel, { color: colors.mutedForeground }]}>Your color:</Text>
              <View style={[styles.colorDot, { backgroundColor: PLAYER_COLORS[0] }]} />
              <Text style={[styles.colorHint, { color: colors.mutedForeground }]}>You play as RED</Text>
            </GlassCard>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              SELECT FRIENDS ({selectedFriends.length}/{needed})
            </Text>

            {loadingFriends ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
            ) : friends.length === 0 ? (
              <GlassCard padding={20}>
                <Text style={[styles.emptyText, { color: colors.mutedForeground, textAlign: 'center' }]}>
                  No friends yet.{'\n'}Add friends to invite them!
                </Text>
              </GlassCard>
            ) : (
              <>
                {onlineFriends.length > 0 && (
                  <>
                    <View style={styles.statusBar}>
                      <View style={styles.onlineDot} />
                      <Text style={[styles.statusLabel, { color: colors.foreground }]}>Online</Text>
                    </View>
                    {onlineFriends.map(({ profile: p }) => {
                      const selected = selectedFriends.some(f => f.userId === p.userId);
                      return (
                        <TouchableOpacity key={p.userId} onPress={() => toggleFriend(p)} activeOpacity={0.8}>
                          <GlassCard
                            style={[styles.friendRow, selected && { borderColor: colors.primary, borderWidth: 2 }]}
                            padding={12}
                          >
                            <View style={styles.avatarWrap}>
                              <ProfileAvatar uri={p.photo} size={42} name={p.name} />
                              <View style={styles.onlineBadge} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.friendName, { color: colors.foreground }]}>{p.name}</Text>
                              <Text style={[styles.friendUser, { color: colors.mutedForeground }]}>@{p.username}</Text>
                            </View>
                            <View style={[styles.checkbox, { backgroundColor: selected ? colors.primary : 'transparent', borderColor: selected ? colors.primary : colors.border }]}>
                              {selected && <Feather name="check" size={13} color="#fff" />}
                            </View>
                          </GlassCard>
                        </TouchableOpacity>
                      );
                    })}
                  </>
                )}
                {offlineFriends.length > 0 && (
                  <>
                    <View style={styles.statusBar}>
                      <View style={[styles.onlineDot, { backgroundColor: '#6B7280' }]} />
                      <Text style={[styles.statusLabel, { color: colors.mutedForeground }]}>Offline</Text>
                    </View>
                    {offlineFriends.map(({ profile: p }) => (
                      <GlassCard key={p.userId} style={styles.friendRow} padding={12}>
                        <View style={styles.avatarWrap}>
                          <ProfileAvatar uri={p.photo} size={42} name={p.name} />
                          <View style={[styles.onlineBadge, { backgroundColor: '#6B7280' }]} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.friendName, { color: colors.mutedForeground }]}>{p.name}</Text>
                          <Text style={[styles.friendUser, { color: colors.mutedForeground }]}>@{p.username} · Offline</Text>
                        </View>
                      </GlassCard>
                    ))}
                  </>
                )}
              </>
            )}

            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: canSend ? colors.primary : colors.muted, opacity: sending ? 0.7 : 1 }]}
              onPress={handleSendInvites}
              disabled={!canSend || sending}
              activeOpacity={0.8}
            >
              {sending ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Feather name="send" size={18} color="#fff" />
                  <Text style={styles.startBtnText}>
                    Send Invitations ({selectedFriends.length}/{needed})
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ThemedBackground>
  );
}

function timeSince(ts: number): string {
  const d = Math.floor((Date.now() - ts) / 1000);
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  return `${Math.floor(d / 3600)}h ago`;
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  backBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center' },
  titleText: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  titleSub: { fontSize: 12, fontFamily: 'Inter_400Regular' },

  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1, marginTop: 6 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  livePillText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  liveIndicator: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF4444' },
  liveText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },

  // Active Game Card
  activeCard: { gap: 12 },
  activeCardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  activeCardLeft: { flex: 1, gap: 3 },
  activeStatus: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  activeCardTitle: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  activeCardSub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  activeAvatars: { flexDirection: 'row', alignItems: 'center' },
  activeAvatar: {},
  aiAvatarCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  rejoinBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 10 },
  rejoinBtnText: { color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' },

  // Invite Card
  inviteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  inviteFrom: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  inviteSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  inviteBubbles: { flexDirection: 'row', gap: 4 },
  inviteBubble: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  inviteActions: { flexDirection: 'row', gap: 10 },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  rejectTxt: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  joinBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10, borderRadius: 10 },
  joinTxt: { color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' },

  // Mode cards (2×2 grid)
  modesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  modeCard: {
    width: '47%', borderRadius: 16, borderWidth: 1.5,
    alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8, gap: 5,
  },
  modeLabel: { fontSize: 13, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  modeSub: { fontSize: 10, fontFamily: 'Inter_400Regular', textAlign: 'center' },

  // Difficulty
  diffRow: { flexDirection: 'row', gap: 10 },
  diffCard: { flex: 1, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 6, borderRadius: 14, gap: 5 },
  diffIcon: { fontSize: 24 },
  diffLabel: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  diffDesc: { fontSize: 10, fontFamily: 'Inter_400Regular', textAlign: 'center' },

  aiInfoCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiInfoTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  aiInfoSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },

  // Color preview
  colorPreview: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  colorLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  colorDot: { width: 20, height: 20, borderRadius: 10 },
  colorHint: { fontSize: 12, fontFamily: 'Inter_400Regular' },

  // Friend list
  statusBar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  statusLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: { position: 'relative' },
  onlineBadge: { position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#fff' },
  friendName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  friendUser: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },
  checkbox: { width: 26, height: 26, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular' },

  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16, marginTop: 4 },
  startBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
