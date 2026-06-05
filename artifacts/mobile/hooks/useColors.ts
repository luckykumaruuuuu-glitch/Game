import { useTheme } from "@/context/ThemeContext";
import colors from "@/constants/colors";

/**
 * Returns the design tokens for the current resolved theme (dark or light).
 * Theme is driven by ThemeContext which supports System / Dark / Light modes,
 * persisted in AsyncStorage so the user's preference survives restarts.
 */
export function useColors() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const palette = isDark ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius, isDark };
}
