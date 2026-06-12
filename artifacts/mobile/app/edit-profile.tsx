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
import { getDialCode, stripDialCode, getPhoneLength, getPhoneLengthHint } from "@/lib/countryCodes";
import { updateUserProfile } from "@/lib/firestore";
import { uploadProfilePhoto } from "@/lib/storage";

const GENDER_OPTIONS = [
  { value: "male" as const, label: "Male" },
  { value: "female" as const, label: "Female" },
  { value: "other" as const, label: "Other" },
];

type Gender = "male" | "female" | "other" | "";
type PickerType = "country" | "state" | "city" | null;

// ── helpers ────────────────────────────────────────────────────────────────

function initPhoneParts(
  storedPhone: string,
  countryName: string
): { dialCode: string; localPhone: string } {
  const code = getDialCode(countryName);
  if (!storedPhone) return { dialCode: code, localPhone: "" };
  // If stored phone begins with the country dial code, strip it
  if (code && storedPhone.startsWith(code)) {
    return { dialCode: code, localPhone: storedPhone.slice(code.length) };
  }
  // Stored as plain digits (old format) — keep as local number
  return { dialCode: code, localPhone: storedPhone.replace(/[^0-9]/g, "") };
}

// ── screen ────────────────────────────────────────────────────────────────

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, profile, refreshProfile } = useAuth();

  const [name, setName] = useState(profile?.name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [gender, setGender] = useState<Gender>((profile?.gender as Gender) ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(profile?.dateOfBirth ?? "");
  const [country, setCountry] = useState(profile?.country ?? "");
  const [state, setState] = useState(profile?.state ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [locality, setLocality] = useState(profile?.locality ?? "");

  // Phone is stored in two parts: the dial code prefix and the local number
  const initParts = initPhoneParts(profile?.phone ?? "", profile?.country ?? "");
  const [dialCode, setDialCode] = useState(initParts.dialCode);
  const [localPhone, setLocalPhone] = useState(initParts.localPhone);

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

  // ── location cascades ────────────────────────────────────────────────────

  function handleCountrySelect(c: string) {
    setCountry(c);
    setState("");
    setCity("");
    setLocality("");
    // Auto-set dial code and clear old local number (digit count changes per country)
    const code = getDialCode(c);
    setDialCode(code);
    setLocalPhone("");
  }

  function handleStateSelect(s: string) {
    setState(s);
    setCity("");
  }

  const countryNames = getCountryNames();
  const stateNames = country ? getStates(country) : [];
  const cityNames = country && state ? getCities(country, state) : [];

  // ── save ──────────────────────────────────────────────────────────────────

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

    const trimmedLocal = localPhone.trim();
    if (trimmedLocal) {
      const { min: phoneMin, max: phoneMax } = getPhoneLength(country);
      if (trimmedLocal.length < phoneMin || trimmedLocal.length > phoneMax) {
        const hint = getPhoneLengthHint(country);
        Alert.alert(
          "Invalid Phone Number",
          `${country} phone numbers must be ${hint} (after the country code). You entered ${trimmedLocal.length} digit${trimmedLocal.length !== 1 ? "s" : ""}.`
        );
        return;
      }
    }

    // Build full international number e.g. "+919876543210"
    const fullPhone = trimmedLocal ? `${dialCode}${trimmedLocal}` : "";

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
        phone: fullPhone,
        country: country.trim(),
        state: state.trim(),
        city: city.trim(),
        locality: locality.trim(),
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

  // ── photo ─────────────────────────────────────────────────────────────────

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

  // ── sub-component: picker trigger button ──────────────────────────────────

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

  // ── render ────────────────────────────────────────────────────────────────

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
          {/* ── Header ─────────────────────────────────────────────────── */}
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

          {/* ── Avatar ─────────────────────────────────────────────────── */}
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

          {/* ── Profile Info ────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              PROFILE INFO
            </Text>

            {/* Full Name */}
            <View
              style={[
                styles.field,
                { borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.04)" },
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
                { borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.02)" },
              ]}
            >
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                Username
              </Text>
              <Text style={[styles.fieldInput, { color: colors.mutedForeground }]}>
                @{profile?.username ?? ""}
              </Text>
            </View>

            {/* Email (read-only — cannot be changed) */}
            <View
              style={[
                styles.field,
                { borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.02)" },
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                  Email
                </Text>
                <View style={[styles.lockedBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Feather name="lock" size={10} color={colors.mutedForeground} />
                  <Text style={[styles.lockedBadgeText, { color: colors.mutedForeground }]}>Locked</Text>
                </View>
              </View>
              <Text style={[styles.fieldInput, { color: colors.mutedForeground }]}>
                {profile?.email ?? ""}
              </Text>
            </View>

            {/* Gender */}
            <View
              style={[
                styles.field,
                { borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.04)" },
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
                        borderColor: gender === g.value ? colors.primary : colors.border,
                        backgroundColor:
                          gender === g.value ? colors.primary + "22" : "transparent",
                      },
                    ]}
                    onPress={() => setGender(gender === g.value ? "" : g.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.genderPillText,
                        {
                          color:
                            gender === g.value ? colors.primary : colors.mutedForeground,
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
                { borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.04)" },
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
                <Feather name="calendar" size={15} color={colors.mutedForeground} />
              </View>
            </TouchableOpacity>

            {/* ── Phone Number — split into dial-code prefix + local input ── */}
            <View
              style={[
                styles.field,
                { borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.04)" },
              ]}
            >
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                Phone Number
              </Text>
              <View style={styles.phoneRow}>
                {/* Dial code badge — auto-set from country selection */}
                <View
                  style={[
                    styles.dialCodeBox,
                    {
                      borderRightColor: colors.border,
                      backgroundColor: dialCode
                        ? colors.primary + "18"
                        : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dialCodeText,
                      {
                        color: dialCode ? colors.primary : colors.mutedForeground,
                        fontFamily: dialCode ? "Inter_600SemiBold" : "Inter_400Regular",
                      },
                    ]}
                  >
                    {dialCode || "+??"}
                  </Text>
                </View>

                {/* Local number input */}
                <TextInput
                  style={[styles.localPhoneInput, { color: colors.foreground }]}
                  value={localPhone}
                  onChangeText={(t) => {
                    const digits = t.replace(/[^0-9]/g, "");
                    const { max } = getPhoneLength(country);
                    setLocalPhone(digits.slice(0, max));
                  }}
                  placeholder={
                    country
                      ? `${getPhoneLengthHint(country)} required`
                      : "Select country first"
                  }
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="phone-pad"
                  maxLength={getPhoneLength(country).max}
                  editable={!!country}
                />
              </View>

              {/* Digit count hint + live counter */}
              {country ? (
                <View style={styles.phoneHintRow}>
                  <Text style={[styles.phoneHintText, { color: colors.mutedForeground }]}>
                    {country}: {getPhoneLengthHint(country)} expected
                  </Text>
                  {localPhone.length > 0 && (() => {
                    const { min, max } = getPhoneLength(country);
                    const valid = localPhone.length >= min && localPhone.length <= max;
                    return (
                      <Text
                        style={[
                          styles.phoneCounter,
                          { color: valid ? "#4CAF50" : colors.destructive },
                        ]}
                      >
                        {localPhone.length}/{max}
                      </Text>
                    );
                  })()}
                </View>
              ) : null}

              {/* Full number preview */}
              {dialCode && localPhone.length > 0 && (
                <Text style={[styles.phonePreview, { color: colors.mutedForeground }]}>
                  Full: {dialCode} {localPhone}
                </Text>
              )}
            </View>
          </View>

          {/* ── Location ────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              LOCATION
            </Text>

            <PickerField
              label="Country"
              value={country}
              placeholder="Select country"
              onPress={() => setOpenPicker("country")}
              required
            />
            <PickerField
              label="State / Region"
              value={state}
              placeholder={country ? "Select state" : "Select country first"}
              onPress={() => setOpenPicker("state")}
              required
              disabled={!country || stateNames.length === 0}
            />
            <PickerField
              label="City"
              value={city}
              placeholder={state ? "Select city" : "Select state first"}
              onPress={() => setOpenPicker("city")}
              required
              disabled={!state || cityNames.length === 0}
            />

            {/* Locality — free-text, enabled only after city is selected */}
            <View
              style={[
                styles.field,
                {
                  borderColor: colors.border,
                  backgroundColor: city
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(255,255,255,0.01)",
                  opacity: city ? 1 : 0.45,
                },
              ]}
            >
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                Locality{" "}
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                  (optional)
                </Text>
              </Text>
              <TextInput
                style={[styles.fieldInput, { color: colors.foreground }]}
                value={locality}
                onChangeText={setLocality}
                placeholder={
                  city
                    ? "e.g. Sector 12, MG Road, Andheri West…"
                    : "Select city first"
                }
                placeholderTextColor={colors.mutedForeground}
                editable={!!city}
                autoCapitalize="words"
                maxLength={120}
              />
              {locality.length > 0 && (
                <Text
                  style={[
                    styles.localityCounter,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {locality.length}/120
                </Text>
              )}
            </View>
          </View>

          {/* ── About ───────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              ABOUT
            </Text>

            {/* Bio */}
            <View
              style={[
                styles.field,
                { borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.04)" },
              ]}
            >
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                Bio (optional)
              </Text>
              <TextInput
                style={[styles.fieldInput, styles.bioInput, { color: colors.foreground }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Short bio..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
                maxLength={150}
              />
            </View>

            {/* Joined (read-only) */}
            <View
              style={[
                styles.field,
                { borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.02)" },
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

      {/* ── Pickers ──────────────────────────────────────────────────────── */}
      <LocationPicker
        visible={openPicker === "country"}
        title="Select Country"
        items={countryNames}
        selected={country}
        onSelect={handleCountrySelect}
        onClose={() => setOpenPicker(null)}
      />
      <LocationPicker
        visible={openPicker === "state"}
        title="Select State / Region"
        items={stateNames}
        selected={state}
        onSelect={handleStateSelect}
        onClose={() => setOpenPicker(null)}
      />
      <LocationPicker
        visible={openPicker === "city"}
        title="Select City"
        items={cityNames}
        selected={city}
        onSelect={setCity}
        onClose={() => setOpenPicker(null)}
      />
      <DateWheelPicker
        visible={showDatePicker}
        value={dateOfBirth}
        onConfirm={(date) => setDateOfBirth(date)}
        onClose={() => setShowDatePicker(false)}
      />
    </>
  );
}

// ── styles ────────────────────────────────────────────────────────────────

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
    width: 40, height: 40, borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  saveBtn: {
    paddingHorizontal: 20, paddingVertical: 9,
    borderRadius: 20, minWidth: 70, alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  avatarSection: { alignItems: "center", gap: 12, paddingVertical: 20 },
  uploadingOverlay: {
    borderRadius: 45,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center",
  },
  changePhotoBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, borderWidth: StyleSheet.hairlineWidth,
  },
  changePhotoText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  section: { paddingHorizontal: 16, gap: 10, marginBottom: 24 },
  sectionLabel: {
    fontSize: 11, fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8, marginBottom: 2,
  },
  field: {
    borderRadius: 14, borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14, paddingVertical: 12, gap: 4,
  },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  fieldInput: { fontSize: 15, fontFamily: "Inter_400Regular" },
  bioInput: { minHeight: 64, textAlignVertical: "top" },
  genderRow: { flexDirection: "row", gap: 8, marginTop: 4, flexWrap: "wrap" },
  genderPill: {
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  genderPillText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  pickerRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", gap: 8,
  },

  /* Phone field */
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "transparent",
  },
  dialCodeBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRightWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 62,
  },
  dialCodeText: {
    fontSize: 15,
    letterSpacing: 0.3,
  },
  localPhoneInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 12,
    paddingVertical: 8,
    padding: 0,
  },
  phonePreview: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    opacity: 0.7,
  },
  phoneHintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
  },
  phoneHintText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    opacity: 0.7,
    flex: 1,
  },
  phoneCounter: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    marginLeft: 8,
  },
  localityCounter: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    alignSelf: "flex-end",
    marginTop: 2,
    opacity: 0.6,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  lockedBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
});
