import { BlurView } from "expo-blur";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { ChatMessage } from "@/lib/firestore";

interface ChatActionMenuProps {
  visible: boolean;
  message: ChatMessage | null;
  isMyMessage: boolean;
  onClose: () => void;
  onCopy: () => void;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
  onSelectMode: () => void;
}

interface ActionRowProps {
  icon: string;
  label: string;
  color?: string;
  onPress: () => void;
  isLast?: boolean;
}

function ActionRow({ icon, label, color, onPress, isLast }: ActionRowProps) {
  const colors = useColors();
  const rowColor = color ?? colors.foreground;
  return (
    <TouchableOpacity
      style={[
        styles.row,
        { borderBottomColor: colors.border },
        isLast && { borderBottomWidth: 0 },
      ]}
      onPress={onPress}
      activeOpacity={0.65}
    >
      <Feather name={icon as any} size={19} color={rowColor} />
      <Text style={[styles.rowLabel, { color: rowColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function ChatActionMenu({
  visible,
  message,
  isMyMessage,
  onClose,
  onCopy,
  onDeleteForMe,
  onDeleteForEveryone,
  onSelectMode,
}: ChatActionMenuProps) {
  const colors = useColors();
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(300)).current;
  const [mounted, setMounted] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      overlayOpacity.setValue(0);
      slideY.setValue(260);
      setMounted(true);
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideY, {
          toValue: 0,
          damping: 22,
          stiffness: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 190,
          useNativeDriver: true,
        }),
        Animated.timing(slideY, {
          toValue: 260,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible]);

  if (!mounted) return null;

  const preview = message?.text
    ? message.text.length > 80
      ? message.text.slice(0, 77) + "…"
      : message.text
    : "";

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: overlayOpacity }]}
        pointerEvents="none"
      >
        {Platform.OS !== "web" ? (
          <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
        ) : null}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.48)" }]} />
      </Animated.View>

      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: colors.card, transform: [{ translateY: slideY }] },
        ]}
        pointerEvents="box-none"
      >
        <Pressable onPress={() => {}}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Preview */}
          {preview ? (
            <View style={[styles.preview, { borderBottomColor: colors.border }]}>
              <Text
                style={[styles.previewText, { color: colors.mutedForeground }]}
                numberOfLines={2}
              >
                {preview}
              </Text>
            </View>
          ) : null}

          {/* Actions */}
          <ActionRow
            icon="copy"
            label="Copy Message"
            onPress={onCopy}
          />
          <ActionRow
            icon="check-square"
            label="Select Messages"
            onPress={onSelectMode}
          />
          <ActionRow
            icon="trash-2"
            label="Delete For Me"
            color="#EF4444"
            onPress={onDeleteForMe}
          />
          {isMyMessage && !message?.deletedForEveryone && (
            <ActionRow
              icon="alert-octagon"
              label="Delete For Everyone"
              color="#EF4444"
              onPress={onDeleteForEveryone}
            />
          )}
          <ActionRow
            icon="x"
            label="Cancel"
            onPress={onClose}
            isLast
          />
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  preview: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 15,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
});
