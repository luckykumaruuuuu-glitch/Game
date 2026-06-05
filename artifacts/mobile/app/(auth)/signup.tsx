import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Link } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
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
import { checkUsernameAvailable } from "@/lib/firestore";
import { useColors } from "@/hooks/useColors";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export default function SignupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkUsername = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = value.toLowerCase().replace(/\s/g, "");
    if (!trimmed) { setUsernameStatus("idle"); return; }
    if (!USERNAME_REGEX.test(trimmed)) { setUsernameStatus("invalid"); return; }
    setUsernameStatus("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const available = await checkUsernameAvailable(trimmed);
        setUsernameStatus(available ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 600);
  }, []);

  function handleUsernameChange(val: string) {
    const cleaned = val.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(cleaned);
    checkUsername(cleaned);
  }

  async function handleSignup() {
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (!USERNAME_REGEX.test(username)) {
      setError("Username: 3–20 chars, letters/numbers/underscore only.");
      return;
    }
    if (usernameStatus === "taken") {
      setError("This username is already taken.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signUp(email.trim(), password, username.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // AuthGate handles navigation to /(tabs) automatically
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const code = e?.code ?? "";
      let msg = "";
      if (code === "username-taken") {
        msg = "This username was just taken. Please choose another.";
      } else if (code === "auth/email-already-in-use") {
        msg = "Could not create account with this email and username combination. Try a different username.";
      } else if (code === "auth/invalid-email") {
        msg = "Invalid email address.";
      } else if (code === "auth/weak-password") {
        msg = "Password is too weak. Use at least 6 characters.";
      } else if (code === "auth/network-request-failed") {
        msg = "No internet connection.";
      } else if (code === "permission-denied" || e?.message?.includes("permission")) {
        msg = "Database access denied. Check your Firestore rules.";
      } else {
        msg = e?.message ?? "Signup failed. Please try again.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function statusIcon() {
    if (usernameStatus === "checking") return <ActivityIndicator size="small" color={colors.mutedForeground} />;
    if (usernameStatus === "available") return <Feather name="check-circle" size={18} color="#10B981" />;
    if (usernameStatus === "taken") return <Feather name="x-circle" size={18} color={colors.destructive} />;
    if (usernameStatus === "invalid" && username.length > 0) return <Feather name="alert-circle" size={18} color="#F59E0B" />;
    return null;
  }

  function hintText() {
    if (usernameStatus === "available") return { text: "@" + username + " is available!", color: "#10B981" };
    if (usernameStatus === "taken") return { text: "@" + username + " is already taken.", color: colors.destructive };
    if (usernameStatus === "invalid" && username.length > 0) return { text: "3–20 chars: letters, numbers, underscore", color: "#F59E0B" };
    return null;
  }

  const hint = hintText();
  const usernameBorder =
    usernameStatus === "available" ? "#10B981" :
    usernameStatus === "taken" ? colors.destructive :
    usernameStatus === "invalid" ? "#F59E0B" : colors.border;

  return (
    <ThemedBackground>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={[styles.iconBadge, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
              <Feather name="grid" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Create account</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Choose a unique username for your QR profile
            </Text>
          </View>

          <View style={styles.form}>
            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.destructive + "22", borderColor: colors.destructive + "44" }]}>
                <Feather name="alert-circle" size={14} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
              </View>
            ) : null}

            {/* Username */}
            <View>
              <View style={[styles.inputWrap, { borderColor: usernameBorder, backgroundColor: colors.input }]}>
                <Text style={[styles.atSign, { color: colors.mutedForeground }]}>@</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="username"
                  placeholderTextColor={colors.mutedForeground}
                  value={username}
                  onChangeText={handleUsernameChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                />
                {statusIcon()}
              </View>
              {hint ? <Text style={[styles.hintText, { color: hint.color }]}>{hint.text}</Text> : null}
            </View>

            {/* Email */}
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.input }]}>
              <Feather name="mail" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Email address"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.input }]}>
              <Feather name="lock" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Password (min. 6 chars)"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View>
              <View style={[styles.inputWrap, {
                borderColor: confirmPassword && confirmPassword !== password
                  ? colors.destructive
                  : confirmPassword && confirmPassword === password
                  ? "#10B981" : colors.border,
                backgroundColor: colors.input,
              }]}>
                <Feather name="lock" size={18} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="Confirm password"
                  placeholderTextColor={colors.mutedForeground}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirm((v) => !v)}>
                  <Feather name={showConfirm ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
              {confirmPassword ? (
                <Text style={[styles.hintText, { color: confirmPassword === password ? "#10B981" : colors.destructive }]}>
                  {confirmPassword === password ? "✓ Passwords match" : "Passwords do not match"}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={[styles.footerLink, { color: colors.primary }]}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 24 },
  header: { alignItems: "center", gap: 12, marginBottom: 32 },
  iconBadge: {
    width: 68, height: 68, borderRadius: 20, borderWidth: 1,
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", textAlign: "center" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  form: { gap: 12 },
  errorBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  inputWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 14,
    borderRadius: 14, borderWidth: 1,
  },
  atSign: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  hintText: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 5, marginLeft: 4 },
  button: { paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 4 },
  buttonText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 28 },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
