import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppModal } from "./AppModal";
import { useColors } from "@/hooks/useColors";

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  iconName?: React.ComponentProps<typeof Feather>["name"];
  iconColor?: string;
  iconBg?: string;
  loading?: boolean;
}

export function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor,
  iconName,
  iconColor,
  iconBg,
  loading = false,
}: ConfirmModalProps) {
  const colors = useColors();
  const btnColor = confirmColor ?? colors.destructive;

  return (
    <AppModal visible={visible} onClose={loading ? undefined : onClose}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {iconName && (
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: iconBg ?? btnColor + "22" },
            ]}
          >
            <Feather name={iconName} size={28} color={iconColor ?? btnColor} />
          </View>
        )}

        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.message, { color: colors.mutedForeground }]}>
          {message}
        </Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[
              styles.btn,
              {
                backgroundColor: colors.secondary,
                borderColor: colors.border,
                opacity: loading ? 0.5 : 1,
              },
            ]}
            onPress={onClose}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={[styles.btnText, { color: colors.foreground }]}>
              {cancelLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btn,
              {
                backgroundColor: btnColor,
                borderColor: "transparent",
                opacity: loading ? 0.75 : 1,
              },
            ]}
            onPress={onConfirm}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[styles.btnText, { color: "#fff" }]}>
                {confirmLabel}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 28,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 4,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 4,
  },
  btn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
