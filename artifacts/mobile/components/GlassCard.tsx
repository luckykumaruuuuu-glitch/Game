import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  padding?: number;
}

export function GlassCard({ children, style, intensity = 25, padding = 16 }: GlassCardProps) {
  const colors = useColors();

  if (Platform.OS === "android" || Platform.OS === "web") {
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border, padding },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  // iOS: keep BlurView for native depth, but ground it with a solid
  // base layer so transparency matches the browser/Android appearance.
  return (
    <View style={[styles.card, { borderColor: colors.border, padding }, style]}>
      {/* Solid base — same colour as web/Android so the card is not see-through */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
      {/* BlurView at reduced opacity adds subtle iOS frosted-glass depth
          without making the card appear transparent */}
      <BlurView
        intensity={intensity}
        tint={colors.isDark ? "dark" : "light"}
        style={[StyleSheet.absoluteFill, styles.blurLayer]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  blurLayer: {
    opacity: 0.35,
  },
});
