import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedBackground } from "@/components/ThemedBackground";
import { GlassCard } from "@/components/GlassCard";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const DANGER_RED = "#EF4444";
const DANGER_RED_BG = "#EF444418";
const DANGER_RED_BORDER = "#EF444440";

export default function DeleteAccountScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { deleteAccount, profile } = useAuth();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }
    setError("");
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await deleteAccount(password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // AuthGate in _layout.tsx detects user=null and navigates to login automatically
      // No manual router.replace here — that would conflict with AuthGate
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (
        e?.code === "auth/wrong-password" ||
        e?.code === "auth/invalid-credential"
      ) {
        setError("Incorrect password. Please try again.");
      } else if (e?.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError("Failed to delete account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedBackground>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
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
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Delete Account</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Warning Banner */}
        <View style={[styles.warningBanner, { backgroundColor: DANGER_RED_BG, borderColor: DANGER_RED_BORDER }]}>
          <Feather name="alert-triangle" size={22} color={DANGER_RED} />
          <View style={styles.warningTextWrap}>
            <Text style={[styles.warningTitle, { color: DANGER_RED }]}>Permanent Action</Text>
            <Text style={[styles.warningBody, { color: DANGER_RED + "CC" }]}>
              This cannot be undone. Your account and all data will be permanently removed.
            </Text>
          </View>
        </View>

        {/* What gets deleted */}
        <GlassCard style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>What will be deleted</Text>
          {[
            { icon: "user", label: "Your profile and username" },
            { icon: "image", label: "All uploaded photos and content" },
            { icon: "users", label: "All friend connections" },
            { icon: "message-circle", label: "All chat history" },
            { icon: "bell", label: "All notifications" },
            { icon: "grid", label: "All game history and invitations" },
          ].map((item, i) => (
            <View key={i} style={styles.deleteItem}>
              <View style={[styles.deleteIcon, { backgroundColor: DANGER_RED_BG }]}>
                <Feather name={item.icon as any} size={14} color={DANGER_RED} />
              </View>
              <Text style={[styles.deleteLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
            </View>
          ))}
        </GlassCard>

        {/* Account info */}
        {profile && (
          <GlassCard style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Deleting account</Text>
            <View style={styles.accountRow}>
              <View style={[styles.accountIcon, { backgroundColor: colors.primary + "22" }]}>
                <Feather name="at-sign" size={16} color={colors.primary} />
              </View>
              <Text style={[styles.accountName, { color: colors.foreground }]}>
                @{profile.username}
              </Text>
            </View>
          </GlassCard>
        )}

        {/* Password verification */}
        <GlassCard style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Verify your identity</Text>
          <Text style={[styles.verifyDesc, { color: colors.mutedForeground }]}>
            Enter your current password to confirm deletion.
          </Text>

          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: colors.secondary,
                borderColor: error ? DANGER_RED : colors.border,
              },
            ]}
          >
            <Feather name="lock" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Current password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={(v) => { setPassword(v); setError(""); }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPassword((s) => !s)} style={styles.eyeBtn}>
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={16}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorWrap}>
              <Feather name="alert-circle" size={13} color={DANGER_RED} />
              <Text style={[styles.errorText, { color: DANGER_RED }]}>{error}</Text>
            </View>
          ) : null}
        </GlassCard>

        {/* Delete button */}
        <TouchableOpacity
          style={[
            styles.deleteBtn,
            { backgroundColor: DANGER_RED, opacity: loading || !password.trim() ? 0.6 : 1 },
          ]}
          onPress={handleDelete}
          disabled={loading || !password.trim()}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="trash-2" size={18} color="#fff" />
              <Text style={styles.deleteBtnText}>Verify & Delete Account</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelBtnText, { color: colors.foreground }]}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
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
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  warningTextWrap: { flex: 1 },
  warningTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 4 },
  warningBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  card: { gap: 12 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  deleteItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  deleteIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteLabel: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  accountRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  accountIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  accountName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  verifyDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18, marginTop: -4 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    height: 50,
    marginTop: 4,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  eyeBtn: { padding: 4 },
  errorWrap: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: -4 },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 4,
  },
  deleteBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cancelBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
