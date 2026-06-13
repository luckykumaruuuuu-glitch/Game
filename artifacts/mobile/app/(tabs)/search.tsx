import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedBackground } from "@/components/ThemedBackground";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { useAuth } from "@/context/AuthContext";
import {
  UserProfile,
  searchUsers,
  sendFriendRequest,
  areFriends,
  hasPendingRequest,
} from "@/lib/firestore";
import { useColors } from "@/hooks/useColors";

type RelationState = "none" | "friends" | "requested" | "incoming" | "loading";

function UserCard({
  item,
  myId,
  myProfile,
  colors,
}: {
  item: UserProfile;
  myId: string;
  myProfile: UserProfile | null;
  colors: ReturnType<typeof useColors>;
}) {
  const [relation, setRelation] = useState<RelationState>("none");
  const [checked, setChecked] = useState(false);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const [f, outgoing, incoming] = await Promise.all([
        areFriends(myId, item.userId),
        hasPendingRequest(myId, item.userId),
        hasPendingRequest(item.userId, myId),
      ]);
      if (!active) return;
      if (f) setRelation("friends");
      else if (outgoing) setRelation("requested");
      else if (incoming) setRelation("incoming");
      else setRelation("none");
      setChecked(true);
    })();
    return () => { active = false; };
  }, [item.userId]);

  async function handleAdd() {
    if (relation === "incoming") {
      router.push("/friend-requests");
      return;
    }
    if (!myProfile || relation !== "none") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRelation("loading");
    try {
      await sendFriendRequest(myId, myProfile, item.userId);
      setRelation("requested");
    } catch {
      setRelation("none");
    }
  }

  const btnLabel =
    relation === "friends" ? "Friends" :
    relation === "requested" ? "Requested" :
    relation === "incoming" ? "Accept" :
    "Send Request";

  const btnColor =
    relation === "friends" ? "#10B981" :
    relation === "requested" ? colors.mutedForeground :
    relation === "incoming" ? "#F59E0B" :
    colors.primary;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/user/${item.userId}`)}
      activeOpacity={0.8}
    >
      <ProfileAvatar uri={item.photo} size={48} name={item.name} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.username, { color: colors.mutedForeground }]}>@{item.username}</Text>
      </View>
      {checked && (
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: btnColor + "22", borderColor: btnColor }]}
          onPress={handleAdd}
          disabled={relation === "requested" || relation === "loading" || relation === "friends"}
        >
          {relation === "loading" ? (
            <ActivityIndicator size="small" color={btnColor} />
          ) : (
            <Text style={[styles.addBtnText, { color: btnColor }]}>{btnLabel}</Text>
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

export default function SearchTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback((term: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!term.trim()) { setResults([]); setSearched(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchUsers(term, user?.uid ?? "");
        setResults(res);
        setSearched(true);
      } catch { setResults([]); } finally { setLoading(false); }
    }, 500);
  }, [user?.uid]);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <ThemedBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
      <View style={[styles.container, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Find Friends</Text>
        <View style={[styles.bar, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Search by username, name, or ID..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={(v) => { setQuery(v); doSearch(v); }}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query ? (
            <TouchableOpacity onPress={() => { setQuery(""); setResults([]); setSearched(false); }}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(i) => i.userId}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <UserCard item={item} myId={user?.uid ?? ""} myProfile={profile} colors={colors} />
            )}
            ListEmptyComponent={
              <View style={styles.center}>
                <Feather name={searched ? "users" : "search"} size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  {searched ? "No users found" : "Search for friends by username, name, or ID"}
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      </KeyboardAvoidingView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 16 },
  bar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 14, borderWidth: 1, marginBottom: 16,
  },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  list: { gap: 10, paddingBottom: 100 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  username: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  addBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, minWidth: 85, alignItems: "center",
  },
  addBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 80 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center" },
});
