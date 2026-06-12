import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedBackground } from "@/components/ThemedBackground";
import { useAuth } from "@/context/AuthContext";
import { checkEmailAvailable } from "@/lib/firestore";
import { useColors } from "@/hooks/useColors";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sendPasswordReset } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSendReset() {
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const isAvailable = await checkEmailAvailable(trimmed);
      if (isAvailable) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError("This Gmail is not registered. Please check the address or sign up.");
        return;
      }

      await sendPasswordReset(trimmed);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSent(true);
      setError("");
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const code = e?.code ?? "";
      if (code === "auth/network-request-failed") {
        setError("No internet connection. Please check your network and try again.");
      } else if (code === "auth/invalid-email") {
        setError("Invalid email address. Please check and try again.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many requests. Please wait a moment and try again.");
      } else {
        setError(e?.message ?? "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity
            style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconBadge, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
              <Feather name="lock" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Reset Password
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Enter your registered Gmail address and we'll send you a reset link.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>

            {/* Error banner */}
            {error ? (
              <View style={[styles.banner, { backgroundColor: colors.destructive + "22", borderColor: colors.destructive + "44" }]}>
                <Feather name="alert-circle" size={14} color={colors.destructive} />
                <Text style={[styles.bannerText, { color: colors.destructive }]}>{error}</Text>
              </View>
            ) : null}

            {/* Success banner */}
            {sent ? (
              <View style={[styles.banner, { backgroundColor: "#10B98122", borderColor: "#10B98144" }]}>
                <Feather name="check-circle" size={14} color="#10B981" />
                <Text style={[styles.bannerText, { color: "#10B981" }]}>
                  Reset link sent! Check your inbox and follow the instructions to create a new password.
                  Your old password will no longer work after the reset.
                </Text>
              </View>
            ) : null}

            {/* Email input — hidden after success */}
            {!sent ? (
              <>
                <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.input }]}>
                  <Feather name="mail" size={18} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="Your registered email address"
                    placeholderTextColor={colors.mutedForeground}
                    value={email}
                    onChangeText={(v) => { setEmail(v); setError(""); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                  onPress={handleSendReset}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Send Reset Link</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => router.replace("/(auth)/login")}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Back to Sign In</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer link back to login */}
          {!sent ? (
            <TouchableOpacity
              style={styles.footer}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={14} color={colors.mutedForeground} />
              <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
                Back to Sign In
              </Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 24 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center", justifyContent: "center",
    marginBottom: 20,
  },
  header: { alignItems: "center", gap: 12, marginBottom: 32 },
  iconBadge: {
    width: 68, height: 68, borderRadius: 20, borderWidth: 1,
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", textAlign: "center" },
  subtitle: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    textAlign: "center", lineHeight: 20,
  },
  form: { gap: 12 },
  banner: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  bannerText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  inputWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 14,
    borderRadius: 14, borderWidth: 1,
  },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  button: { paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 4 },
  buttonText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  footer: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, marginTop: 32,
  },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
