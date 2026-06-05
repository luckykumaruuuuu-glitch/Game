import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface ProfileAvatarProps {
  uri?: string;
  size?: number;
  name?: string;
}

export function ProfileAvatar({ uri, size = 80, name }: ProfileAvatarProps) {
  const colors = useColors();
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : null;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primary + "33",
          borderColor: colors.primary + "66",
        },
      ]}
    >
      <Feather name="user" size={size * 0.45} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: "#222",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
