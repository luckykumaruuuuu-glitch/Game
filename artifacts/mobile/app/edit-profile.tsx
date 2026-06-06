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
import { DateWheelPicker } from "@/components/DateWheelPicker";
import { LocationPicker } from "@/components/LocationPicker";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { getCountryNames, getCities, getStates } from "@/lib/geoData";
import { updateUserProfile } from "@/lib/firestore";
import { uploadProfilePhoto } from "@/lib/storage";

const GENDER_OPTIONS = [
  { value: "male" as const, label: "Male" },
  { value: "female" as const, label: "Female" },
  { value: "other" as const, label: "Other" },
];

type Gender = "male" | "female" | "other" | "";
type PickerType = "country" | "state" | "city" | null;

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, profile, refreshProfile } = useAuth();

  const [name, setName] = useState(profile?.name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [gender, setGender] = useState<Gender>((profile?.gender as Gender) ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(profile?.dateOfBirth ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [country, setCountry] = useState(profile?.country ?? "");
  const [state, setState] = useState(profile?.state ?? "");
  const [city, setCity] = useState(profile?.city ?? "");

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [openPicker, setOpenPicker] = useState<PickerType>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  // ── Location cascades ─────────────────────────────────────────────────────

  function handleCountrySelect(c: string) {
    setCountry(c);
    setState("");
    setCity("");
  }

  function handleStateSelect(s: string) {
    setState(s);
    setCity("");
  }

  const countryNames = getCountryNames();
  const stateNames = country ? getStates(country) : [];
  const cityNames = country && state ? getCities(country, state) : [];

  // ── Save ─────────────────────────────────────────────────────────────────

  async function handleSaveProfile() {
    if (!user) return;

    if (!country.trim()) {
      Alert.alert("Required", "Please select your country.");
      return;
    }
    if (!state.trim()) {
      Alert.alert("Required", "Please select your state / region.");
      return;
    }
    if (!city.trim()) {
      Alert.alert("Required", "Please select your city.");
      return;
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone && (trimmedPhone.length < 7 || trimmedPhone.length > 15)) {
      Alert.alert("Invalid Phone", "Phone number must be 7–15 digits.");
      return;
    }

    const trimmedDob = dateOfBirth.trim();
    if (trimmedDob) {
      const dobRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dobRegex.test(trimmedDob)) {
        Alert.alert("Invalid Date", "Please select a valid date of birth.");
        return;
      }
      const [dd, mm, yyyy] = trimmedDob.split("/").map(Number);
      const d = new Date(yyyy, mm - 1, dd);
      if (isNaN(d.getTime()) || d >= new Date()) {
        Alert.alert("Invalid Date", "Date of birth must be a past date.");
        return;
      }
    }

    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        name: name.trim(),
        bio: bio.trim(),
        gender,
        dateOfBirth: trimmedDob,
        phone: trimmedPhone,
        country: country.trim(),
        state: state.trim(),
        city: city.trim(),
      });
      await refreshProfile();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Photo ────────────────────────────────────────────────────────────────

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

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  // ── Helpers ───────────────────────────────────────────────────────────────

  function PickerField({
    label,
    value,
    placeholder,
    onPress,
    required,
    disabled,
  }: {
    label: string;
    value: string;
    placeholder: string;
    onPress: () => void;
    required?: boolean;
    disabled?: boolean;
  }) {
    return (
      <TouchableOpacity
        style={[
          styles.field,
          {
            borderColor: colors.border,
            backgroundColor: disabled
              ? "rgba(255,255,255,0.01)"
              : "rgba(255,255,255,0.04)",
            opacity: disabled ? 0.45 : 1,
          },
        ]}
        onPress={disabled ? undefined : onPress}
        activeOpacity={disabled ? 1 : 0.65}
        disabled={disabled}
      >
        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
          {label}
          {required && <Text style={{ color: colors.destructive }}> *</Text>}
        </Text>
        <View style={styles.pickerRow}>
          <Text
            style={[
              styles.fieldInput,
              {
                color: value ? colors.foreground : colors.mutedForeground,
                flex: 1,
                opacity: value ? 1 : 0.6,
              },
            ]}
            numberOfLines={1}
          >
            {value || placeholder}
          </Text>
          <Feather
            name={disabled ? "lock" : "chevron-right"}
            size={15}
            color={colors.mutedForeground}
          />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={[styles.header, { paddingTop: topPad + 12 }]}>
            <TouchableOpacity
              style={[styles.backCircle, { borderColor: colors.border }]}
              onPress={() => router.back()}
            >
              <Feather name="x" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              Edit Profile
            </Text>
            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 },
              ]}
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

          {/* Avatar */}
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

          {/* Profile Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              PROFILE INFO
            </Text>

            {/* Full Name */}
            <View
              style={[
                styles.field,
                {
                  borderColor: colors.border,
                  backgroundColor: "rgba(255,255,255,0.04)",
                },
              ]}
            >
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                Full Name
              </Text>
              <TextInput
                style={[styles.fieldInput, { color: colors.foreground }]}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="words"
              />
            </View>

            {/* Username (read-only) */}
            <View
              style={[
                styles.field,
                {
                  borderColor: colors.border,
                  backgroundColor: "rgba(255,255,255,0.02)",
                },
              ]}
            >
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                Username
              </Text>
              <Text style={[styles.fieldInput, { color: colors.mutedForeground }]}>
                @{profile?.username ?? ""}
              </Text>
            </View>

            {/* Gender */}
            <View
              style={[
                styles.field,
                {
                  borderColor: colors.border,
                  backgroundColor: "rgba(255,255,255,0.04)",
                },
              ]}
            >
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                Gender
              </Text>
              <View style={styles.genderRow}>
                {GENDER_OPTIONS.map((g) => (
                  <TouchableOpacity
                    key={g.value}
                    style={[
                      styles.genderPill,
                      {
                        borderColor:
                          gender === g.value ? colors.primary : colors.border,
                        backgroundColor:
                          gender === g.value
                            ? colors.primary + "22"
                            : "transparent",
                      },
                    ]}
                    onPress={() =>
                      setGender(gender === g.value ? "" : g.value)
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.genderPillText,
                        {
                          color:
                            gender === g.value
                              ? colors.primary
                              : colors.mutedForeground,
                        },
                      ]}
                    >
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date of Birth */}
            <TouchableOpacity
              style={[
                styles.field,
                {
                  borderColor: colors.border,
                  backgroundColor: "rgba(255,255,255,0.04)",
                },
              ]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.65}
            >
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                Date of Birth
              </Text>
              <View style={styles.pickerRow}>
                <Text
                  style={[
                    styles.fieldInput,
                    {
                      color: dateOfBirth ? colors.foreground : colors.mutedForeground,
                      flex: 1,
                      opacity: dateOfBirth ? 1 : 0.6,
                    },
                  ]}
                >
                  {dateOfBirth || "DD/MM/YYYY"}
                </Text>
                <Feather
                  name="calendar"
                  size={15}
                  color={colors.mutedForeground}
                />
              </View>
            </TouchableOpacity>

            {/* Phone Number */}
            <View
              style={[
                styles.field,
                {
                  borderColor: colors.border,
                  backgroundColor: "rgba(255,255,255,0.04)",
                },
              ]}
            >
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                Phone Number
              </Text>
              <TextInput
                style={[styles.fieldInput, { color: colors.foreground }]}
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ""))}
                placeholder="Digits only (7–15)"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              LOCATION
            </Text>

            {/* Country */}
            <PickerField
              label="Country"
              value={country}
              placeholder="Select country"
              onPress={() => setOpenPicker("country")}
              required
            />

            {/* State */}
            <PickerField
              label="State / Region"
              value={state}
              placeholder={country ? "Select state" : "Select country first"}
              onPress={() => setOpenPicker("state")}
              required
              disabled={!country || stateNames.length === 0}
            />

            {/* City */}
            <PickerField
              label="City"
              value={city}
              placeholder={state ? "Select city" : "Select state first"}
              onPress={() => setOpenPicker("city")}
              required
              disabled={!state || cityNames.length === 0}
            />
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              ABOUT
            </Text>

            {/* Bio */}
            <View
              style={[
                styles.field,
                {
                  borderColor: colors.border,
                  backgroundColor: "rgba(255,255,255,0.04)",
                },
              ]}
            >
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                Bio (optional)
              </Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  styles.bioInput,
                  { color: colors.foreground },
                ]}
                value={bio}
                onChangeText={setBio}
                placeholder="Short bio..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
                maxLength={150}
              />
            </View>

            {/* Join Date (read-only) */}
            <View
              style={[
                styles.field,
                {
                  borderColor: colors.border,
                  backgroundColor: "rgba(255,255,255,0.02)",
                },
              ]}
            >
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                Joined
              </Text>
              <Text style={[styles.fieldInput, { color: colors.mutedForeground }]}>
                {joinDate}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Country Picker ──────────────────────────────────────────────────── */}
      <LocationPicker
        visible={openPicker === "country"}
        title="Select Country"
        items={countryNames}
        selected={country}
        onSelect={handleCountrySelect}
        onClose={() => setOpenPicker(null)}
      />

      {/* ── State Picker ─────────────────────────────────────────────────────── */}
      <LocationPicker
        visible={openPicker === "state"}
        title="Select State / Region"
        items={stateNames}
        selected={state}
        onSelect={handleStateSelect}
        onClose={() => setOpenPicker(null)}
      />

      {/* ── City Picker ──────────────────────────────────────────────────────── */}
      <LocationPicker
        visible={openPicker === "city"}
        title="Select City"
        items={cityNames}
        selected={city}
        onSelect={setCity}
        onClose={() => setOpenPicker(null)}
      />

      {/* ── Date Picker ──────────────────────────────────────────────────────── */}
      <DateWheelPicker
        visible={showDatePicker}
        value={dateOfBirth}
        onConfirm={(date) => setDateOfBirth(date)}
        onClose={() => setShowDatePicker(false)}
      />
    </>
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
  section: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
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
  genderRow: { flexDirection: "row", gap: 8, marginTop: 4, flexWrap: "wrap" },
  genderPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  genderPillText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
});
