import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LudoProvider } from "@/context/LudoContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync();
}

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const prevLoadingRef = useRef(loading);

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "(auth)";
    const inPublicProfile = segments[0] === "profile";
    if (!user && !inAuth && !inPublicProfile) {
      router.replace("/(auth)/login");
    } else if (user && inAuth) {
      router.replace("/(tabs)");
    }
    prevLoadingRef.current = loading;
  }, [user, loading, segments]);

  return <>{children}</>;
}

function RootLayoutNav() {
  const colors = useColors();
  const bg = colors.background;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationDuration: 250,
        contentStyle: { backgroundColor: bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ animation: "none", contentStyle: { backgroundColor: bg } }} />
      <Stack.Screen name="(auth)" options={{ animation: "fade", contentStyle: { backgroundColor: bg } }} />
      <Stack.Screen name="profile" options={{ animation: "fade", contentStyle: { backgroundColor: bg } }} />
      <Stack.Screen name="+not-found" options={{ contentStyle: { backgroundColor: bg } }} />
    </Stack>
  );
}

function ThemedGestureRoot({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      {children}
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [fontTimeout, setFontTimeout] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFontTimeout(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const fontsDone = fontsLoaded || !!fontError || fontTimeout;

  useEffect(() => {
    if (fontsDone) {
      if (Platform.OS !== "web") {
        SplashScreen.hideAsync();
      }
    }
  }, [fontsDone]);

  if (!fontsDone) {
    return (
      <View style={{ flex: 1, backgroundColor: "#09090B", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <SafeAreaProvider style={{ backgroundColor: "#09090B" }}>
      <ThemeProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <ThemedGestureRoot>
              <KeyboardProvider>
                <AuthProvider>
                  <LudoProvider>
                    <NotificationProvider>
                      <AuthGate>
                        <RootLayoutNav />
                      </AuthGate>
                    </NotificationProvider>
                  </LudoProvider>
                </AuthProvider>
              </KeyboardProvider>
            </ThemedGestureRoot>
          </QueryClientProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
