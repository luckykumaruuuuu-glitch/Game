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
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          damping: 18,
          stiffness: 280,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 180,
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.wrapper}
        pointerEvents="box-none"
      >
        {/* Blurred + darkened overlay */}
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: overlayOpacity }]}
          pointerEvents="none"
        >
          {Platform.OS !== "web" ? (
            <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
          ) : null}
          <View style={[StyleSheet.absoluteFill, styles.dimOverlay]} />
        </Animated.View>

        {/* Tap outside → close */}
        {onClose ? (
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        ) : (
          <View style={StyleSheet.absoluteFill} />
        )}

        {/* Modal card */}
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          {/* Inner Pressable stops tap propagation to the overlay */}
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
  dimOverlay: {
    backgroundColor: "rgba(0,0,0,0.52)",
  },
  cardWrapper: {
    width: "100%",
    maxWidth: 420,
    zIndex: 10,
  },
});
