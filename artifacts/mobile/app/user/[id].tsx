import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ContentGrid } from "@/components/ContentGrid";
import { GlassCard } from "@/components/GlassCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ThemedBackground } from "@/components/ThemedBackground";
import { useAuth } from "@/context/AuthContext";
import {
  ContentItem,
  UserProfile,
  areFriends,
  getChatId,
  getUserContent,
  getUserProfile,
  hasPendingRequest,
  sendFriendRequest,
} from "@/lib/firestore";
import { useColors } from "@/hooks/useColors";

type RelationState = "loading" | "self" | "friends" | "requested" | "none";

export default function UserProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile: myProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [relation, setRelation] = useState<RelationState>("loading");
  const [addingFriend, setAddingFriend] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const [p, c] = await Promise.all([getUserProfile(id), getUserContent(id)]);
        if (!p) { setError("Profile not found."); return; }
        setProfile(p);
        setContent(c);

        // Check relationship
        if (user?.uid === id) {
          setRelation("self");
        } else if (user) {
          const [friends, pending] = await Promise.all([
            areFriends(user.uid, id),
            hasPendingRequest(user.uid, id),
          ]);
          setRelation(friends ? "friends" : pending ? "requested" : "none");
        } else {
          setRelation("none");
        }
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, user]);

  async function handleAddFriend() {
    if (!user || !myProfile || relation !== "none") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAddingFriend(true);
    try {
      await sendFriendRequest(user.uid, myProfile, id!);
      setRelation("requested");
    } catch {
      /* ignore */
    } finally {
      setAddingFriend(false);
    }
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  if (loading) return <LoadingScreen message="Loading profile..." />;

  if (error) {
    return (
      <ThemedBackground>
        <View style={[styles.errorContainer, { paddingTop: topPad }]}>
          <Feather name="user-x" size={48} color={colors.mutedForeground} />
          <Text style={[styles.errorTitle, { color: colors.foreground }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ThemedBackground>
    );
  }

  return (
    <ThemedBackground>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.navBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
            @{profile?.username}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Profile */}
        <View style={styles.profileSection}>
          <ProfileAvatar uri={profile?.photo} size={96} name={profile?.name} />
          <Text style={[styles.name, { color: colors.foreground }]}>{profile?.name}</Text>
          <Text style={[styles.username, { color: colors.mutedForeground }]}>@{profile?.username}</Text>
          {profile?.bio ? (
            <Text style={[styles.bio, { color: colors.foreground }]}>{profile.bio}</Text>
          ) : null}

          {/* Action Buttons */}
          {relation !== "self" && (
            <View style={styles.actions}>
              {relation === "friends" ? (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                  onPress={() => router.push(`/chat/${id}`)}
                  activeOpacity={0.8}
                >
                  <Feather name="message-circle" size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>Message</Text>
                </TouchableOpacity>
              ) : relation === "none" ? (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.primary, opacity: addingFriend ? 0.7 : 1 }]}
                  onPress={handleAddFriend}
                  disabled={addingFriend}
                  activeOpacity={0.8}
                >
                  {addingFriend ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Feather name="user-plus" size={16} color="#fff" />
                      <Text style={styles.actionBtnText}>Send Friend Request</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : relation === "requested" ? (
                <View style={[styles.actionBtn, { backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border }]}>
                  <Feather name="clock" size={16} color={colors.mutedForeground} />
                  <Text style={[styles.actionBtnText, { color: colors.mutedForeground }]}>Request Sent</Text>
                </View>
              ) : null}

            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <GlassCard style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{content.length}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Posts</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Feather name="grid" size={20} color={colors.primary} />
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>QR Active</Text>
            </View>
          </GlassCard>
        </View>

        {/* Content */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Content</Text>
        </View>
        <ContentGrid items={content} loading={false} />
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1, alignItems: "center", justifyContent: "center",
    gap: 16, paddingHorizontal: 24,
  },
  errorTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  backBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  backBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 8,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "center" },
  profileSection: { alignItems: "center", paddingHorizontal: 24, gap: 8, paddingTop: 8 },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 8 },
  username: { fontSize: 14, fontFamily: "Inter_400Regular" },
  bio: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20,
  },
  actionBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  statsRow: { paddingHorizontal: 20, marginTop: 20 },
  statsCard: { flexDirection: "row", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statDivider: { width: 1, height: 36 },
  sectionHeader: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 24, paddingBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
});
