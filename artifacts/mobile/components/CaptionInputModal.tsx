import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { useColors } from "@/hooks/useColors";

interface CaptionInputModalProps {
  visible: boolean;
  imageUri: string | null;
  uploading: boolean;
  onPost: (caption: string) => void;
  onCancel: () => void;
}

export function CaptionInputModal({
  visible,
  imageUri,
  uploading,
  onPost,
  onCancel,
}: CaptionInputModalProps) {
  const colors = useColors();
  const [caption, setCaption] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setCaption("");
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [visible]);

  function handlePost() {
    Keyboard.dismiss();
    onPost(caption.trim());
  }

  function handleCancel() {
    Keyboard.dismiss();
    setCaption("");
    onCancel();
  }

  if (!imageUri) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={Keyboard.dismiss} />

        {Platform.OS !== "android" && (
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        <View style={[StyleSheet.absoluteFill, styles.backdrop]} />

        <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Handle bar */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} disabled={uploading} activeOpacity={0.7}>
              <Text style={[styles.cancelText, { color: colors.mutedForeground, opacity: uploading ? 0.4 : 1 }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.foreground }]}>New Post</Text>
            <TouchableOpacity
              onPress={handlePost}
              disabled={uploading}
              activeOpacity={0.7}
              style={[styles.postBtn, { backgroundColor: colors.primary, opacity: uploading ? 0.7 : 1 }]}
            >
              {uploading ? (
                <ActivityIndicator size={14} color="#fff" />
              ) : (
                <Text style={styles.postBtnText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Image preview + Caption row */}
          <View style={styles.contentRow}>
            <View style={[styles.thumbWrapper, { borderColor: colors.border }]}>
              <Image
                source={{ uri: imageUri }}
                style={styles.thumb}
                contentFit="cover"
              />
            </View>
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Write something about this photo..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              maxLength={300}
              value={caption}
              onChangeText={setCaption}
              editable={!uploading}
              returnKeyType="default"
            />
          </View>

          {/* Character count */}
          <View style={styles.footer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.footerRow}>
              <Feather name="image" size={14} color={colors.mutedForeground} />
              <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
                {caption.length}/300
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingBottom: Platform.OS === "ios" ? 36 : 20,
    paddingHorizontal: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  postBtn: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    minWidth: 60,
    alignItems: "center",
  },
  postBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingVertical: 8,
    minHeight: 90,
  },
  thumbWrapper: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    minHeight: 72,
    textAlignVertical: "top",
    paddingTop: 0,
  },
  footer: {
    marginTop: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  charCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
