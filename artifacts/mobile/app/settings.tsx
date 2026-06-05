import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedBackground } from "@/components/ThemedBackground";
import { GlassCard } from "@/components/GlassCard";
import { useAuth } from "@/context/AuthContext";
import { useTheme, ThemeMode } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";
import { ConfirmModal } from "@/components/ConfirmModal";

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string; desc: string }[] = [
  { mode: "system", label: "System Default", icon: "monitor", desc: "Follows your device theme" },
  { mode: "dark", label: "Dark Mode", icon: "moon", desc: "Dark background, white text" },
  { mode: "light", label: "Light Mode", icon: "sun", desc: "White background, dark text" },
];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { themeMode, setThemeMode } = useTheme();
  const { signOut, profile } = useAuth();

  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleThemeSelect(mode: ThemeMode) {
    Haptics.selectionAsync();
    await setThemeMode(mode);
  }

  function handleLogout() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowSignOutModal(true);
  }

  async function confirmSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await signOut();
    } catch {
      // ignore — local state already cleared
    }
    setShowSignOutModal(false);
    setSigningOut(false);
    // Explicit navigation as safety net — AuthGate also handles this
    router.replace("/(auth)/login");
  }

  function handleDeleteAccount() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/delete-account");
  }

  return (
    <ThemedBackground>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Theme Section */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>APPEARANCE</Text>
        <GlassCard style={styles.card} padding={0}>
          {THEME_OPTIONS.map((opt, i) => {
            const selected = themeMode === opt.mode;
            return (
              <TouchableOpacity
                key={opt.mode}
                style={[
                  styles.themeRow,
                  i < THEME_OPTIONS.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => handleThemeSelect(opt.mode)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.themeIconWrap,
                    {
                      backgroundColor: selected
                        ? colors.primary + "22"
                        : colors.secondary,
                    },
                  ]}
                >
                  <Feather
                    name={opt.icon as any}
                    size={18}
                    color={selected ? colors.primary : colors.mutedForeground}
                  />
                </View>
                <View style={styles.themeInfo}>
                  <Text
                    style={[
                      styles.themeLabel,
                      { color: selected ? colors.primary : colors.foreground },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text style={[styles.themeDesc, { color: colors.mutedForeground }]}>
                    {opt.desc}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  {selected && (
                    <View
                      style={[styles.radioInner, { backgroundColor: colors.primary }]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </GlassCard>

        {/* Account Section */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACCOUNT</Text>
        <GlassCard style={styles.card} padding={0}>
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
            onPress={() => router.push("/edit-profile")}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: colors.primary + "22" }]}>
              <Feather name="edit-2" size={17} color={colors.primary} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>Edit Profile</Text>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
            onPress={() => router.push("/change-password")}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: "#F59E0B22" }]}>
              <Feather name="lock" size={17} color="#F59E0B" />
            </View>
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>Change Password</Text>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: colors.destructive + "22" }]}>
              <Feather name="log-out" size={17} color={colors.destructive} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.destructive }]}>Sign Out</Text>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: "#EF444422" }]}>
              <Feather name="trash-2" size={17} color="#EF4444" />
            </View>
            <Text style={[styles.menuLabel, { color: "#EF4444" }]}>Delete Account</Text>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </GlassCard>

        {/* App Info */}
        <Text style={[styles.versionText, { color: colors.mutedForeground }]}>
          QR Profile Share · Version 1.0.0
        </Text>
      </ScrollView>

      <ConfirmModal
        visible={showSignOutModal}
        onClose={() => !signingOut && setShowSignOutModal(false)}
        onConfirm={confirmSignOut}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        iconName="log-out"
        loading={signingOut}
      />
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 12 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginTop: 12,
    marginLeft: 4,
  },
  card: { overflow: "hidden" },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  themeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  themeInfo: { flex: 1 },
  themeLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  themeDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  versionText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 20,
  },
});
