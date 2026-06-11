import { LinearGradient } from "expo-linear-gradient";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Easing,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VersionConfig } from "@/lib/updateChecker";

type DownloadState =
  | { phase: "idle" }
  | { phase: "downloading"; progress: number }
  | { phase: "installing" }
  | { phase: "error"; message: string };

interface Props {
  versionConfig: VersionConfig | null;
  installedVersion: string;
}

export function ForceUpdateScreen({ versionConfig, installedVersion }: Props) {
  const insets = useSafeAreaInsets();
  const [dl, setDl] = useState<DownloadState>({ phase: "idle" });

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // ── Block Android hardware back button — no escape ──────────────────────────
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  // ── Entry animation ─────────────────────────────────────────────────────────
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    shimmerLoop.start();
    return () => shimmerLoop.stop();
  }, []);

  // ── Pulse on idle ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (dl.phase !== "idle") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [dl.phase]);

  // ── Progress bar animation ──────────────────────────────────────────────────
  useEffect(() => {
    if (dl.phase === "downloading") {
      Animated.timing(progressAnim, { toValue: dl.progress, duration: 200, useNativeDriver: false }).start();
    }
  }, [dl]);

  // ── APK download & install ──────────────────────────────────────────────────
  async function handleUpdate() {
    if (!versionConfig) return;
    if (dl.phase === "downloading" || dl.phase === "installing") return;

    if (Platform.OS !== "android") {
      setDl({ phase: "error", message: "APK updates are only supported on Android devices." });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setDl({ phase: "downloading", progress: 0 });

    const localUri = FileSystem.cacheDirectory + "leludo_update.apk";
    try { await FileSystem.deleteAsync(localUri, { idempotent: true }); } catch { /* ignore */ }

    const downloadResumable = FileSystem.createDownloadResumable(
      versionConfig.apkDownloadUrl,
      localUri,
      {},
      (dp) => {
        const pct = dp.totalBytesExpectedToWrite > 0
          ? dp.totalBytesWritten / dp.totalBytesExpectedToWrite
          : 0;
        setDl({ phase: "downloading", progress: pct });
      }
    );

    try {
      const result = await downloadResumable.downloadAsync();
      if (!result?.uri) throw new Error("Download returned no URI");

      setDl({ phase: "installing" });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await new Promise((r) => setTimeout(r, 400));

      const contentUri = await FileSystem.getContentUriAsync(result.uri);
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: contentUri,
        flags: 1,
        type: "application/vnd.android.package-archive",
      });
    } catch (err: any) {
      const msg = err?.message?.includes("Network")
        ? "No internet connection. Please check your network and try again."
        : err?.message?.includes("URI")
        ? "Could not launch installer. Please allow installs from unknown sources in Settings."
        : "Download failed. Please check your internet connection and try again.";
      setDl({ phase: "error", message: msg });
    }
  }

  const progressPercent = dl.phase === "downloading" ? Math.round(dl.progress * 100) : 0;
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  const shimmerOpacity = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  // ── Force update UI ─────────────────────────────────────────────────────────
  return (
    <View
      style={styles.root}
      pointerEvents="box-only"
    >
      <LinearGradient colors={["#040408", "#0D0618", "#110820", "#040408"]} locations={[0, 0.3, 0.7, 1]} style={StyleSheet.absoluteFill} />
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />
      <View style={[styles.orb, styles.orb3]} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        scrollEnabled
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Badge */}
          <View style={styles.badgeWrap}>
            <LinearGradient colors={["#7C3AED", "#06B6D4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.badge}>
              <Text style={styles.badgeText}>UPDATE REQUIRED</Text>
            </LinearGradient>
          </View>

          {/* Logo */}
          <Animated.View style={[styles.logoWrap, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient colors={["rgba(124,58,237,0.3)", "rgba(6,182,212,0.15)"]} style={styles.logoGlow} />
            <View style={styles.logoContainer}>
              <Image source={require("@/assets/images/icon.png")} style={styles.logo} resizeMode="contain" />
            </View>
          </Animated.View>

          <Text style={styles.title}>LeLudo</Text>
          <Text style={styles.subtitle}>A new version is available</Text>

          {/* Version card */}
          <View style={styles.card}>
            <LinearGradient colors={["rgba(124,58,237,0.12)", "rgba(6,182,212,0.06)"]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            <View style={styles.versionRow}>
              <View style={styles.versionBlock}>
                <Text style={styles.versionLabel}>INSTALLED</Text>
                <Text style={styles.versionNumber}>{installedVersion}</Text>
              </View>
              <LinearGradient colors={["#7C3AED", "#06B6D4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.versionDivider} />
              <View style={styles.versionBlock}>
                <Text style={[styles.versionLabel, { color: "#06B6D4" }]}>LATEST</Text>
                <Text style={[styles.versionNumber, { color: "#06B6D4" }]}>
                  {versionConfig?.latestVersion ?? "—"}
                </Text>
              </View>
            </View>
          </View>

          {/* Update notes */}
          {!!versionConfig?.updateMessage && (
            <View style={styles.notesCard}>
              <LinearGradient colors={["rgba(255,255,255,0.04)", "rgba(255,255,255,0.02)"]} style={StyleSheet.absoluteFill} />
              <View style={styles.notesHeader}>
                <View style={styles.notesDot} />
                <Text style={styles.notesTitle}>WHAT'S NEW</Text>
              </View>
              <Text style={styles.notesText}>{versionConfig.updateMessage}</Text>
            </View>
          )}

          {/* Error */}
          {dl.phase === "error" && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{dl.message}</Text>
            </View>
          )}

          {/* Download progress */}
          {dl.phase === "downloading" && (
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
                  <LinearGradient colors={["#7C3AED", "#06B6D4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
                </Animated.View>
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>Downloading update…</Text>
                <Text style={styles.progressPercent}>{progressPercent}%</Text>
              </View>
            </View>
          )}

          {dl.phase === "installing" && (
            <View style={styles.installingWrap}>
              <ActivityIndicator size="small" color="#06B6D4" />
              <Text style={styles.installingText}>Launching installer…</Text>
            </View>
          )}

          {/* CTA */}
          {dl.phase !== "installing" && (
            <Animated.View style={{ transform: [{ scale: dl.phase === "idle" ? pulseAnim : 1 }] }}>
              <TouchableOpacity onPress={handleUpdate} disabled={dl.phase === "downloading"} activeOpacity={0.85} style={styles.btnWrap}>
                <Animated.View style={{ opacity: dl.phase === "idle" ? shimmerOpacity : 1 }}>
                  <LinearGradient
                    colors={dl.phase === "downloading" ? ["#4B5563", "#374151"] : ["#7C3AED", "#5B21B6", "#06B6D4"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btn}
                  >
                    {dl.phase === "downloading"
                      ? <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
                      : <Text style={styles.btnText}>{dl.phase === "error" ? "TRY AGAIN" : "UPDATE NOW"}</Text>
                    }
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          )}

          <Text style={styles.footerNote}>You must update to continue playing LeLudo</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    elevation: 99999,
    backgroundColor: "#040408",
  },
  scroll: { flexGrow: 1, alignItems: "center" },
  content: { width: "100%", maxWidth: 420, alignItems: "center", paddingHorizontal: 24 },
  orb: { position: "absolute", borderRadius: 999 },
  orb1: { width: 280, height: 280, backgroundColor: "rgba(124,58,237,0.15)", top: -80, left: -80 },
  orb2: { width: 220, height: 220, backgroundColor: "rgba(6,182,212,0.1)", top: 120, right: -60 },
  orb3: { width: 180, height: 180, backgroundColor: "rgba(124,58,237,0.08)", bottom: 100, left: 40 },

  // Offline locked
  offlineWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, paddingVertical: 60 },
  offlineIconWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1.5, borderColor: "rgba(239,68,68,0.3)",
    alignItems: "center", justifyContent: "center", marginBottom: 24,
  },
  offlineIcon: { fontSize: 44 },
  offlineTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginBottom: 12, textAlign: "center" },
  offlineSubtitle: { fontSize: 15, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)", textAlign: "center", lineHeight: 24, marginBottom: 28 },
  offlineCard: {
    width: "100%", borderRadius: 16, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(239,68,68,0.25)",
    padding: 18, marginBottom: 28,
  },
  offlineCardText: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#FCA5A5", textAlign: "center", lineHeight: 22 },

  // Update
  badgeWrap: { marginBottom: 24, marginTop: 8 },
  badge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999 },
  badgeText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  logoWrap: { marginBottom: 20, alignItems: "center", justifyContent: "center" },
  logoGlow: { position: "absolute", width: 140, height: 140, borderRadius: 70 },
  logoContainer: {
    width: 100, height: 100, borderRadius: 28, overflow: "hidden",
    borderWidth: 1.5, borderColor: "rgba(124,58,237,0.5)",
    shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 20, elevation: 16,
  },
  logo: { width: 100, height: 100 },
  title: { fontSize: 36, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: -0.5 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 6, marginBottom: 28 },
  card: { width: "100%", borderRadius: 20, borderWidth: 1, borderColor: "rgba(124,58,237,0.3)", overflow: "hidden", marginBottom: 16, padding: 20 },
  versionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  versionBlock: { alignItems: "center", flex: 1 },
  versionLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, marginBottom: 6 },
  versionNumber: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  versionDivider: { width: 2, height: 40, borderRadius: 1, marginHorizontal: 8 },
  notesCard: { width: "100%", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 24, padding: 16 },
  notesHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
  notesDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#7C3AED" },
  notesTitle: { fontSize: 10, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.4)", letterSpacing: 1.5 },
  notesText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)", lineHeight: 22 },
  errorCard: { width: "100%", backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", borderRadius: 12, padding: 14, marginBottom: 16, alignItems: "center" },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#FCA5A5", textAlign: "center", lineHeight: 20 },
  progressWrap: { width: "100%", marginBottom: 20, gap: 10 },
  progressTrack: { width: "100%", height: 8, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4, overflow: "hidden" },
  progressInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)" },
  progressPercent: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#7C3AED" },
  installingWrap: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20, backgroundColor: "rgba(6,182,212,0.08)", borderRadius: 12, paddingHorizontal: 20, paddingVertical: 14, width: "100%", justifyContent: "center" },
  installingText: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#06B6D4" },
  btnWrap: { width: "100%", marginBottom: 20 },
  btn: { width: "100%", paddingVertical: 18, borderRadius: 16, alignItems: "center", justifyContent: "center", shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 12 },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: 2 },
  footerNote: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.25)", textAlign: "center", lineHeight: 18, paddingHorizontal: 20 },
});
