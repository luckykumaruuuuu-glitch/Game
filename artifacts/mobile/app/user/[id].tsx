import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  hasPendingRequest,
  sendFriendRequest,
  removeFriend,
  blockUser,
  unblockUser,
  isUserBlockedByMe,
  isBlockedByOther,
  subscribeToUserProfile,
  maskPhoneNumber,
} from "@/lib/firestore";
import { useColors } from "@/hooks/useColors";

type RelationState = "loading" | "self" | "friends" | "requested" | "none" | "blocked";

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
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [blockedByThem, setBlockedByThem] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Realtime profile listener — updates instantly when profile changes
    const unsubProfile = subscribeToUserProfile(id, (p) => {
      if (!p) {
        setError("Profile not found.");
        setLoading(false);
        return;
      }
      setProfile(p);
      setLoading(false);
    });

    // One-time content fetch
    getUserContent(id).then(setContent).catch(() => {});

    // One-time relation check
    if (user?.uid === id) {
      setRelation("self");
    } else if (user) {
      Promise.all([
        areFriends(user.uid, id),
        hasPendingRequest(user.uid, id),
        isUserBlockedByMe(user.uid, id),
        isBlockedByOther(user.uid, id),
      ])
        .then(([friends, pending, iBlocked, theyBlocked]) => {
          setBlockedByMe(iBlocked);
          setBlockedByThem(theyBlocked);
          if (iBlocked || theyBlocked) setRelation("blocked");
          else if (friends) setRelation("friends");
          else if (pending) setRelation("requested");
          else setRelation("none");
        })
        .catch(() => setRelation("none"));
    } else {
      setRelation("none");
    }

    return () => unsubProfile();
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

  function handleRemoveFriend() {
    Alert.alert("Remove Friend", `Remove @${profile?.username} from friends?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await removeFriend(user!.uid, id!);
          setRelation("none");
        },
      },
    ]);
  }

  function handleBlock() {
    Alert.alert(
      "Block User",
      `Block @${profile?.username}? They won't be able to send you messages or friend requests, and will be removed from your friends.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await blockUser(user!.uid, id!);
            setBlockedByMe(true);
            setRelation("blocked");
          },
        },
      ]
    );
  }

  async function handleUnblock() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await unblockUser(user!.uid, id!);
    setBlockedByMe(false);
    setRelation("none");
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
            style={[styles.errorBackBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.errorBackBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ThemedBackground>
    );
  }

  const isBlocked = blockedByMe || blockedByThem;

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
          {/* Block / Unblock button in header (only for non-self) */}
          {relation !== "self" && (
            blockedByMe ? (
              <TouchableOpacity
                style={[styles.navBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={handleUnblock}
                activeOpacity={0.8}
              >
                <Feather name="slash" size={18} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={handleBlock}
                activeOpacity={0.8}
              >
                <Feather name="slash" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            )
          )}
          {relation === "self" && <View style={{ width: 40 }} />}
        </View>

        {/* Profile */}
        <View style={styles.profileSection}>
          <ProfileAvatar uri={profile?.photo} size={96} name={profile?.name} />
          <Text style={[styles.name, { color: colors.foreground }]}>{profile?.name}</Text>
          <Text style={[styles.username, { color: colors.mutedForeground }]}>@{profile?.username}</Text>
          {profile?.bio && !isBlocked ? (
            <Text style={[styles.bio, { color: colors.foreground }]}>{profile.bio}</Text>
          ) : null}

          {/* Gender / Location chips */}
          {!isBlocked && (profile?.gender || profile?.city || profile?.country || profile?.createdAt) ? (
            <View style={styles.infoChips}>
              {!!profile?.gender && (
                <View style={[styles.infoChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Feather name="user" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.infoChipText, { color: colors.mutedForeground }]}>
                    {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                  </Text>
                </View>
              )}
              {(profile?.city || profile?.country) ? (
                <View style={[styles.infoChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.infoChipText, { color: colors.mutedForeground }]}>
                    {[profile.city, profile.country].filter(Boolean).join(", ")}
                  </Text>
                </View>
              ) : null}
              {!!profile?.createdAt && (
                <View style={[styles.infoChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Feather name="clock" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.infoChipText, { color: colors.mutedForeground }]}>
                    Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                  </Text>
                </View>
              )}
            </View>
          ) : null}

          {/* Phone number — friends see full, others see masked */}
          {!isBlocked && !!profile?.phone ? (
            <View style={[styles.phoneRow, { backgroundColor: "rgba(255,255,255,0.04)", borderColor: colors.border }]}>
              <Feather name="phone" size={13} color={colors.mutedForeground} />
              <Text style={[styles.phoneText, { color: colors.mutedForeground }]}>
                {relation === "friends" || relation === "self"
                  ? profile.phone
                  : maskPhoneNumber(profile.phone)}
              </Text>
              {relation !== "friends" && relation !== "self" && (
                <View style={[styles.phoneLockBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Feather name="lock" size={10} color={colors.mutedForeground} />
                  <Text style={[styles.phoneLockText, { color: colors.mutedForeground }]}>friends only</Text>
                </View>
              )}
            </View>
          ) : null}

          {/* Blocked banner */}
          {isBlocked && (
            <View style={[styles.blockedBanner, { backgroundColor: colors.destructive + "22", borderColor: colors.destructive + "44" }]}>
              <Feather name="slash" size={14} color={colors.destructive} />
              <Text style={[styles.blockedText, { color: colors.destructive }]}>
                {blockedByMe ? "You have blocked this user." : "This user has blocked you."}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          {relation !== "self" && !isBlocked && (
            <View style={styles.actions}>
              {relation === "friends" ? (
                <>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => router.push(`/chat/${id}`)}
                    activeOpacity={0.8}
                  >
                    <Feather name="message-circle" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Message</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.destructive + "22", borderWidth: 1, borderColor: colors.destructive + "55" }]}
                    onPress={handleRemoveFriend}
                    activeOpacity={0.8}
                  >
                    <Feather name="user-minus" size={16} color={colors.destructive} />
                    <Text style={[styles.actionBtnText, { color: colors.destructive }]}>Remove</Text>
                  </TouchableOpacity>
                </>
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
        {!isBlocked && (
          <>
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

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Content</Text>
            </View>
            <ContentGrid items={content} loading={false} />
          </>
        )}
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
  errorBackBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  errorBackBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
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
  blockedBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, marginTop: 8,
  },
  blockedText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  actions: { flexDirection: "row", gap: 10, marginTop: 8, flexWrap: "wrap", justifyContent: "center" },
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
  infoChips: {
    flexDirection: "row", flexWrap: "wrap",
    gap: 6, justifyContent: "center", marginTop: 4,
  },
  infoChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, borderWidth: StyleSheet.hairlineWidth,
  },
  infoChipText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  phoneRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 12, borderWidth: StyleSheet.hairlineWidth,
    marginTop: 4, alignSelf: "center",
  },
  phoneText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  phoneLockBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: StyleSheet.hairlineWidth,
    marginLeft: 4,
  },
  phoneLockText: { fontSize: 10, fontFamily: "Inter_400Regular" },
});
