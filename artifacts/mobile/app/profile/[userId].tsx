import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ContentGrid } from "@/components/ContentGrid";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import {
  ContentItem,
  UserProfile,
  subscribeToUserContent,
  subscribeToUserProfile,
} from "@/lib/firestore";

const BRAND_BG = "#080818";
const BRAND_CARD = "#12122a";
const BRAND_BORDER = "rgba(124,58,237,0.22)";
const BRAND_PURPLE = "#7C3AED";
const BRAND_PURPLE_LIGHT = "#A855F7";
const BRAND_TEXT = "#ffffff";
const BRAND_MUTED = "rgba(255,255,255,0.5)";

export default function PublicProfileScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userId) { setNotFound(true); setLoading(false); return; }

    const unsubProfile = subscribeToUserProfile(userId, (p) => {
      if (!p) { setNotFound(true); setLoading(false); return; }
      setProfile(p);
      setLoading(false);
    });

    const unsubContent = subscribeToUserContent(
      userId,
      setContent,
      () => {}
    );

    return () => { unsubProfile(); unsubContent(); };
  }, [userId]);

  function handleDownload() {
    Linking.openURL("https://leludo.app");
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.spinner}>
          <ActivityIndicator size="large" color={BRAND_PURPLE_LIGHT} />
        </View>
        <Text style={styles.loadingText}>Loading profile…</Text>
      </View>
    );
  }

  if (notFound || !profile) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="account-off-outline" size={56} color={BRAND_MUTED} />
        <Text style={styles.notFoundTitle}>Profile not found</Text>
        <Text style={styles.notFoundSub}>This player may have deleted their account.</Text>
      </View>
    );
  }

  const topPad = insets.top + (Platform.OS === "web" ? 0 : 0);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 24, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Branding header ── */}
        <View style={styles.brandHeader}>
          <MaterialCommunityIcons name="dice-6" size={18} color={BRAND_PURPLE} />
          <Text style={styles.brandName}>LeLudo</Text>
          <MaterialCommunityIcons name="dice-multiple" size={18} color={BRAND_PURPLE} />
        </View>

        {/* ── Profile card ── */}
        <LinearGradient
          colors={["#1a053a", "#0d0d20", "#12122a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.avatarGlow} />

          <View style={styles.avatarBorder}>
            <ProfileAvatar uri={profile.photo} size={88} name={profile.name} />
          </View>

          <Text style={styles.displayName}>{profile.name}</Text>
          <Text style={styles.handle}>@{profile.username}</Text>

          {!!profile.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}

          {/* Info chips */}
          <View style={styles.chips}>
            {!!profile.gender && (
              <View style={styles.chip}>
                <Feather name="user" size={11} color={BRAND_MUTED} />
                <Text style={styles.chipText}>
                  {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                </Text>
              </View>
            )}
            {(profile.city || profile.country) ? (
              <View style={styles.chip}>
                <Feather name="map-pin" size={11} color={BRAND_MUTED} />
                <Text style={styles.chipText}>
                  {[profile.city, profile.country].filter(Boolean).join(", ")}
                </Text>
              </View>
            ) : null}
            {!!profile.createdAt && (
              <View style={styles.chip}>
                <Feather name="clock" size={11} color={BRAND_MUTED} />
                <Text style={styles.chipText}>
                  Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                </Text>
              </View>
            )}
          </View>

          {/* Stat row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{content.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="dice-multiple" size={22} color={BRAND_PURPLE_LIGHT} />
              <Text style={styles.statLabel}>LeLudo Player</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Download CTA ── */}
        <TouchableOpacity style={styles.ctaBtn} onPress={handleDownload} activeOpacity={0.85}>
          <LinearGradient
            colors={[BRAND_PURPLE, "#6D28D9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <MaterialCommunityIcons name="dice-6" size={20} color="#fff" />
            <Text style={styles.ctaText}>Play LeLudo — Download the App</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Public content ── */}
        {content.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Posts</Text>
            </View>
            <ContentGrid items={content} loading={false} />
          </>
        )}

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>View-only public profile · No account required</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },
  center: {
    flex: 1,
    backgroundColor: BRAND_BG,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  spinner: { marginBottom: 4 },
  loadingText: { color: BRAND_MUTED, fontSize: 14 },
  notFoundTitle: { color: BRAND_TEXT, fontSize: 20, fontWeight: "700", textAlign: "center" },
  notFoundSub: { color: BRAND_MUTED, fontSize: 14, textAlign: "center" },

  scroll: {
    paddingHorizontal: 20,
    alignItems: "stretch",
    gap: 16,
  },

  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 4,
  },
  brandName: {
    color: BRAND_TEXT,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },

  profileCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BRAND_BORDER,
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 24,
    gap: 6,
    overflow: "hidden",
    position: "relative",
  },
  avatarGlow: {
    position: "absolute",
    top: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(124,58,237,0.18)",
  },
  avatarBorder: {
    padding: 3,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: BRAND_PURPLE,
    backgroundColor: "rgba(124,58,237,0.12)",
    marginBottom: 4,
  },
  displayName: {
    color: BRAND_TEXT,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },
  handle: {
    color: BRAND_MUTED,
    fontSize: 13,
    textAlign: "center",
  },
  bio: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 4,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    marginTop: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BRAND_BORDER,
    backgroundColor: BRAND_CARD,
  },
  chipText: {
    color: BRAND_MUTED,
    fontSize: 11,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BRAND_BORDER,
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    color: BRAND_TEXT,
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    color: BRAND_MUTED,
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: BRAND_BORDER,
  },

  ctaBtn: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: BRAND_PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  ctaText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  sectionHeader: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionTitle: {
    color: BRAND_TEXT,
    fontSize: 17,
    fontWeight: "700",
  },

  footer: {
    alignItems: "center",
    paddingTop: 8,
  },
  footerText: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 11,
    textAlign: "center",
  },
});
