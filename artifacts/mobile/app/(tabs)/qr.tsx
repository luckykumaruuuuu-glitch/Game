import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ThemedBackground } from "@/components/ThemedBackground";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

/**
 * Returns the full HTTPS public-profile URL for a given Firebase userId.
 * - On web (browser): reads window.location.origin at runtime — always the correct domain, no env var needed.
 * - On native (Expo Go): uses EXPO_PUBLIC_DOMAIN injected by Metro at bundle compile time.
 *
 * The resulting URL must start with https:// and contain /profile/{userId}.
 * Example: https://abc123.pike.replit.dev/profile/xKfJABC9xyz
 */
function getProfileUrl(userId: string): string {
  // Web runtime: window.location.origin is always the exact current domain
  if (Platform.OS === "web" && typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/profile/${userId}`;
  }
  // Native: Metro substitutes EXPO_PUBLIC_DOMAIN with the actual domain string at build time
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) {
    return `https://${domain}/profile/${userId}`;
  }
  // Should never reach here — EXPO_PUBLIC_DOMAIN must be set in the dev script
  return `https://leludo.app/profile/${userId}`;
}

export default function QRScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const cardRef = useRef<View>(null);
  const [capturing, setCapturing] = useState(false);
  const [copied, setCopied] = useState(false);

  const profileUrl = user?.uid ? getProfileUrl(user.uid) : null;

  async function handleShare() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      setCapturing(true);
      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      const sharingAvailable = await Sharing.isAvailableAsync();
      if (sharingAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: `${profile?.name ?? "My"} QR Profile`,
        });
      } else {
        await Share.share({
          message: `Add me on LeLudo! View my profile: ${profileUrl ?? ""}\nOr find me as @${profile?.username ?? ""}`,
          title: "My LeLudo Profile",
        });
      }
    } catch (err) {
      console.error("[QR] Share failed:", err);
    } finally {
      setCapturing(false);
    }
  }

  async function handleCopyLink() {
    if (!profileUrl) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <ThemedBackground>
      <ScrollView
        contentContainerStyle={[styles.inner, { paddingTop: topPad + 20, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: colors.foreground }]}>My QR Code</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Share your gaming profile card
        </Text>

        {/* === Shareable QR Profile Card === */}
        <View
          ref={cardRef}
          collapsable={false}
          style={styles.cardOuter}
        >
          <LinearGradient
            colors={["#1a053a", "#0d0d20", "#1a053a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            {/* Glow accent top-right */}
            <View style={styles.glowAccentTopRight} />
            {/* Glow accent bottom-left */}
            <View style={styles.glowAccentBottomLeft} />

            {/* Header: App branding + dice icons */}
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="dice-6" size={16} color="rgba(124,58,237,0.7)" />
              <Text style={styles.cardBrand}>LeLudo</Text>
              <MaterialCommunityIcons name="dice-multiple" size={16} color="rgba(124,58,237,0.7)" />
            </View>

            {/* Divider */}
            <View style={styles.headerDivider} />

            {/* Profile Photo */}
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarGlow} />
              <View style={styles.avatarBorder}>
                <ProfileAvatar
                  uri={profile?.photo}
                  size={76}
                  name={profile?.name}
                />
              </View>
            </View>

            {/* Display Name */}
            <Text style={styles.cardName} numberOfLines={1}>
              {profile?.name ?? "Player"}
            </Text>
            <Text style={styles.cardHandle} numberOfLines={1}>
              @{profile?.username ?? ""}
            </Text>

            {/* QR Code — encodes the full /profile/{userId} URL */}
            <View style={styles.qrContainer}>
              <View style={styles.qrBg}>
                {profileUrl ? (
                  <QRCode
                    value={profileUrl}
                    size={168}
                    color="#1a053a"
                    backgroundColor="white"
                  />
                ) : (
                  <View style={styles.qrPlaceholder}>
                    <Feather name="grid" size={48} color="#1a053a" />
                  </View>
                )}
              </View>
            </View>

            {/* Scan label */}
            <View style={styles.scanLabel}>
              <Feather name="zap" size={12} color="#7C3AED" />
              <Text style={styles.scanText}>Scan to Connect</Text>
              <Feather name="zap" size={12} color="#7C3AED" />
            </View>

            {/* Footer decoration */}
            <View style={styles.cardFooter}>
              <View style={styles.footerDot} />
              <View style={[styles.footerDot, styles.footerDotLg]} />
              <View style={styles.footerDot} />
            </View>
          </LinearGradient>
        </View>

        {/* Profile URL display — shows exactly what the QR encodes */}
        {profileUrl ? (
          <View style={[styles.urlBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="link" size={13} color={colors.mutedForeground} style={{ marginTop: 1 }} />
            <Text style={[styles.urlText, { color: colors.mutedForeground }]} numberOfLines={2} selectable>
              {profileUrl}
            </Text>
          </View>
        ) : null}

        {/* Action buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: colors.primary, opacity: capturing ? 0.7 : 1, flex: 1 }]}
            onPress={handleShare}
            activeOpacity={0.8}
            disabled={capturing}
          >
            {capturing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="share-2" size={18} color="#fff" />
            )}
            <Text style={styles.shareBtnText}>
              {capturing ? "Generating..." : "Share Card"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.copyBtn, { backgroundColor: copied ? "#16a34a" : colors.card, borderColor: copied ? "#16a34a" : colors.border }]}
            onPress={handleCopyLink}
            activeOpacity={0.8}
            disabled={!profileUrl}
          >
            <Feather name={copied ? "check" : "copy"} size={18} color={copied ? "#fff" : colors.foreground} />
            <Text style={[styles.copyBtnText, { color: copied ? "#fff" : colors.foreground }]}>
              {copied ? "Copied!" : "Copy Link"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.hint, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Feather name="info" size={14} color={colors.mutedForeground} />
          <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
            Scan with Google Lens, iPhone Camera, or any QR scanner — opens your public profile directly, no login needed.
          </Text>
        </View>
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  inner: {
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 18,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular" },

  /* Card */
  cardOuter: {
    width: 300,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  cardGradient: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.35)",
    borderRadius: 24,
    position: "relative",
    overflow: "hidden",
  },
  glowAccentTopRight: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(124,58,237,0.25)",
  },
  glowAccentBottomLeft: {
    position: "absolute",
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(6,182,212,0.15)",
  },

  /* Header */
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  cardBrand: {
    color: "#ffffff",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  headerDivider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(124,58,237,0.4)",
    marginBottom: 18,
  },

  /* Avatar */
  avatarWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    position: "relative",
  },
  avatarGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(124,58,237,0.3)",
  },
  avatarBorder: {
    padding: 3,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: "#7C3AED",
    backgroundColor: "rgba(124,58,237,0.15)",
  },

  /* Name */
  cardName: {
    color: "#ffffff",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 3,
  },
  cardHandle: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 18,
  },

  /* QR */
  qrContainer: {
    padding: 3,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(124,58,237,0.5)",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 14,
  },
  qrBg: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  qrPlaceholder: {
    width: 168,
    height: 168,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Scan label */
  scanLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  scanText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  /* Footer dots */
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  footerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(124,58,237,0.5)",
  },
  footerDotLg: {
    width: 20,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(124,58,237,0.8)",
  },

  /* URL display */
  urlBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    width: "100%",
  },
  urlText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 16,
  },

  /* Buttons row */
  btnRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 16,
    justifyContent: "center",
  },
  shareBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
  },
  copyBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },

  /* Hint */
  hint: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    width: "100%",
    alignItems: "flex-start",
  },
  hintText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
});
