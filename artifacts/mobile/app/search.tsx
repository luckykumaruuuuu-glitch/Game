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

interface UserCardProps {
  item: UserProfile;
  myId: string;
  myProfile: UserProfile;
  colors: ReturnType<typeof useColors>;
}

function UserCard({ item, myId, myProfile, colors }: UserCardProps) {
  const [relation, setRelation] = useState<RelationState>("none");
  const [checkDone, setCheckDone] = useState(false);

  React.useEffect(() => {
    let active = true;
    async function check() {
      const [friends, outgoing, incoming] = await Promise.all([
        areFriends(myId, item.userId),
        hasPendingRequest(myId, item.userId),
        hasPendingRequest(item.userId, myId),
      ]);
      if (!active) return;
      if (friends) setRelation("friends");
      else if (outgoing) setRelation("requested");
      else if (incoming) setRelation("incoming");
      else setRelation("none");
      setCheckDone(true);
    }
    check().catch(() => setCheckDone(true));
    return () => { active = false; };
  }, [item.userId]);

  async function handleAdd() {
    if (relation === "incoming") {
      router.push("/friend-requests");
      return;
    }
    if (relation !== "none") return;
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
      style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/user/${item.userId}`)}
      activeOpacity={0.8}
    >
      <ProfileAvatar uri={item.photo} size={48} name={item.name} />
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.foreground }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.userUsername, { color: colors.mutedForeground }]}>
          @{item.username}
        </Text>
      </View>
      {checkDone && relation !== "friends" ? (
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: btnColor + "22", borderColor: btnColor }]}
          onPress={handleAdd}
          disabled={relation === "requested" || relation === "loading"}
          activeOpacity={0.8}
        >
          {relation === "loading" ? (
            <ActivityIndicator size="small" color={btnColor} />
          ) : (
            <Text style={[styles.addBtnText, { color: btnColor }]}>{btnLabel}</Text>
          )}
        </TouchableOpacity>
      ) : relation === "friends" ? (
        <View style={[styles.addBtn, { backgroundColor: "#10B98122", borderColor: "#10B981" }]}>
          <Text style={[styles.addBtnText, { color: "#10B981" }]}>Friends</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(
    (term: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!term.trim()) {
        setResults([]);
        setSearched(false);
        return;
      }
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await searchUsers(term, user?.uid ?? "");
          setResults(res);
          setSearched(true);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 500);
    },
    [user?.uid]
  );

  return (
    <ThemedBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Search Users</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Input */}
        <View
          style={[styles.searchBar, { backgroundColor: colors.input, borderColor: colors.border }]}
        >
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search by username, name, or ID..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={(v) => {
              setQuery(v);
              doSearch(v);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
          {query ? (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                setResults([]);
                setSearched(false);
              }}
            >
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Results */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.userId}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <UserCard
                item={item}
                myId={user?.uid ?? ""}
                myProfile={profile!}
                colors={colors}
              />
            )}
            ListEmptyComponent={
              searched ? (
                <View style={styles.center}>
                  <Feather name="users" size={40} color={colors.mutedForeground} />
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                    No users found
                  </Text>
                </View>
              ) : (
                <View style={styles.center}>
                  <Feather name="search" size={40} color={colors.mutedForeground} />
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                    Type to search for users
                  </Text>
                </View>
              )
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  list: { gap: 10, paddingBottom: 40 },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  userUsername: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    alignItems: "center",
  },
  addBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 80 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
