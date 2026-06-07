import React from 'react';
import {
  View, Text, Pressable, StyleSheet, SafeAreaView,
  StatusBar, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface MenuOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconFamily: 'ionicons' | 'material';
  color: string;
  available: boolean;
  route?: string;
  params?: Record<string, string>;
}

const MENU_OPTIONS: MenuOption[] = [
  {
    id: 'ai',
    title: 'Play vs Computer',
    subtitle: 'Challenge AI bots — solo fun',
    icon: 'hardware-chip-outline',
    iconFamily: 'ionicons',
    color: '#8B5CF6',
    available: true,
    route: '/ludo/game-setup',
    params: { mode: 'ai' },
  },
  {
    id: 'offline',
    title: 'Offline Friends',
    subtitle: 'Pass the phone, play together',
    icon: 'people-outline',
    iconFamily: 'ionicons',
    color: '#10B981',
    available: true,
    route: '/ludo/game-setup',
    params: { mode: 'offline' },
  },
  {
    id: 'online',
    title: 'Online Friends',
    subtitle: 'Play with friends over the internet',
    icon: 'wifi-outline',
    iconFamily: 'ionicons',
    color: '#06B6D4',
    available: false,
  },
  {
    id: 'active',
    title: 'Active Games',
    subtitle: 'Continue your ongoing matches',
    icon: 'game-controller-outline',
    iconFamily: 'ionicons',
    color: '#F59E0B',
    available: false,
  },
];

export default function LudoMenuScreen() {
  const colors = useColors();
  const isDark = colors.isDark;

  function handlePress(option: MenuOption) {
    if (!option.available) return;
    if (option.route) {
      router.push({ pathname: option.route as any, params: option.params });
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? '#0A0A12' : '#F5F5F7' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.diceIcon, { backgroundColor: '#7C3AED22' }]}>
            <MaterialCommunityIcons name="dice-6" size={28} color="#8B5CF6" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#0A0A0A' }]}>
              Ludo
            </Text>
            <Text style={[styles.headerSub, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              Choose your game mode
            </Text>
          </View>
        </View>
      </View>

      {/* Mini Ludo Board Preview */}
      <View style={styles.boardPreview}>
        <View style={[styles.miniBoard, { borderColor: isDark ? '#2D1F4A' : '#E5E7EB' }]}>
          <View style={styles.miniRow}>
            <View style={[styles.miniCell, { backgroundColor: '#22C55E' }]} />
            <View style={[styles.miniCenter, { backgroundColor: isDark ? '#1A1A2E' : '#F0F0F5' }]}>
              <MaterialCommunityIcons name="star" size={18} color="#8B5CF6" />
            </View>
            <View style={[styles.miniCell, { backgroundColor: '#F59E0B' }]} />
          </View>
          <View style={styles.miniRow}>
            <View style={[styles.miniCenter2, { backgroundColor: isDark ? '#1A1A2E' : '#F0F0F5' }]} />
            <View style={[styles.miniCenter2, { backgroundColor: isDark ? '#1A1A2E' : '#F0F0F5' }]} />
          </View>
          <View style={styles.miniRow}>
            <View style={[styles.miniCell, { backgroundColor: '#EF4444' }]} />
            <View style={[styles.miniCenter, { backgroundColor: isDark ? '#1A1A2E' : '#F0F0F5' }]}>
              <Text style={{ fontSize: 12 }}>🎲</Text>
            </View>
            <View style={[styles.miniCell, { backgroundColor: '#3B82F6' }]} />
          </View>
        </View>
      </View>

      {/* Game Mode Cards */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {MENU_OPTIONS.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => handlePress(option)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: isDark ? '#14142A' : '#FFFFFF',
                borderColor: option.available
                  ? (pressed ? option.color + '88' : option.color + '33')
                  : (isDark ? '#2A2A3A' : '#E5E7EB'),
                opacity: !option.available ? 0.55 : pressed ? 0.9 : 1,
                shadowColor: option.available ? option.color : '#000',
              },
            ]}
          >
            {/* Icon */}
            <View style={[styles.cardIconWrap, { backgroundColor: option.color + '1A' }]}>
              <Ionicons
                name={option.icon as any}
                size={26}
                color={option.available ? option.color : (isDark ? '#4B5563' : '#9CA3AF')}
              />
            </View>

            {/* Text */}
            <View style={styles.cardBody}>
              <Text style={[
                styles.cardTitle,
                { color: option.available ? (isDark ? '#FFFFFF' : '#0A0A0A') : (isDark ? '#4B5563' : '#9CA3AF') }
              ]}>
                {option.title}
              </Text>
              <Text style={[styles.cardSub, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
                {option.subtitle}
              </Text>
            </View>

            {/* Right side */}
            <View style={styles.cardRight}>
              {option.available ? (
                <View style={[styles.playBtn, { backgroundColor: option.color }]}>
                  <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
                </View>
              ) : (
                <View style={[styles.comingSoonBadge, { backgroundColor: isDark ? '#1F1F35' : '#F3F4F6' }]}>
                  <Text style={[styles.comingSoonText, { color: isDark ? '#4B5563' : '#9CA3AF' }]}>
                    Soon
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        ))}

        {/* Classic Leludo Section */}
        <View style={styles.sectionDivider}>
          <View style={[styles.dividerLine, { backgroundColor: isDark ? '#2A2A3A' : '#E5E7EB' }]} />
          <Text style={[styles.dividerLabel, { color: isDark ? '#4B5563' : '#9CA3AF' }]}>
            Classic Mode
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: isDark ? '#2A2A3A' : '#E5E7EB' }]} />
        </View>

        <Pressable
          onPress={() => router.push('/ludo/leludo-webview' as any)}
          style={({ pressed }) => [
            styles.card,
            styles.classicCard,
            {
              backgroundColor: isDark ? '#14142A' : '#FFFFFF',
              borderColor: pressed ? '#8B5CF6AA' : '#8B5CF644',
              opacity: pressed ? 0.88 : 1,
            },
          ]}
        >
          <View style={[styles.cardIconWrap, { backgroundColor: '#8B5CF61A' }]}>
            <Text style={{ fontSize: 24 }}>🎮</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#0A0A0A' }]}>
              Leludo Classic
            </Text>
            <Text style={[styles.cardSub, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              Full featured board game experience
            </Text>
          </View>
          <View style={styles.cardRight}>
            <View style={[styles.playBtn, { backgroundColor: '#8B5CF6' }]}>
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </View>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  diceIcon: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, marginTop: 1 },

  boardPreview: { alignItems: 'center', paddingVertical: 12 },
  miniBoard: {
    borderRadius: 12, borderWidth: 1.5,
    overflow: 'hidden', padding: 4, gap: 3,
  },
  miniRow: { flexDirection: 'row', gap: 3 },
  miniCell: { width: 38, height: 38, borderRadius: 6 },
  miniCenter: {
    width: 38, height: 38, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  miniCenter2: { width: 38, height: 38, borderRadius: 6 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32, gap: 10 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  classicCard: {},
  cardIconWrap: {
    width: 50, height: 50, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardSub: { fontSize: 12 },
  cardRight: { alignItems: 'center', justifyContent: 'center' },
  playBtn: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  comingSoonBadge: {
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  comingSoonText: { fontSize: 11, fontWeight: '600' },

  sectionDivider: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginVertical: 4,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6 },
});
