import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
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

export default function QRScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const cardRef = useRef<View>(null);
  const [capturing, setCapturing] = useState(false);

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
          message: `Add me on LeLudo! Scan my QR or find me as ${profile?.username ?? user?.uid}`,
          title: "My LeLudo Profile",
        });
      }
    } catch (err) {
      console.error("[QR] Share failed:", err);
    } finally {
      setCapturing(false);
    }
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <ThemedBackground>
      <View style={[styles.inner, { paddingTop: topPad + 20, paddingBottom: insets.bottom + 24 }]}>
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

            {/* QR Code */}
            <View style={styles.qrContainer}>
              <View style={styles.qrBg}>
                {user?.uid ? (
                  <QRCode
                    value={user.uid}
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

        {/* Share Button */}
        <TouchableOpacity
          style={[styles.shareBtn, { backgroundColor: colors.primary, opacity: capturing ? 0.7 : 1 }]}
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
            {capturing ? "Generating Card..." : "Share QR Card"}
          </Text>
        </TouchableOpacity>

        <View style={[styles.hint, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Feather name="info" size={14} color={colors.mutedForeground} />
          <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
            Shares your profile card as an image. Anyone who scans the QR can view your public profile.
          </Text>
        </View>
      </View>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
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

  /* Share button */
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 15,
    paddingHorizontal: 36,
    borderRadius: 16,
    width: "100%",
    justifyContent: "center",
  },
  shareBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },

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
