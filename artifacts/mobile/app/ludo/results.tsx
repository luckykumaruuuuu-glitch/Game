import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
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
import { useColors } from '@/hooks/useColors';
import { subscribeToRoom, type LudoRoom } from '@/lib/ludoFirestore';
import { COLOR_HEX, type LudoColor } from '@/lib/ludoEngine';

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣'];

export default function ResultsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [room, setRoom] = useState<LudoRoom | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeToRoom(roomId, setRoom);
    return unsub;
  }, [roomId]);

  const winner = room?.gameState?.winner;
  const rankings = room?.gameState?.rankings ?? [];
  const winnerPlayer = room?.players.find(p => p.color === winner);

  // Build ordered rankings
  const rankedPlayers = rankings
    .map(color => room?.players.find(p => p.color === color))
    .filter(Boolean);

  // Remaining (didn't finish)
  const unranked = room?.players.filter(p => !rankings.includes(p.color)) ?? [];
  const allRanked = [...rankedPlayers, ...unranked];

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
        <GlassCard style={styles.winnerBanner} padding={24}>
          <Text style={styles.trophy}>🏆</Text>
          <Text style={[styles.winnerLabel, { color: colors.mutedForeground }]}>WINNER</Text>
          {winnerPlayer && (
            <>
              <ProfileAvatar uri={winnerPlayer.photo} size={80} name={winnerPlayer.username} />
              <Text style={[styles.winnerName, { color: colors.foreground }]}>
                {winnerPlayer.username}
              </Text>
              <View style={[styles.colorBadge, { backgroundColor: COLOR_HEX[winnerPlayer.color] }]}>
                <Text style={styles.colorBadgeText}>{winnerPlayer.color.toUpperCase()}</Text>
              </View>
            </>
          )}
          <Text style={styles.confetti}>🎉🎊🎉🎊🎉</Text>
        </GlassCard>

        {/* Rankings */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>RANKINGS</Text>
        {allRanked.map((player, i) => {
          if (!player) return null;
          const colorHex = COLOR_HEX[player.color as LudoColor];
          const isWinner = i === 0 && rankings.includes(player.color as LudoColor);
          return (
            <GlassCard
              key={player.userId}
              style={[
                styles.rankRow,
                isWinner && { borderColor: colorHex, borderWidth: 1.5 },
              ]}
              padding={14}
            >
              <Text style={styles.medal}>{MEDALS[i] ?? '—'}</Text>
              <ProfileAvatar uri={player.photo} size={40} name={player.username} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rankName, { color: colors.foreground }]}>{player.username}</Text>
                <View style={styles.rankColorRow}>
                  <View style={[styles.rankColorDot, { backgroundColor: colorHex }]} />
                  <Text style={[styles.rankColor, { color: colors.mutedForeground }]}>
                    {player.color.toUpperCase()}
                  </Text>
                </View>
              </View>
              {rankings.includes(player.color as LudoColor) ? (
                <Text style={styles.finishedBadge}>Finished</Text>
              ) : (
                <Text style={[styles.didNotFinish, { color: colors.mutedForeground }]}>—</Text>
              )}
            </GlassCard>
          );
        })}

        {/* Summary Stats */}
        {room && (
          <GlassCard style={styles.statsCard} padding={16}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Players</Text>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{room.playerCount}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Game Mode</Text>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{room.playerCount} Player</Text>
            </View>
          </GlassCard>
        )}

        {/* Back Home Button */}
        <TouchableOpacity
          style={[styles.homeBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.8}
        >
          <Feather name="home" size={18} color="#fff" />
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playAgainBtn, { borderColor: colors.primary }]}
          onPress={() => router.replace('/ludo')}
          activeOpacity={0.8}
        >
          <Text style={[styles.playAgainText, { color: colors.primary }]}>🎲 Play Again</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14, alignItems: 'stretch' },
  winnerBanner: { alignItems: 'center', gap: 10 },
  trophy: { fontSize: 48 },
  winnerLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 2 },
  winnerName: { fontSize: 22, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  colorBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  colorBadgeText: { color: '#fff', fontSize: 12, fontFamily: 'Inter_700Bold' },
  confetti: { fontSize: 24 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  medal: { fontSize: 22, width: 32, textAlign: 'center' },
  rankName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  rankColorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  rankColorDot: { width: 10, height: 10, borderRadius: 5 },
  rankColor: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  finishedBadge: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#22C55E' },
  didNotFinish: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  statsCard: { gap: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  statValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  homeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16, borderRadius: 16, marginTop: 8,
  },
  homeBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  playAgainBtn: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 16, borderWidth: 2,
  },
  playAgainText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
