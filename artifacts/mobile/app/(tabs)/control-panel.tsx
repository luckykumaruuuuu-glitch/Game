import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Slot Definitions ────────────────────────────────────────────────────────

type SlotId = "crown" | "flame" | "thunder" | "diamond" | "dragon" | "shadow";

interface SlotConfig {
  id: SlotId;
  icon: string;
  emoji: string;
  title: string;
  subtitle: string;
  gradient: [string, string, string];
  glowColor: string;
  borderColor: string;
  accentColor: string;
  textColor: string;
  placeholder: string;
  feature: string;
}

const SLOTS: SlotConfig[] = [
  {
    id: "crown",
    icon: "award",
    emoji: "👑",
    title: "Crown Slot",
    subtitle: "Royal King · Luxury Power Mode",
    gradient: ["#1f1600", "#2a1d00", "#1a1000"],
    glowColor: "rgba(255,200,0,0.45)",
    borderColor: "#C89B00",
    accentColor: "#FFD700",
    textColor: "#FFE566",
    placeholder: "Set your royal command…",
    feature: "Dynasty Mode — Coming Soon",
  },
  {
    id: "flame",
    icon: "zap",
    emoji: "🔥",
    title: "Flame Slot",
    subtitle: "Fire Surge · Heat Wave Active",
    gradient: ["#1f0800", "#2a0d00", "#1a0500"],
    glowColor: "rgba(255,80,0,0.45)",
    borderColor: "#CC3300",
    accentColor: "#FF5500",
    textColor: "#FF8844",
    placeholder: "Ignite your strategy…",
    feature: "Blaze Rush — Coming Soon",
  },
  {
    id: "thunder",
    icon: "zap",
    emoji: "⚡",
    title: "Thunder Slot",
    subtitle: "Electric Storm · Voltage Surge",
    gradient: ["#00091f", "#000d2a", "#00061a"],
    glowColor: "rgba(0,180,255,0.45)",
    borderColor: "#0088CC",
    accentColor: "#00AAFF",
    textColor: "#44CCFF",
    placeholder: "Configure lightning strike…",
    feature: "Shock Wave — Coming Soon",
  },
  {
    id: "diamond",
    icon: "layers",
    emoji: "💎",
    title: "Diamond Slot",
    subtitle: "Crystal Glass · Prismatic Energy",
    gradient: ["#001a1a", "#002222", "#001414"],
    glowColor: "rgba(0,220,220,0.45)",
    borderColor: "#00AAAA",
    accentColor: "#00DDDD",
    textColor: "#66EEFF",
    placeholder: "Refract your power…",
    feature: "Prism Shield — Coming Soon",
  },
  {
    id: "dragon",
    icon: "shield",
    emoji: "🐉",
    title: "Dragon Slot",
    subtitle: "Ancient Beast · Mythical Force",
    gradient: ["#001a07", "#002210", "#001405"],
    glowColor: "rgba(0,200,60,0.45)",
    borderColor: "#007730",
    accentColor: "#00CC44",
    textColor: "#44EE77",
    placeholder: "Unleash dragon power…",
    feature: "Scale Armor — Coming Soon",
  },
  {
    id: "shadow",
    icon: "eye-off",
    emoji: "☠️",
    title: "Shadow Slot",
    subtitle: "Dark Phantom · Stealth Protocol",
    gradient: ["#0d0014", "#130022", "#0a000f"],
    glowColor: "rgba(140,0,255,0.45)",
    borderColor: "#6600BB",
    accentColor: "#9933FF",
    textColor: "#CC77FF",
    placeholder: "Configure shadow move…",
    feature: "Void Strike — Coming Soon",
  },
];

// ─── Slot Card ────────────────────────────────────────────────────────────────

