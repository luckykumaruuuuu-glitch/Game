import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassCard } from "@/components/GlassCard";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ThemedBackground } from "@/components/ThemedBackground";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function QRScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  async function handleShare() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Share.share({
      message: `Check out ${profile?.name ?? "my"} profile on QR Profile Share! User ID: ${user?.uid}`,
      title: "My QR Profile",
    });
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <ThemedBackground>
      <View style={[styles.inner, { paddingTop: topPad + 20, paddingBottom: insets.bottom + 24 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>My QR Code</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Let others scan to view your profile
        </Text>

        <GlassCard style={styles.qrCard} padding={28}>
          <View style={styles.profileInfo}>
            <ProfileAvatar uri={profile?.photo} size={52} name={profile?.name} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.profileName, { color: colors.foreground }]} numberOfLines={1}>
                {profile?.name ?? "Your Name"}
              </Text>
              <Text style={[styles.profileBio, { color: colors.mutedForeground }]} numberOfLines={1}>
                @{profile?.username ?? ""} · {profile?.bio || "Tap to scan my profile"}
              </Text>
            </View>
          </View>

          <View style={[styles.qrWrapper, { backgroundColor: colors.isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }]}>
            {user?.uid ? (
              <QRCode
                value={user.uid}
                size={220}
                color={colors.foreground}
                backgroundColor="transparent"
              />
            ) : (
              <View style={[styles.qrPlaceholder, { borderColor: colors.border }]}>
                <Feather name="grid" size={48} color={colors.mutedForeground} />
              </View>
            )}
          </View>

          <View style={[styles.uidBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Text style={[styles.uidText, { color: colors.mutedForeground }]} numberOfLines={1}>
              {user?.uid?.slice(0, 20)}...
            </Text>
          </View>
        </GlassCard>

        <TouchableOpacity
          style={[styles.shareBtn, { backgroundColor: colors.primary }]}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Feather name="share-2" size={18} color="#fff" />
          <Text style={styles.shareBtnText}>Share Profile</Text>
        </TouchableOpacity>

        <View style={[styles.hint, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Feather name="info" size={14} color={colors.mutedForeground} />
          <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
            Anyone who scans this code will be able to view your public profile
          </Text>
        </View>
      </View>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1, paddingHorizontal: 24,
    alignItems: "center", gap: 20,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular" },
  qrCard: { width: "100%", alignItems: "center", gap: 20 },
  profileInfo: { flexDirection: "row", alignItems: "center", gap: 12, width: "100%" },
  profileName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  profileBio: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  qrWrapper: {
    padding: 16, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  qrPlaceholder: {
    width: 220, height: 220,
    alignItems: "center", justifyContent: "center",
    borderRadius: 12, borderWidth: 1, borderStyle: "dashed",
  },
  uidBadge: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: StyleSheet.hairlineWidth,
    width: "100%", alignItems: "center",
  },
  uidText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  shareBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 15, paddingHorizontal: 36,
    borderRadius: 16, width: "100%", justifyContent: "center",
  },
  shareBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  hint: {
    flexDirection: "row", gap: 8, padding: 12,
    borderRadius: 12, borderWidth: StyleSheet.hairlineWidth,
    width: "100%", alignItems: "flex-start",
  },
  hintText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
});
