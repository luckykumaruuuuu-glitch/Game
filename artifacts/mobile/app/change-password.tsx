import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedBackground } from "@/components/ThemedBackground";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function ChangePasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, sendPasswordReset } = useAuth();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendReset() {
    if (!user?.email) return;
    setLoading(true);
    setError("");
    try {
      await sendPasswordReset(user.email);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSent(true);
    } catch {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedBackground>
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Change Password</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="lock" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.heading, { color: colors.foreground }]}>Reset your password</Text>
          <Text style={[styles.desc, { color: colors.mutedForeground }]}>
            We'll send a password reset link to your registered email address:
          </Text>
          <View style={[styles.emailBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="mail" size={16} color={colors.mutedForeground} />
            <Text style={[styles.emailText, { color: colors.foreground }]}>{user?.email}</Text>
          </View>

          {error ? (
            <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
          ) : null}

          {sent ? (
            <View style={[styles.successBox, { backgroundColor: "#10B98122", borderColor: "#10B98144" }]}>
              <Feather name="check-circle" size={20} color="#10B981" />
              <Text style={[styles.successText, { color: "#10B981" }]}>
                Reset link sent! Check your email inbox.
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleSendReset}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Send Reset Email</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 40,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  content: { alignItems: "center", gap: 16 },
  iconWrap: {
    width: 72, height: 72, borderRadius: 24,
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  heading: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  desc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  emailBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 12, borderWidth: StyleSheet.hairlineWidth,
    width: "100%",
  },
  emailText: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },
  error: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  successBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 14, borderRadius: 12, borderWidth: 1, width: "100%",
  },
  successText: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },
  btn: {
    width: "100%", paddingVertical: 16,
    borderRadius: 14, alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
