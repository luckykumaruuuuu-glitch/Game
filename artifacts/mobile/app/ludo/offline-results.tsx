import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { ThemedBackground } from '@/components/ThemedBackground';
import { useColors } from '@/hooks/useColors';
import { COLOR_HEX, type LudoColor } from '@/lib/ludoEngine';

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣'];
const RANK_LABELS = ['Champion', '2nd Place', '3rd Place', '4th Place'];

type OfflinePlayer = { name: string; color: LudoColor };
type PlayerStats = { captures: number; diceRolls: number; totalMoves: number };

export default function OfflineResultsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    players: playersParam,
    rankings: rankingsParam,
    stats: statsParam,
  } = useLocalSearchParams<{ players: string; rankings: string; stats: string }>();

  const players: OfflinePlayer[] = React.useMemo(() => {
    try { return JSON.parse(playersParam ?? '[]'); } catch { return []; }
  }, [playersParam]);

  const rankings: LudoColor[] = React.useMemo(() => {
    try { return JSON.parse(rankingsParam ?? '[]'); } catch { return []; }
  }, [rankingsParam]);

  const stats: Record<LudoColor, PlayerStats> = React.useMemo(() => {
    try { return JSON.parse(statsParam ?? '{}'); } catch { return {} as Record<LudoColor, PlayerStats>; }
  }, [statsParam]);

  const rankedPlayers = rankings
    .map(c => players.find(p => p.color === c))
    .filter(Boolean) as OfflinePlayer[];
  const unranked = players.filter(p => !rankings.includes(p.color));
  const allOrdered = [...rankedPlayers, ...unranked];
  const winner = allOrdered[0];

  return (
    <ThemedBackground>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Winner Banner */}
        <GlassCard style={styles.winnerBanner} padding={28}>
          <Text style={styles.trophy}>🏆</Text>
          <Text style={[styles.winnerLabel, { color: colors.mutedForeground }]}>WINNER</Text>
          {winner && (
            <>
              <View style={[styles.winnerAvatar, { backgroundColor: COLOR_HEX[winner.color] }]}>
                <Text style={styles.winnerAvatarText}>{winner.name[0]?.toUpperCase() ?? '?'}</Text>
              </View>
              <Text style={[styles.winnerName, { color: colors.foreground }]}>{winner.name}</Text>
              <View style={[styles.colorBadge, { backgroundColor: COLOR_HEX[winner.color] }]}>
                <Text style={styles.colorBadgeText}>{winner.color.toUpperCase()}</Text>
              </View>
            </>
          )}
          <Text style={styles.confetti}>🎉🎊🎉🎊🎉</Text>
        </GlassCard>

        {/* Rankings */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>FINAL RANKINGS</Text>
        {allOrdered.map((player, i) => {
          const colorHex = COLOR_HEX[player.color];
          const isWinner = i === 0;
          return (
            <GlassCard
              key={player.color}
              style={[styles.rankCard, isWinner && { borderColor: colorHex, borderWidth: 1.5 }]}
              padding={16}
            >
              <Text style={styles.medal}>{MEDALS[i] ?? '—'}</Text>
              <View style={[styles.rankAvatar, { backgroundColor: colorHex }]}>
                <Text style={styles.rankAvatarText}>{player.name[0]?.toUpperCase() ?? '?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rankName, { color: colors.foreground }]}>{player.name}</Text>
                <View style={styles.rankColorRow}>
                  <View style={[styles.rankColorDot, { backgroundColor: colorHex }]} />
                  <Text style={[styles.rankColorText, { color: colors.mutedForeground }]}>
                    {player.color.toUpperCase()} · {RANK_LABELS[i] ?? 'Unranked'}
                  </Text>
                </View>
              </View>
              {rankings.includes(player.color) && (
                <Text style={[styles.finishedBadge, { color: colorHex }]}>Finished</Text>
              )}
            </GlassCard>
          );
        })}

        {/* Per-Player Stats */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PLAYER STATS</Text>
        {allOrdered.map(player => {
          const s = stats[player.color] ?? { captures: 0, diceRolls: 0, totalMoves: 0 };
          const colorHex = COLOR_HEX[player.color];
          return (
            <GlassCard key={`stats-${player.color}`} padding={16} style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <View style={[styles.statsAvatar, { backgroundColor: colorHex }]}>
                  <Text style={styles.statsAvatarText}>{player.name[0]?.toUpperCase() ?? '?'}</Text>
                </View>
                <Text style={[styles.statsName, { color: colors.foreground }]}>{player.name}</Text>
                <View style={[styles.statsBadge, { backgroundColor: colorHex + '22' }]}>
                  <Text style={[styles.statsBadgeText, { color: colorHex }]}>{player.color.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: colors.foreground }]}>{s.captures}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>⚔️ Captures</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: colors.foreground }]}>{s.diceRolls}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>🎲 Rolls</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: colors.foreground }]}>{s.totalMoves}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>🏃 Moves</Text>
                </View>
              </View>
            </GlassCard>
          );
        })}

        {/* Actions */}
        <TouchableOpacity
          style={[styles.playAgainBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.replace('/ludo/offline-setup')}
          activeOpacity={0.85}
        >
          <Text style={styles.playAgainText}>🎲 Play Again (Offline)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.homeBtn, { borderColor: colors.primary }]}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.8}
        >
          <Feather name="home" size={18} color={colors.primary} />
          <Text style={[styles.homeBtnText, { color: colors.primary }]}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14, alignItems: 'stretch' },
  winnerBanner: { alignItems: 'center', gap: 10 },
  trophy: { fontSize: 52 },
  winnerLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 2 },
  winnerAvatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  winnerAvatarText: { color: '#fff', fontSize: 36, fontFamily: 'Inter_700Bold' },
  winnerName: { fontSize: 24, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  colorBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  colorBadgeText: { color: '#fff', fontSize: 12, fontFamily: 'Inter_700Bold' },
  confetti: { fontSize: 24 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1, marginTop: 4 },
  rankCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  medal: { fontSize: 24, width: 34, textAlign: 'center' },
  rankAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  rankAvatarText: { color: '#fff', fontSize: 18, fontFamily: 'Inter_700Bold' },
  rankName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  rankColorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  rankColorDot: { width: 8, height: 8, borderRadius: 4 },
  rankColorText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  finishedBadge: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  statsCard: { gap: 14 },
  statsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statsAvatar: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
  },
  statsAvatarText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_700Bold' },
  statsName: { flex: 1, fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  statsBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statsBadgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  statDivider: { width: StyleSheet.hairlineWidth, height: 40 },
  playAgainBtn: { paddingVertical: 17, borderRadius: 18, alignItems: 'center', marginTop: 4 },
  playAgainText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
  homeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15, borderRadius: 16, borderWidth: 2,
  },
  homeBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});
