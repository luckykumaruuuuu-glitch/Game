import { BlurView } from "expo-blur";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

interface AppModalProps {
  visible: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

export function AppModal({ visible, onClose, children }: AppModalProps) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.88)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      overlayOpacity.setValue(0);
      cardScale.setValue(0.88);
      cardOpacity.setValue(0);
      setMounted(true);

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 230,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          damping: 18,
          stiffness: 260,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 190,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 0.92,
          duration: 170,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* ── Overlay ──────────────────────────────────────────────────────────
          Strategy:
          - Solid dark layer works on BOTH Android & iOS (0.84 opacity)
          - BlurView stacked on top for iOS only (blur effect bonus)
          - On Android, BlurView inside transparent Modal blurs nothing
            so we skip it and rely solely on the strong dark overlay.
      ──────────────────────────────────────────────────────────────────── */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: overlayOpacity }]}
        pointerEvents="none"
      >
        {/* Solid dark — base layer. Android uses higher opacity to
            compensate for missing blur layer; iOS/web get blur on top. */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor:
                Platform.OS === "android"
                  ? "rgba(0,0,0,0.92)"
                  : "rgba(0,0,0,0.84)",
            },
          ]}
        />

        {/* Blur layer — iOS & web only (Android transparent Modal can't blur) */}
        {Platform.OS !== "android" && (
          <BlurView
            intensity={90}
            tint="dark"
            style={[StyleSheet.absoluteFill, styles.blurLayer]}
          />
        )}
      </Animated.View>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.wrapper}
        pointerEvents="box-none"
      >
        {/* Tap outside to close + block all background touches */}
        {onClose ? (
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        ) : (
          <View style={StyleSheet.absoluteFill} />
        )}

        {/* Modal card — scale + fade spring */}
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          <Pressable onPress={() => {}}>{children}</Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  blurLayer: {
    opacity: 0.85,
  },
  cardWrapper: {
    width: "100%",
    maxWidth: 420,
    zIndex: 10,
  },
});
