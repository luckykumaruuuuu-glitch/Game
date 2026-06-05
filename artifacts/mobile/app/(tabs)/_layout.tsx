import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { usePresence } from "@/hooks/usePresence";
import { useNotifications } from "@/context/NotificationContext";

function PresenceManager() {
  usePresence();
  return null;
}

function RedDot() {
  return (
    <View
      style={{
        position: "absolute",
        top: -3,
        right: -5,
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: "#EF4444",
        borderWidth: 1.5,
        borderColor: "white",
      }}
    />
  );
}

function BadgeIcon({
  children,
  hasBadge,
}: {
  children: React.ReactNode;
  hasBadge: boolean;
}) {
  return (
    <View style={{ position: "relative" }}>
      {children}
      {hasBadge && <RedDot />}
    </View>
  );
}

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search">
        <Icon sf={{ default: "magnifyingglass", selected: "magnifyingglass" }} />
        <Label>Search</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="ludo">
        <Icon sf={{ default: "die.face.6", selected: "die.face.6.fill" }} />
        <Label>Ludo</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="scan">
        <Icon sf={{ default: "camera.viewfinder", selected: "camera.viewfinder" }} />
        <Label>Scan</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const { friendCount, messageCount, gameCount, totalCount } = useNotifications();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: isWeb ? 1 : StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={80}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: colors.background,
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: colors.border,
                },
              ]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <BadgeIcon hasBadge={messageCount > 0}>
              {isIOS ? (
                <SymbolView name="house" tintColor={color} size={24} />
              ) : (
                <Feather name="home" size={22} color={color} />
              )}
            </BadgeIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <BadgeIcon hasBadge={friendCount > 0}>
              {isIOS ? (
                <SymbolView name="magnifyingglass" tintColor={color} size={24} />
              ) : (
                <Feather name="search" size={22} color={color} />
              )}
            </BadgeIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="ludo"
        options={{
          title: "Ludo",
          tabBarIcon: ({ color }) => (
            <BadgeIcon hasBadge={gameCount > 0}>
              <MaterialCommunityIcons name="dice-6" size={26} color={color} />
            </BadgeIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="camera.viewfinder" tintColor={color} size={24} />
            ) : (
              <Feather name="camera" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <BadgeIcon hasBadge={totalCount > 0 && friendCount === 0 && messageCount === 0 && gameCount === 0}>
              {isIOS ? (
                <SymbolView name="person" tintColor={color} size={24} />
              ) : (
                <Feather name="user" size={22} color={color} />
              )}
            </BadgeIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="qr"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <>
      <PresenceManager />
      {isLiquidGlassAvailable() ? <NativeTabLayout /> : <ClassicTabLayout />}
    </>
  );
}
