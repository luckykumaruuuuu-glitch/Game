import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ContentGrid } from "@/components/ContentGrid";
import { GlassCard } from "@/components/GlassCard";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ThemedBackground } from "@/components/ThemedBackground";
import { useAuth } from "@/context/AuthContext";
import { ContentItem, deleteContent, getUserContent } from "@/lib/firestore";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, profile, refreshProfile } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadContent = useCallback(async () => {
    if (!user) return;
    try {
      const items = await getUserContent(user.uid);
      setContent(items);
    } catch {
      /* ignore */
    } finally {
      setLoadingContent(false);
    }
  }, [user]);

  useEffect(() => { loadContent(); }, [loadContent]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), loadContent()]);
    setRefreshing(false);
  }, [refreshProfile, loadContent]);

  async function handleDelete(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await deleteContent(id);
    setContent((prev) => prev.filter((c) => c.contentId !== id));
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <ThemedBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
          <TouchableOpacity
            style={[styles.headerBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => router.push("/settings")}
          >
            <Feather name="settings" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={() => router.push("/edit-profile")} activeOpacity={0.8}>
            <ProfileAvatar uri={profile?.photo} size={96} name={profile?.name} />
            <View style={[styles.editBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
              <Feather name="edit-2" size={11} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={[styles.name, { color: colors.foreground }]}>{profile?.name ?? "—"}</Text>
          <Text style={[styles.usernameText, { color: colors.mutedForeground }]}>
            @{profile?.username ?? ""}
          </Text>
          {profile?.bio ? (
            <Text style={[styles.bio, { color: colors.foreground }]}>{profile.bio}</Text>
          ) : null}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/edit-profile")}
              activeOpacity={0.8}
            >
              <Feather name="edit-2" size={15} color="#fff" />
              <Text style={styles.actionBtnTextWhite}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border }]}
              onPress={() => router.push("/(tabs)/qr")}
              activeOpacity={0.8}
            >
              <Feather name="grid" size={15} color={colors.foreground} />
              <Text style={[styles.actionBtnText, { color: colors.foreground }]}>My QR</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <GlassCard style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{content.length}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Posts</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => router.push("/friends")}
              activeOpacity={0.8}
            >
              <Feather name="users" size={20} color={colors.primary} />
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Friends</Text>
            </TouchableOpacity>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => router.push("/friend-requests")}
              activeOpacity={0.8}
            >
              <Feather name="user-plus" size={20} color={colors.primary} />
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Requests</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* Content Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Content</Text>
          <TouchableOpacity
            style={[styles.addContentBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/edit-profile")}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <ContentGrid items={content} loading={loadingContent} onDelete={handleDelete} editable />
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center", justifyContent: "center",
  },
  profileSection: { alignItems: "center", paddingHorizontal: 24, gap: 10 },
  editBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
  },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 4 },
  usernameText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  bio: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
  },
  actionBtnTextWhite: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  actionBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  statsCard: {
    width: "100%", flexDirection: "row", alignItems: "center",
    marginTop: 8,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 4 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statDivider: { width: 1, height: 36 },
  sectionHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 24, paddingBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  addContentBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
});
