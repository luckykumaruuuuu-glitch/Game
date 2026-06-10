import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
import { useLudo } from '@/context/LudoContext';
import { GameRoom, GameRoomPlayer, subscribeToUserActiveRooms, cleanupExpiredRooms } from '@/lib/firestore';

// Must match HUMAN_PREFERRED_POSITIONS in room.tsx and the game HTML bundle
const HUMAN_PREFERRED_POSITIONS = [2, 0, 1, 3];

function buildQuickStartId(gameMode: 2 | 3 | 4): string {
  if (gameMode === 4) return 'qs,4,0';
  const humanColors = HUMAN_PREFERRED_POSITIONS.slice(0, gameMode).join(',');
  return `qs,${gameMode},0,${humanColors}`;
}

function buildNamesByPlayerIndex(sortedPlayers: GameRoomPlayer[], gameMode: 2 | 3 | 4): string[] {
  const names = ['', '', '', ''];
  sortedPlayers.slice(0, gameMode).forEach((player, i) => {
    names[HUMAN_PREFERRED_POSITIONS[i]] = player.name || '';
  });
  return names;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return 'Just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

const STATUS_LABELS: Record<string, string> = {
  waiting: 'Waiting',
  ready: 'Ready',
  starting: 'Starting…',
  in_game: 'In Game',
  finished: 'Finished',
};

const STATUS_COLORS: Record<string, string> = {
  waiting: '#9CA3AF',
  ready: '#F59E0B',
  starting: '#F59E0B',
  in_game: '#10B981',
  finished: '#6B7280',
};

export default function ActiveGamesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { startOnlineGame } = useLudo();

  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    cleanupExpiredRooms(user.uid).catch(() => {});
    const unsub = subscribeToUserActiveRooms(user.uid, (list) => {
      setRooms(list);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const topPad = insets.top + (Platform.OS === 'web' ? 0 : 4);

  function handleResume(room: GameRoom) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // For in_game rooms: skip the waiting room entirely — launch directly into the game
    if (room.status === 'in_game' && Platform.OS !== 'web' && user) {
      const sortedPlayers = Object.values(room.players).sort((a, b) => a.joinedAt - b.joinedAt);
      const quickStartId = buildQuickStartId(room.gameMode);
      const namesByPlayerIndex = buildNamesByPlayerIndex(sortedPlayers, room.gameMode);
      const myJoinIndex = sortedPlayers.findIndex((p) => p.userId === user.uid);
      const myPlayerIndex = myJoinIndex >= 0 ? HUMAN_PREFERRED_POSITIONS[myJoinIndex] : 0;
      const playerIndexMap: Record<string, number> = {};
      sortedPlayers.slice(0, room.gameMode).forEach((p, i) => {
        playerIndexMap[p.userId] = HUMAN_PREFERRED_POSITIONS[i];
      });
      startOnlineGame(
        quickStartId,
        namesByPlayerIndex,
        room.roomId,
        myPlayerIndex,
        user.uid,
        room.gameState,
        user.uid === room.hostId,
        playerIndexMap,
        room.gameMode
      );
      router.back();
      return;
    }

    // For non-in_game rooms (waiting/ready/starting): open the room lobby
    router.push({ pathname: '/ludo/room', params: { id: room.roomId } } as any);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Active Games</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : rooms.length === 0 ? (
        <View style={styles.center}>
          <Feather name="inbox" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Active Games</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Join or create a room to start playing
          </Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(r) => r.roomId}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => {
            const isInGame = item.status === 'in_game';
            const statusColor = STATUS_COLORS[item.status] ?? '#9CA3AF';
            const playerCount = Object.keys(item.players ?? {}).length;
            const activityTime = item.lastActivityAt ?? item.matchStartedAt ?? item.createdAt;

            return (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: isInGame ? colors.primary : colors.border,
                  },
                ]}
              >
                {/* ── Card Header ───────────────────────────── */}
                <View style={styles.cardHeader}>
                  <View style={styles.roomIdRow}>
                    <Feather name="hash" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.roomId, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {item.roomId}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {STATUS_LABELS[item.status] ?? item.status}
                    </Text>
                  </View>
                </View>

                {/* ── Card Body ─────────────────────────────── */}
                <View style={styles.cardBody}>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Feather name="users" size={14} color={colors.mutedForeground} />
                      <Text style={[styles.metaText, { color: colors.foreground }]}>
                        {playerCount}/{item.gameMode} Players
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Feather name="grid" size={14} color={colors.mutedForeground} />
                      <Text style={[styles.metaText, { color: colors.foreground }]}>
                        {item.gameMode}-Player Mode
                      </Text>
                    </View>
                  </View>

                  {item.matchStartedAt ? (
                    <View style={styles.metaItem}>
                      <Feather name="play-circle" size={14} color={colors.mutedForeground} />
                      <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                        Started {timeAgo(item.matchStartedAt)}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.metaItem}>
                    <Feather name="clock" size={14} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                      Last activity {timeAgo(activityTime)}
                    </Text>
                  </View>

                  {/* ── Players ──────────────────────────────── */}
                  <View style={styles.playersRow}>
                    {Object.values(item.players ?? {}).map((p) => (
                      <View
                        key={p.userId}
                        style={[styles.playerChip, { backgroundColor: colors.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}
                      >
                        <Text style={[styles.playerInitial, { color: colors.primary }]}>
                          {(p.name || '?')[0].toUpperCase()}
                        </Text>
                        <Text style={[styles.playerName, { color: colors.foreground }]} numberOfLines={1}>
                          {p.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* ── Action ────────────────────────────────── */}
                {isInGame ? (
                  <TouchableOpacity
                    style={[styles.resumeBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleResume(item)}
                    activeOpacity={0.8}
                  >
                    <Feather name="play" size={16} color="#fff" />
                    <Text style={styles.resumeBtnText}>Resume Game</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.rejoinBtn, { borderColor: colors.border }]}
                    onPress={() => handleResume(item)}
                    activeOpacity={0.8}
                  >
                    <Feather name="log-in" size={15} color={colors.foreground} />
                    <Text style={[styles.rejoinBtnText, { color: colors.foreground }]}>
                      Return to Room
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
  },
  roomIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  roomId: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  playersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  playerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  playerInitial: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  playerName: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    maxWidth: 80,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginHorizontal: 14,
    marginBottom: 14,
    borderRadius: 12,
  },
  resumeBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  rejoinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginHorizontal: 14,
    marginBottom: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  rejoinBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
});
