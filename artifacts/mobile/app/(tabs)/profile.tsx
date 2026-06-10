import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { CaptionInputModal } from "@/components/CaptionInputModal";
import { ContentGrid } from "@/components/ContentGrid";
import { GlassCard } from "@/components/GlassCard";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ThemedBackground } from "@/components/ThemedBackground";
import { useAuth } from "@/context/AuthContext";
import {
  ContentItem,
  addContent,
  deleteContent,
  subscribeToUserContent,
  updateProfilePhoto,
} from "@/lib/firestore";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/lib/cloudinary";
import { useColors } from "@/hooks/useColors";

const MAX_IMAGE_BYTES = 1 * 1024 * 1024; // 1 MB
const TAG = "[PROFILE]";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, profile, refreshProfile } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingContent, setUploadingContent] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [pendingAsset, setPendingAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [captionModalVisible, setCaptionModalVisible] = useState(false);

  // ── Show brief status banner ──────────────────────────────────────────────
  function showStatus(msg: string, durationMs = 3000) {
    console.log(`${TAG} STATUS: ${msg}`);
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), durationMs);
  }

  // ── Realtime content subscription ────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    console.log(`${TAG} subscribeToUserContent → userId=${user.uid}`);
    const unsub = subscribeToUserContent(
      user.uid,
      (items) => {
        console.log(`${TAG} content update → ${items.length} items`);
        setContent(items);
        setLoadingContent(false);
      },
      (err) => {
        console.error(`${TAG} content subscription error:`, err.message);
        setLoadingContent(false);
      }
    );
    return () => unsub();
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  }, [refreshProfile]);

  // ── Shared image picker helper ────────────────────────────────────────────
  async function pickImage(squareCrop: boolean): Promise<ImagePicker.ImagePickerAsset | null> {
    console.log(`${TAG} pickImage → requesting permissions...`);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log(`${TAG} pickImage → permission granted=${perm.granted}`);

    if (!perm.granted) {
      Alert.alert("Permission required", "Please allow access to your photo library.");
      return null;
    }

    console.log(`${TAG} pickImage → launching gallery (squareCrop=${squareCrop})`);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: squareCrop,
      aspect: squareCrop ? [1, 1] : undefined,
      quality: 0.9,
    });

    console.log(`${TAG} pickImage → canceled=${result.canceled} assetCount=${result.assets?.length ?? 0}`);

    if (result.canceled || !result.assets?.[0]) {
      console.log(`${TAG} pickImage → user canceled or no asset`);
      return null;
    }

    const asset = result.assets[0];
    console.log(`${TAG} pickImage → uri=${asset.uri} mimeType=${asset.mimeType} fileSize=${asset.fileSize} w=${asset.width} h=${asset.height}`);

    // Validate size
    let fileSizeBytes = asset.fileSize ?? 0;
    if (!fileSizeBytes && Platform.OS !== "web") {
      try {
        const info = await FileSystem.getInfoAsync(asset.uri, { size: true } as any);
        if (info.exists && "size" in info) fileSizeBytes = (info as any).size ?? 0;
        console.log(`${TAG} pickImage → FileSystem size=${fileSizeBytes}`);
      } catch (e) {
        console.warn(`${TAG} pickImage → FileSystem.getInfoAsync failed:`, e);
      }
    }

    const kb = fileSizeBytes > 0 ? (fileSizeBytes / 1024).toFixed(0) : "unknown";
    console.log(`${TAG} pickImage → file size = ${kb} KB`);

    if (fileSizeBytes > 0 && fileSizeBytes > MAX_IMAGE_BYTES) {
      const sizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
      Alert.alert("Image too large", `Selected image is ${sizeMB} MB. Maximum allowed size is 1 MB. Please choose a smaller image.`);
      return null;
    }

    return asset;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SYSTEM 1 — PROFILE PHOTO
  // Avatar tap only. Never touches content collection.
  // ══════════════════════════════════════════════════════════════════════════
  async function handleUploadAvatar() {
    console.log(`${TAG} [AVATAR] handleUploadAvatar called user=${user?.uid}`);
    if (!user) { console.warn(`${TAG} [AVATAR] no user, aborting`); return; }
    if (uploadingAvatar) { console.warn(`${TAG} [AVATAR] already uploading, aborting`); return; }

    const asset = await pickImage(true);
    if (!asset) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUploadingAvatar(true);
    showStatus("Uploading profile photo…");

    try {
      // ── Cloudinary upload ──────────────────────────────────────────────
      console.log(`${TAG} [AVATAR] Cloudinary upload started → uri=${asset.uri}`);
      const mimeType = asset.mimeType ?? "image/jpeg";
      const { secure_url, public_id } = await uploadImageToCloudinary(asset.uri, mimeType);
      console.log(`${TAG} [AVATAR] Cloudinary upload SUCCESS → secure_url=${secure_url} public_id=${public_id}`);

      // ── Firebase write ─────────────────────────────────────────────────
      console.log(`${TAG} [AVATAR] Firebase write started...`);
      await updateProfilePhoto(user.uid, secure_url, public_id);
      console.log(`${TAG} [AVATAR] Firebase write SUCCESS`);

      await refreshProfile();
      console.log(`${TAG} [AVATAR] refreshProfile done`);
      showStatus("✓ Profile photo updated!");
    } catch (err: any) {
      console.error(`${TAG} [AVATAR] UPLOAD FAILED:`, err);
      Alert.alert("Upload failed", err?.message ?? "Could not upload photo. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SYSTEM 2 — CONTENT GALLERY
  // Separate from profile photo. Saves to content collection ONLY.
  // Step 1: pick image → show caption modal
  // Step 2: user types caption (optional) → tap Post → upload
  // ══════════════════════════════════════════════════════════════════════════
  async function handleUploadContent() {
    console.log(`${TAG} [CONTENT] handleUploadContent called user=${user?.uid}`);
    if (!user) { console.warn(`${TAG} [CONTENT] no user, aborting`); return; }
    if (uploadingContent) { console.warn(`${TAG} [CONTENT] already uploading, aborting`); return; }

    const asset = await pickImage(false);
    if (!asset) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPendingAsset(asset);
    setCaptionModalVisible(true);
  }

  async function handleCaptionPost(caption: string) {
    if (!user || !pendingAsset) return;
    setUploadingContent(true);
    showStatus("Uploading to gallery…");

    try {
      console.log(`${TAG} [CONTENT] Cloudinary upload started → uri=${pendingAsset.uri}`);
      const mimeType = pendingAsset.mimeType ?? "image/jpeg";
      const { secure_url, public_id } = await uploadImageToCloudinary(pendingAsset.uri, mimeType);
      console.log(`${TAG} [CONTENT] Cloudinary upload SUCCESS → secure_url=${secure_url} public_id=${public_id}`);

      console.log(`${TAG} [CONTENT] Firebase content write started...`);
      await addContent(user.uid, "image", secure_url, caption || undefined, public_id);
      console.log(`${TAG} [CONTENT] Firebase content write SUCCESS`);

      setCaptionModalVisible(false);
      setPendingAsset(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showStatus("✓ Photo added to gallery!");
    } catch (err: any) {
      console.error(`${TAG} [CONTENT] UPLOAD FAILED:`, err);
      Alert.alert("Upload failed", err?.message ?? "Could not upload image. Please try again.");
    } finally {
      setUploadingContent(false);
    }
  }

  function handleCaptionCancel() {
    if (uploadingContent) return;
    setCaptionModalVisible(false);
    setPendingAsset(null);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Content delete: Cloudinary + Firebase
  // ══════════════════════════════════════════════════════════════════════════
  async function handleDeleteContent(contentId: string) {
    console.log(`${TAG} [DELETE] contentId=${contentId}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const item = content.find((c) => c.contentId === contentId);
    setContent((prev) => prev.filter((c) => c.contentId !== contentId));
    await deleteContent(contentId).catch((e) => console.error(`${TAG} [DELETE] Firebase error:`, e));
    if (item?.publicId) {
      console.log(`${TAG} [DELETE] Cloudinary delete → publicId=${item.publicId}`);
      deleteImageFromCloudinary(item.publicId).catch(() => {});
    }
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
        {/* ── Status Banner ── */}
        {statusMsg ? (
          <View style={[styles.statusBanner, { backgroundColor: colors.primary }]}>
            <Text style={styles.statusText}>{statusMsg}</Text>
          </View>
        ) : null}

        {/* ── Header ── */}
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
          <TouchableOpacity
            style={[styles.headerBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => router.push("/settings")}
          >
            <Feather name="settings" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* ── Profile Info ── */}
        <View style={styles.profileSection}>

          {/* Avatar tap → PROFILE PHOTO ONLY */}
          <TouchableOpacity
            onPress={handleUploadAvatar}
            activeOpacity={0.8}
            disabled={uploadingAvatar}
          >
            <ProfileAvatar uri={profile?.photo} size={96} name={profile?.name} />
            <View style={[styles.editBadge, { backgroundColor: uploadingAvatar ? colors.mutedForeground : colors.primary, borderColor: colors.background }]}>
              {uploadingAvatar ? (
                <ActivityIndicator size={10} color="#fff" />
              ) : (
                <Feather name="camera" size={11} color="#fff" />
              )}
            </View>
          </TouchableOpacity>

          {/* Avatar upload progress label */}
          {uploadingAvatar ? (
            <View style={[styles.uploadingRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <ActivityIndicator size={12} color={colors.primary} />
              <Text style={[styles.uploadingText, { color: colors.primary }]}>Updating profile photo…</Text>
            </View>
          ) : null}

          <Text style={[styles.name, { color: colors.foreground }]}>{profile?.name ?? "—"}</Text>
          <Text style={[styles.usernameText, { color: colors.mutedForeground }]}>
            @{profile?.username ?? ""}
          </Text>
          {profile?.bio ? (
            <Text style={[styles.bio, { color: colors.foreground }]}>{profile.bio}</Text>
          ) : null}

          {/* Info chips */}
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

          {/* Action buttons — Edit Profile + My QR */}
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

          {/* Control Panel — Monster gaming feature slots */}
          <TouchableOpacity
            style={styles.controlPanelBtn}
            onPress={() => router.push("/(tabs)/control-panel")}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#1a0533", "#0d0d20", "#001a33"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.controlPanelGradient}
            >
              <View style={styles.controlPanelLeft}>
                <Text style={styles.controlPanelEmojis}>👑⚡🐉</Text>
                <View>
                  <Text style={styles.controlPanelTitle}>Monster Control Panel</Text>
                  <Text style={styles.controlPanelSub}>6 power slots · Secret feature zone</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="rgba(153,51,255,0.8)" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Stats */}
          <GlassCard style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{content.length}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Posts</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.statItem} onPress={() => router.push("/friends")} activeOpacity={0.8}>
              <Feather name="users" size={20} color={colors.primary} />
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Friends</Text>
            </TouchableOpacity>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.statItem} onPress={() => router.push("/friend-requests")} activeOpacity={0.8}>
              <Feather name="user-plus" size={20} color={colors.primary} />
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Requests</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* ── Content Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Content</Text>

          {/* Content Upload button — SEPARATE system from profile photo */}
          <TouchableOpacity
            style={[
              styles.addContentBtn,
              { backgroundColor: uploadingContent ? colors.mutedForeground : colors.primary },
            ]}
            onPress={handleUploadContent}
            disabled={uploadingContent}
            activeOpacity={0.8}
          >
            {uploadingContent ? (
              <ActivityIndicator size={14} color="#fff" />
            ) : (
              <Feather name="plus" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Content upload progress label */}
        {uploadingContent ? (
          <View style={[styles.uploadingRow, { backgroundColor: colors.secondary, borderColor: colors.border, marginHorizontal: 16, marginBottom: 8 }]}>
            <ActivityIndicator size={12} color={colors.primary} />
            <Text style={[styles.uploadingText, { color: colors.primary }]}>Uploading to gallery…</Text>
          </View>
        ) : null}

        <ContentGrid
          items={content}
          loading={loadingContent}
          onDelete={handleDeleteContent}
          editable
        />
      </ScrollView>

      <CaptionInputModal
        visible={captionModalVisible}
        imageUri={pendingAsset?.uri ?? null}
        uploading={uploadingContent}
        onPost={handleCaptionPost}
        onCancel={handleCaptionCancel}
      />
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  statusBanner: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  statusText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
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
  uploadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  uploadingText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
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
  controlPanelBtn: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(153,51,255,0.45)",
    shadowColor: "#9933FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  controlPanelGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  controlPanelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  controlPanelEmojis: {
    fontSize: 20,
    letterSpacing: 2,
  },
  controlPanelTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  controlPanelSub: {
    color: "rgba(153,51,255,0.8)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
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
  addContentBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