function SlotCard({ slot }: { slot: SlotConfig }) {
  const [expanded, setExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [saved, setSaved] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const saveScaleAnim = useRef(new Animated.Value(1)).current;

  // Pulse glow on mount
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);

  function toggleExpand() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = expanded ? 0 : 1;
    Animated.spring(expandAnim, {
      toValue,
      useNativeDriver: false,
      tension: 70,
      friction: 10,
    }).start();
    setExpanded(!expanded);
  }

  function handleSave() {
    if (!inputValue.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.timing(saveScaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(saveScaleAnim, { toValue: 1, useNativeDriver: true, tension: 200 }),
    ]).start();
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  const panelHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });
  const panelOpacity = expandAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.cardWrapper}>
      {/* Outer glow layer */}
      <Animated.View
        style={[
          styles.outerGlow,
          { backgroundColor: slot.glowColor, opacity: pulseAnim },
        ]}
      />

      <LinearGradient
        colors={slot.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor: slot.borderColor }]}
      >
        {/* Corner accent top-right */}
        <View style={[styles.cornerAccentTR, { backgroundColor: slot.glowColor }]} />

        {/* ── Header row ── */}
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={toggleExpand}
          activeOpacity={0.85}
        >
          {/* Emoji + icon badge */}
          <View style={[styles.iconBadge, { backgroundColor: "rgba(0,0,0,0.5)", borderColor: slot.borderColor }]}>
            <Text style={styles.iconEmoji}>{slot.emoji}</Text>
          </View>

          <View style={styles.titleBlock}>
            <View style={styles.titleRow}>
              <Text style={[styles.slotTitle, { color: slot.accentColor }]}>{slot.title}</Text>
              {/* Status dot */}
              <View style={[styles.statusDot, { backgroundColor: slot.accentColor }]} />
            </View>
            <Text style={[styles.slotSubtitle, { color: slot.textColor + "99" }]}>{slot.subtitle}</Text>
          </View>

          {/* Expand chevron */}
          <Animated.View style={{
            transform: [{
              rotate: expandAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] })
            }]
          }}>
            <Feather name="chevron-down" size={20} color={slot.accentColor} />
          </Animated.View>
        </TouchableOpacity>

        {/* Thin neon divider */}
        <View style={[styles.neonDivider, { backgroundColor: slot.borderColor }]} />

        {/* ── Collapsed summary ── */}
        <View style={styles.collapsedRow}>
          <View style={[styles.featurePill, { borderColor: slot.borderColor + "88", backgroundColor: "rgba(0,0,0,0.4)" }]}>
            <MaterialCommunityIcons name="lightning-bolt" size={11} color={slot.accentColor} />
            <Text style={[styles.featurePillText, { color: slot.accentColor }]}>{slot.feature}</Text>
          </View>
          <TouchableOpacity
            style={[styles.activateBtn, { borderColor: slot.accentColor, backgroundColor: slot.accentColor + "22" }]}
            onPress={toggleExpand}
            activeOpacity={0.8}
          >
            <Text style={[styles.activateBtnText, { color: slot.accentColor }]}>
              {expanded ? "CLOSE" : "CONFIGURE"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Expandable panel ── */}
        <Animated.View style={[styles.expandPanel, { maxHeight: panelHeight, opacity: panelOpacity }]}>
          <View style={[styles.expandInner, { borderTopColor: slot.borderColor + "44" }]}>

            {/* Config label */}
            <View style={styles.configLabelRow}>
              <Feather name="settings" size={12} color={slot.accentColor} />
              <Text style={[styles.configLabel, { color: slot.accentColor }]}>CONFIGURATION</Text>
            </View>

            {/* Text input */}
            <View style={[styles.inputWrapper, { borderColor: slot.borderColor, backgroundColor: "rgba(0,0,0,0.55)" }]}>
              <TextInput
                style={[styles.textInput, { color: slot.textColor }]}
                placeholder={slot.placeholder}
                placeholderTextColor={slot.textColor + "55"}
                value={inputValue}
                onChangeText={setInputValue}
                multiline={false}
                returnKeyType="done"
                selectionColor={slot.accentColor}
              />
            </View>

            {/* Save button */}
            <Animated.View style={{ transform: [{ scale: saveScaleAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: saved ? "#16a34a" : slot.accentColor + "33",
                    borderColor: saved ? "#16a34a" : slot.accentColor,
                  }
                ]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Feather name={saved ? "check" : "save"} size={14} color={saved ? "#fff" : slot.accentColor} />
                <Text style={[styles.saveBtnText, { color: saved ? "#fff" : slot.accentColor }]}>
                  {saved ? "SAVED!" : "SAVE CONFIG"}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Feature placeholder */}
            <View style={[styles.featurePlaceholder, { borderColor: slot.borderColor + "55", backgroundColor: "rgba(0,0,0,0.35)" }]}>
              <MaterialCommunityIcons name="code-braces" size={16} color={slot.accentColor + "88"} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.placeholderTitle, { color: slot.textColor + "88" }]}>Feature Slot Reserved</Text>
                <Text style={[styles.placeholderDesc, { color: slot.textColor + "55" }]}>
                  Backend logic will be mapped here in a future update.
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ControlPanelScreen() {
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const headerGlowAnim = useRef(new Animated.Value(0.6)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(headerGlowAnim, { toValue: 1, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(headerGlowAnim, { toValue: 0.6, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.root}>
      {/* Global background scanlines effect */}
      <LinearGradient
        colors={["#080818", "#060612", "#0a0820"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 12, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Back nav ── */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Animated.View style={[styles.headerGlow, { opacity: headerGlowAnim }]} />
          <View style={styles.headerBadge}>
            <MaterialCommunityIcons name="shield-crown" size={18} color="#9933FF" />
            <Text style={styles.headerBadgeText}>SECRET PANEL</Text>
          </View>
          <Text style={styles.headerTitle}>Monster Control</Text>
          <Text style={styles.headerSubtitle}>
            Configure your power slots · 6 legendary abilities
          </Text>
          {/* Neon bar */}
          <LinearGradient
            colors={["transparent", "#7C3AED", "#00AAFF", "#7C3AED", "transparent"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.neonBar}
          />
        </View>

        {/* ── Slot Cards ── */}
        <View style={styles.slotList}>
          {SLOTS.map((slot) => (
            <SlotCard key={slot.id} slot={slot} />
          ))}
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <MaterialCommunityIcons name="lock" size={13} color="rgba(255,255,255,0.18)" />
          <Text style={styles.footerText}>Online Multiplayer · Secret Feature Panel v1.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#080818" },

  scroll: {
    paddingHorizontal: 16,
    gap: 0,
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  // ── Header ──
  header: {
    alignItems: "center",
    marginBottom: 28,
    position: "relative",
  },
  headerGlow: {
    position: "absolute",
    top: -10,
    width: 200,
    height: 80,
    borderRadius: 100,
    backgroundColor: "rgba(124,58,237,0.25)",
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(153,51,255,0.5)",
    backgroundColor: "rgba(153,51,255,0.12)",
    marginBottom: 12,
  },
  headerBadgeText: {
    color: "#9933FF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2.5,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 6,
    textShadowColor: "rgba(124,58,237,0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 18,
  },
  neonBar: {
    width: "80%",
    height: 2,
    borderRadius: 1,
  },

  // ── Slot List ──
  slotList: {
    gap: 14,
  },

  // ── Card ──
  cardWrapper: {
    position: "relative",
  },
  outerGlow: {
    position: "absolute",
    inset: -8,
    borderRadius: 28,
    ...(Platform.OS !== "web" ? {
      shadowColor: "#ffffff",
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 20,
    } : {}),
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    padding: 16,
    gap: 12,
  },
  cornerAccentTR: {
    position: "absolute",
    top: -24,
    right: -24,
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  // Header row
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: {
    fontSize: 26,
  },
  titleBlock: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  slotTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  slotSubtitle: {
    fontSize: 11,
    letterSpacing: 0.4,
    fontWeight: "500",
  },

  neonDivider: {
    height: 1,
    opacity: 0.4,
    borderRadius: 1,
  },

  // Collapsed row
  collapsedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
  },
  featurePillText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  activateBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  activateBtnText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  // Expand panel
  expandPanel: {
    overflow: "hidden",
  },
  expandInner: {
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  configLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  configLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  inputWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  textInput: {
    fontSize: 14,
    fontWeight: "500",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  featurePlaceholder: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  placeholderTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 3,
  },
  placeholderDesc: {
    fontSize: 11,
    lineHeight: 16,
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    color: "rgba(255,255,255,0.18)",
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
