import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

interface ThemedBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ThemedBackground({ children, style }: ThemedBackgroundProps) {
  const { resolvedTheme } = useTheme();
  const colors = useColors();

  if (resolvedTheme === "light") {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }, style]}>
        {children}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#080808", "#0F0320", "#080808"]}
      style={[styles.fill, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
