import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedBackground } from "@/components/ThemedBackground";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { useAuth } from "@/context/AuthContext";
import {
  UserProfile,
  subscribeToFriends,
  subscribeToFriendRequests,
  removeFriend,
  getChatId,
  FriendRequest,
} from "@/lib/firestore";
import { subscribeToFriendsPresence, UserPresence } from "@/lib/ludoFirestore";
import { useColors } from "@/hooks/useColors";

export default function FriendsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [presence, setPresence] = useState<Record<string, UserPresence>>({});
  const [loading, setLoading] = useState(true);

  const presenceUnsubRef = useRef<(() => void) | null>(null);

  // Realtime friend list
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToFriends(user.uid, (list) => {
      setFriends(list);
      setLoading(false);

      // Update presence subscription when friend list changes
      if (presenceUnsubRef.current) presenceUnsubRef.current();
      if (list.length > 0) {
        presenceUnsubRef.current = subscribeToFriendsPresence(
          list.map(f => f.userId),
          setPresence
        );
      } else {
        setPresence({});
      }
    });
    return () => {
      unsub();
      if (presenceUnsubRef.current) presenceUnsubRef.current();
    };
  }, [user]);

  // Realtime pending requests count
  useEffect(() => {
    if (!user) return;
    return subscribeToFriendRequests(user.uid, setPendingRequests);
  }, [user]);

  function handleRemove(friend: UserProfile) {
    Alert.alert("Remove Friend", `Remove @${friend.username} from your friends?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await removeFriend(user!.uid, friend.userId);
        },
      },
    ]);
  }

  return (
    <ThemedBackground>
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Friends{friends.length > 0 ? ` (${friends.length})` : ""}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push("/friend-requests")}
              style={[styles.requestsBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Feather
                name="user-check"
                size={16}
                color={pendingRequests.length > 0 ? colors.primary : colors.foreground}
              />
              {pendingRequests.length > 0 && (
                <View style={[styles.badge, { backgroundColor: "#EF4444" }]}>
                  <Text style={styles.badgeText}>{pendingRequests.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/search")}
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="user-plus" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(f) => f.userId}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const userPresence = presence[item.userId];
              const isOnline = userPresence?.online ?? false;
              return (
                <View
                  style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <TouchableOpacity
                    style={styles.cardLeft}
                    onPress={() => router.push(`/user/${item.userId}`)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.avatarWrap}>
                      <ProfileAvatar uri={item.photo} size={52} name={item.name} />
                      <View
                        style={[
                          styles.onlineDot,
                          { backgroundColor: isOnline ? "#10B981" : "#EF4444" },
                        ]}
                      />
                    </View>
                    <View>
                      <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
                      <Text style={[styles.username, { color: colors.mutedForeground }]}>
                        @{item.username}
                      </Text>
                      <Text style={[styles.statusText, { color: isOnline ? "#10B981" : colors.mutedForeground }]}>
                        {isOnline ? "Online" : "Offline"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push(`/chat/${item.userId}`);
                      }}
                      activeOpacity={0.8}
                    >
                      <Feather name="message-circle" size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: colors.destructive + "22", borderColor: colors.destructive + "44" }]}
                      onPress={() => handleRemove(item)}
                      activeOpacity={0.8}
                    >
                      <Feather name="user-minus" size={16} color={colors.destructive} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.center}>
                <Feather name="users" size={44} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No friends yet</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Search for users and send friend requests
                </Text>
                <TouchableOpacity
                  style={[styles.searchBtn, { backgroundColor: colors.primary }]}
                  onPress={() => router.push("/search")}
                  activeOpacity={0.8}
                >
                  <Feather name="search" size={16} color="#fff" />
                  <Text style={styles.searchBtnText}>Find Friends</Text>
                </TouchableOpacity>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center", justifyContent: "center",
  },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  list: { gap: 10, paddingBottom: 40 },
  card: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    padding: 14, borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatarWrap: { position: "relative" },
  onlineDot: {
    position: "absolute", bottom: 0, right: 0,
    width: 13, height: 13, borderRadius: 7,
    borderWidth: 2, borderColor: "#fff",
  },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  username: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 1 },
  statusText: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  headerActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  requestsBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center", justifyContent: "center",
  },
  badge: {
    position: "absolute", top: -4, right: -4,
    minWidth: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 80 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  searchBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, marginTop: 8,
  },
  searchBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
