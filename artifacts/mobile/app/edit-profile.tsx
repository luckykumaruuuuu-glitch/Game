import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { useAuth } from "@/context/AuthContext";
import { addContent } from "@/lib/firestore";
import { uploadContentImage, uploadProfilePhoto } from "@/lib/storage";
import { updateUserProfile } from "@/lib/firestore";
import { useColors } from "@/hooks/useColors";

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, profile, refreshProfile } = useAuth();

  const [name, setName] = useState(profile?.name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [addingContent, setAddingContent] = useState(false);
  const [textNote, setTextNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  async function handleSaveProfile() {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { name: name.trim(), bio: bio.trim() });
      await refreshProfile();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePickPhoto() {
    if (!user) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploadingPhoto(true);
    try {
      const url = await uploadProfilePhoto(user.uid, result.assets[0].uri);
      await updateUserProfile(user.uid, { photo: url });
      await refreshProfile();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Error", "Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleAddImage() {
    if (!user) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setAddingContent(true);
    try {
      const url = await uploadContentImage(user.uid, result.assets[0].uri);
      await addContent(user.uid, "image", url);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Image added to your profile!");
    } catch {
      Alert.alert("Error", "Failed to upload image. Please try again.");
    } finally {
      setAddingContent(false);
    }
  }

  async function handleAddNote() {
    if (!user || !textNote.trim()) return;
    setAddingNote(true);
    try {
      await addContent(user.uid, "text", textNote.trim());
      setTextNote("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Note added to your profile!");
    } catch {
      Alert.alert("Error", "Failed to add note. Please try again.");
    } finally {
      setAddingNote(false);
    }
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <TouchableOpacity
            style={[styles.backCircle, { borderColor: colors.border }]}
            onPress={() => router.back()}
          >
            <Feather name="x" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Edit Profile</Text>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.avatarSection}>
          <View>
            <ProfileAvatar uri={profile?.photo} size={90} name={profile?.name} />
            {uploadingPhoto && (
              <View style={[StyleSheet.absoluteFill, styles.uploadingOverlay]}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.changePhotoBtn, { borderColor: colors.border }]}
            onPress={handlePickPhoto}
            disabled={uploadingPhoto}
          >
            <Feather name="camera" size={14} color={colors.primary} />
            <Text style={[styles.changePhotoText, { color: colors.primary }]}>
              {uploadingPhoto ? "Uploading..." : "Change Photo"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PROFILE INFO</Text>
          <View style={[styles.field, { borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.04)" }]}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Name</Text>
            <TextInput
              style={[styles.fieldInput, { color: colors.foreground }]}
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="words"
            />
          </View>
          <View style={[styles.field, { borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.04)" }]}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Bio</Text>
            <TextInput
              style={[styles.fieldInput, styles.bioInput, { color: colors.foreground }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people about yourself..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ADD CONTENT</Text>

          <TouchableOpacity
            style={[styles.contentBtn, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}
            onPress={handleAddImage}
            disabled={addingContent}
            activeOpacity={0.8}
          >
            {addingContent ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Feather name="image" size={20} color={colors.primary} />
            )}
            <Text style={[styles.contentBtnText, { color: colors.primary }]}>
              {addingContent ? "Uploading..." : "Add Image"}
            </Text>
          </TouchableOpacity>

          <View style={[styles.noteBox, { borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.04)" }]}>
            <TextInput
              style={[styles.noteInput, { color: colors.foreground }]}
              value={textNote}
              onChangeText={setTextNote}
              placeholder="Write a text note..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={[styles.noteSubmit, { backgroundColor: colors.primary, opacity: !textNote.trim() || addingNote ? 0.5 : 1 }]}
              onPress={handleAddNote}
              disabled={!textNote.trim() || addingNote}
              activeOpacity={0.8}
            >
              {addingNote ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Feather name="send" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
    minWidth: 70,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  avatarSection: { alignItems: "center", gap: 12, paddingVertical: 20 },
  uploadingOverlay: {
    borderRadius: 45,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  changePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  changePhotoText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  section: { paddingHorizontal: 16, gap: 10, marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginBottom: 2 },
  field: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  fieldInput: { fontSize: 15, fontFamily: "Inter_400Regular" },
  bioInput: { minHeight: 64, textAlignVertical: "top" },
  contentBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  contentBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  noteBox: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 10,
  },
  noteInput: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 80,
    textAlignVertical: "top",
    lineHeight: 20,
  },
  noteSubmit: {
    alignSelf: "flex-end",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
