import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { ContentItem, deleteContent, getUserContent, updateProfilePhoto, removeProfilePhoto } from "@/lib/firestore";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/lib/cloudinary";
import { useColors } from "@/hooks/useColors";

const MAX_IMAGE_BYTES = 1 * 1024 * 1024; // 1 MB

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, profile, refreshProfile } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  async function handleUploadPhoto() {
    if (!user) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to your photo library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const uri = asset.uri;

    // Validate file size
    let fileSizeBytes = asset.fileSize ?? 0;
    if (!fileSizeBytes && Platform.OS !== "web") {
      try {
        const info = await FileSystem.getInfoAsync(uri, { size: true } as any);
        if (info.exists && "size" in info) fileSizeBytes = (info as any).size ?? 0;
      } catch {
        /* ignore — proceed optimistically */
      }
    }

    if (fileSizeBytes > 0 && fileSizeBytes > MAX_IMAGE_BYTES) {
      Alert.alert("Image too large", "Profile image must be less than 1 MB.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUploading(true);
    try {
      const { secure_url, public_id } = await uploadImageToCloudinary(uri);
      await updateProfilePhoto(user.uid, secure_url, public_id);
      await refreshProfile();
    } catch (err: any) {
      Alert.alert("Upload failed", err?.message ?? "Could not upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeletePhoto() {
    if (!user || !profile?.photo) return;

    Alert.alert(
      "Delete Profile Photo",
      "Are you sure you want to remove your profile photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setDeleting(true);
            try {
              const publicId = profile.photoPublicId;
              await removeProfilePhoto(user.uid);
              await refreshProfile();
              if (publicId) {
                deleteImageFromCloudinary(publicId).catch(() => {});
              }
            } catch (err: any) {
              Alert.alert("Error", "Could not delete photo. Please try again.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const hasPhoto = !!profile?.photo;

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
          {/* Avatar — tap to upload */}
          <TouchableOpacity
            onPress={handleUploadPhoto}
            activeOpacity={0.8}
            disabled={uploading || deleting}
          >
            <ProfileAvatar uri={profile?.photo} size={96} name={profile?.name} />
            <View
              style={[
                styles.editBadge,
                { backgroundColor: colors.primary, borderColor: colors.background },
              ]}
            >
              {uploading ? (
                <ActivityIndicator size={10} color="#fff" />
              ) : (
                <Feather name="camera" size={11} color="#fff" />
              )}
            </View>
          </TouchableOpacity>

          <Text style={[styles.name, { color: colors.foreground }]}>{profile?.name ?? "—"}</Text>
          <Text style={[styles.usernameText, { color: colors.mutedForeground }]}>
            @{profile?.username ?? ""}
          </Text>
          {profile?.bio ? (
            <Text style={[styles.bio, { color: colors.foreground }]}>{profile.bio}</Text>
          ) : null}

          {/* Profile details chips */}
          {(profile?.gender || profile?.city || profile?.country || profile?.phone || profile?.dateOfBirth || profile?.createdAt) ? (
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
              {!!profile?.phone && (
                <View style={[styles.infoChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Feather name="phone" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.infoChipText, { color: colors.mutedForeground }]}>{profile.phone}</Text>
                </View>
              )}
              {!!profile?.dateOfBirth && (
                <View style={[styles.infoChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Feather name="calendar" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.infoChipText, { color: colors.mutedForeground }]}>{profile.dateOfBirth}</Text>
                </View>
              )}
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

          {/* Upload / Delete photo buttons */}
          <View style={styles.photoActions}>
            <TouchableOpacity
              style={[
                styles.photoBtn,
                { backgroundColor: colors.primary + "18", borderColor: colors.primary + "55" },
              ]}
              onPress={handleUploadPhoto}
              disabled={uploading || deleting}
              activeOpacity={0.8}
            >
              {uploading ? (
                <ActivityIndicator size={14} color={colors.primary} />
              ) : (
                <Feather name="upload" size={14} color={colors.primary} />
              )}
              <Text style={[styles.photoBtnText, { color: colors.primary }]}>
                {uploading ? "Uploading…" : hasPhoto ? "Change Photo" : "Upload Photo"}
              </Text>
            </TouchableOpacity>

            {hasPhoto && (
              <TouchableOpacity
                style={[
                  styles.photoBtn,
                  { backgroundColor: "#EF444418", borderColor: "#EF444455" },
                ]}
                onPress={handleDeletePhoto}
                disabled={uploading || deleting}
                activeOpacity={0.8}
              >
                {deleting ? (
                  <ActivityIndicator size={14} color="#EF4444" />
                ) : (
                  <Feather name="trash-2" size={14} color="#EF4444" />
                )}
                <Text style={[styles.photoBtnText, { color: "#EF4444" }]}>
                  {deleting ? "Deleting…" : "Delete Photo"}
                </Text>
              </TouchableOpacity>
            )}
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
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 4 },
  usernameText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  bio: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  infoChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    marginTop: 2,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  infoChipText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  actionBtnTextWhite: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  actionBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  photoActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  photoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  photoBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  statsCard: { flexDirection: "row", alignItems: "center", width: "100%", marginTop: 4 },
  statItem: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 10 },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statDivider: { width: 1, height: 32, opacity: 0.4 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
