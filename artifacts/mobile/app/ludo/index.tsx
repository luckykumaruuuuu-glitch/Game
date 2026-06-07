import React from 'react';
import {
  View, Text, Pressable, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const MODES = [
  {
    id: 'ai',
    icon: 'hardware-chip-outline' as const,
    label: 'Play vs Computer',
    desc: 'Challenge AI bots',
    color: '#8B5CF6',
    route: '/ludo/game-setup?mode=ai',
    disabled: false,
  },
  {
    id: 'offline',
    icon: 'people-outline' as const,
    label: 'Offline Friends',
    desc: 'Pass & play on same device',
    color: '#22C55E',
    route: '/ludo/game-setup?mode=offline',
    disabled: false,
  },
  {
    id: 'online',
    icon: 'globe-outline' as const,
    label: 'Online Friends',
    desc: 'Play with friends online',
    color: '#3B82F6',
    route: null,
    disabled: true,
  },
  {
    id: 'active',
    icon: 'game-controller-outline' as const,
    label: 'Active Games',
    desc: 'Resume ongoing games',
    color: '#F59E0B',
    route: null,
    disabled: true,
  },
];

export default function LudoMenuScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>

        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.replace('/(tabs)')}>
            <Ionicons name="chevron-back" size={22} color="#A78BFA" />
          </Pressable>
          <View style={styles.titleRow}>
            <Text style={styles.dice}>🎲</Text>
            <Text style={styles.title}>Ludo</Text>
          </View>
          <Text style={styles.subtitle}>Choose how you want to play</Text>
        </View>

        <View style={styles.grid}>
          {MODES.map(mode => (
            <Pressable
              key={mode.id}
              onPress={() => {
                if (!mode.disabled && mode.route) {
                  router.push(mode.route as any);
                }
              }}
              style={({ pressed }) => [
                styles.card,
                {
                  borderColor: mode.color + '55',
                  opacity: mode.disabled ? 0.45 : pressed ? 0.8 : 1,
                },
              ]}
              disabled={mode.disabled}
            >
              <View style={[styles.iconWrap, { backgroundColor: mode.color + '22' }]}>
                <Ionicons name={mode.icon} size={32} color={mode.color} />
              </View>
              <Text style={styles.cardLabel}>{mode.label}</Text>
              <Text style={styles.cardDesc}>{mode.desc}</Text>
              {mode.disabled && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Soon</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F1A' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  header: { marginBottom: 32 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1E1B2E', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  dice: { fontSize: 32 },
  title: { fontSize: 34, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#9CA3AF' },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 14, justifyContent: 'space-between',
  },
  card: {
    width: '47%', backgroundColor: '#1A1A2E',
    borderRadius: 18, padding: 18,
    borderWidth: 1.5, position: 'relative',
    minHeight: 160,
  },
  iconWrap: {
    width: 56, height: 56, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  cardLabel: { fontSize: 15, fontWeight: '700', color: '#F9FAFB', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#6B7280', lineHeight: 16 },
  badge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: '#374151', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeText: { fontSize: 10, color: '#9CA3AF', fontWeight: '600' },
});
