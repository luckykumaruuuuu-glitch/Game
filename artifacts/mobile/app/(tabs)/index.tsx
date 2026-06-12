import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassCard } from "@/components/GlassCard";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ThemedBackground } from "@/components/ThemedBackground";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { useColors } from "@/hooks/useColors";
import { getPendingRequests } from "@/lib/firestore";

interface RecentScan {
  id: string;
  name: string;
  photo: string;
  scannedAt: number;
}

const RECENT_KEY = "recent_scans";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, user } = useAuth();
  const { friendCount, messageCount, totalCount } = useNotifications();
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((raw) => {
      if (raw) setRecentScans(JSON.parse(raw));
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    getPendingRequests(user.uid).then((reqs) => setPendingCount(reqs.length)).catch(() => {});
  }, [user]);

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <ThemedBackground>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: topPad + 20, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Row */}
        <View style={styles.topRow}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.username, { color: colors.foreground }]}>
              {profile?.name?.split(" ")[0] ?? "there"} 👋
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} activeOpacity={0.8}>
            <ProfileAvatar uri={profile?.photo} size={44} name={profile?.name} />
          </TouchableOpacity>
        </View>

        {/* Status Pills */}
        {(pendingCount > 0 || friendCount > 0 || messageCount > 0 || totalCount > 0) && (
          <View style={styles.pillsRow}>
            {(pendingCount > 0 || friendCount > 0) && (
              <TouchableOpacity
                style={[styles.pill, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}
                onPress={() => router.push("/friend-requests")}
                activeOpacity={0.8}
              >
                <Feather name="user-plus" size={13} color={colors.primary} />
                <Text style={[styles.pillText, { color: colors.primary }]}>
                  {Math.max(pendingCount, friendCount)} friend request{Math.max(pendingCount, friendCount) > 1 ? "s" : ""}
                </Text>
              </TouchableOpacity>
            )}
            {messageCount > 0 && (
              <TouchableOpacity
                style={[styles.pill, { backgroundColor: "#06B6D422", borderColor: "#06B6D444" }]}
                onPress={() => router.push("/chats")}
                activeOpacity={0.8}
              >
                <Feather name="message-circle" size={13} color="#06B6D4" />
                <Text style={[styles.pillText, { color: "#06B6D4" }]}>
                  {messageCount} message{messageCount > 1 ? "s" : ""}
                </Text>
              </TouchableOpacity>
            )}
            {totalCount > 0 && friendCount === 0 && messageCount === 0 && (
              <TouchableOpacity
                style={[styles.pill, { backgroundColor: "#F59E0B22", borderColor: "#F59E0B44" }]}
                onPress={() => router.push("/notifications")}
                activeOpacity={0.8}
              >
                <Feather name="bell" size={13} color="#F59E0B" />
                <Text style={[styles.pillText, { color: "#F59E0B" }]}>
                  {totalCount} new
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Hero Banner */}
        <GlassCard style={styles.heroBanner} padding={22}>
          <View style={[styles.heroBg, { backgroundColor: colors.primary + "22" }]} />
          <Feather name="grid" size={32} color={colors.primary} />
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>Your QR Profile</Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            Share your profile with anyone — let them scan your unique QR code
          </Text>
          <TouchableOpacity
            style={[styles.heroBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(tabs)/qr");
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.heroBtnText}>Show My QR</Text>
            <Feather name="arrow-right" size={16} color="#fff" />
          </TouchableOpacity>
        </GlassCard>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: "camera", label: "Scan QR", sub: "View profile", color: "#06B6D4", route: "/(tabs)/scan", badge: false },
            { icon: "search", label: "Search", sub: "Find users", color: colors.primary, route: "/(tabs)/search", badge: false },
            { icon: "users", label: "Friends", sub: "Your network", color: "#10B981", route: "/friends", badge: friendCount > 0 },
            { icon: "message-circle", label: "Messages", sub: "Chats", color: "#F59E0B", route: "/chats", badge: messageCount > 0 },
            { icon: "bell", label: "Alerts", sub: "Notifications", color: "#EF4444", route: "/notifications", badge: totalCount > 0 },
            { icon: "upload", label: "Upload", sub: "Add content", color: "#8B5CF6", route: "/edit-profile", badge: false },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionWrap}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(action.route as any);
              }}
              activeOpacity={0.8}
            >
              <GlassCard style={styles.actionCard} padding={16}>
                <View style={[styles.actionIcon, { backgroundColor: action.color + "22" }]}>
                  <Feather name={action.icon as any} size={20} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.foreground }]}>{action.label}</Text>
                <Text style={[styles.actionSub, { color: colors.mutedForeground }]}>{action.sub}</Text>
              </GlassCard>
              {action.badge && <View style={styles.actionBadgeDot} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Scans</Text>
            <View style={styles.recentList}>
              {recentScans.slice(0, 5).map((scan) => (
                <TouchableOpacity
                  key={scan.id}
                  onPress={() => router.push(`/user/${scan.id}`)}
                  activeOpacity={0.8}
                >
                  <GlassCard style={styles.recentItem} padding={14}>
                    <ProfileAvatar uri={scan.photo} size={44} name={scan.name} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.recentName, { color: colors.foreground }]}>{scan.name}</Text>
                      <Text style={[styles.recentTime, { color: colors.mutedForeground }]}>
                        {new Date(scan.scannedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Tip */}
        <GlassCard style={styles.tipCard} padding={16}>
          <Feather name="zap" size={18} color="#F59E0B" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.tipTitle, { color: colors.foreground }]}>How it works</Text>
            <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
              Share your QR code → someone scans it → they see your full profile, add you as a friend, and chat with you.
            </Text>
          </View>
        </GlassCard>
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 20 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  username: { fontSize: 24, fontFamily: "Inter_700Bold", marginTop: 2 },
  pillsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1,
  },
  pillText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  heroBanner: { gap: 10, overflow: "hidden" },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  heroTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  heroSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  heroBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    alignSelf: "flex-start", paddingVertical: 10, paddingHorizontal: 18,
    borderRadius: 20, marginTop: 4,
  },
  heroBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionWrap: { width: "30.5%", position: "relative" },
  actionCard: { gap: 6, alignItems: "flex-start" },
  actionBadgeDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#09090B",
    zIndex: 10,
  },
  actionIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  actionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  actionSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  recentList: { gap: 10 },
  recentItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  recentName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  recentTime: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  tipCard: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  tipTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  tipText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
