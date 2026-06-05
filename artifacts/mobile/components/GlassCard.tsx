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
          styles.simpleCard,
          { backgroundColor: colors.card, borderColor: colors.border, padding },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderColor: colors.border, padding }, style]}>
      <BlurView
        intensity={intensity}
        tint={colors.isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.overlay,
          {
            backgroundColor: colors.isDark
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.02)",
          },
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  overlay: {
    borderRadius: 20,
  },
  simpleCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
