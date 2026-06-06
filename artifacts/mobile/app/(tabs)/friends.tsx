import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedBackground } from "@/components/ThemedBackground";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import {
  UserProfile,
  subscribeToFriends,
  subscribeToFriendRequests,
  removeFriend,
  FriendRequest,
} from "@/lib/firestore";
import { subscribeToFriendsPresence, UserPresence } from "@/lib/ludoFirestore";

export default function FriendsTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [presence, setPresence] = useState<Record<string, UserPresence>>({});
  const [loading, setLoading] = useState(true);
  const [removeTarget, setRemoveTarget] = useState<UserProfile | null>(null);
  const [removing, setRemoving] = useState(false);

  const presenceUnsubRef = useRef<(() => void) | null>(null);

  // Realtime friend list
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToFriends(user.uid, (list) => {
      setFriends(list);
      setLoading(false);

      if (presenceUnsubRef.current) presenceUnsubRef.current();
      if (list.length > 0) {
        presenceUnsubRef.current = subscribeToFriendsPresence(
          list.map((f) => f.userId),
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRemoveTarget(friend);
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <ThemedBackground>
      <View style={[styles.container, { paddingTop: topPad + 12 }]}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Friends
            {friends.length > 0 && (
              <Text style={{ color: colors.mutedForeground, fontSize: 16 }}>
                {" "}({friends.length})
              </Text>
            )}
          </Text>

          <View style={styles.headerActions}>
            {/* Pending friend requests badge */}
            <TouchableOpacity
              onPress={() => router.push("/friend-requests")}
              style={[
                styles.iconBtn,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              activeOpacity={0.75}
            >
              <Feather
                name="user-check"
                size={18}
                color={
                  pendingRequests.length > 0
                    ? colors.primary
                    : colors.foreground
                }
              />
              {pendingRequests.length > 0 && (
                <View style={[styles.badge, { backgroundColor: "#EF4444" }]}>
                  <Text style={styles.badgeText}>{pendingRequests.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Add friend → goes to search */}
            <TouchableOpacity
              onPress={() => router.push("/search")}
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <Feather name="user-plus" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── List ───────────────────────────────────────────────── */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(f) => f.userId}
            contentContainerStyle={[
              styles.list,
              { paddingBottom: insets.bottom + 100 },
            ]}
            renderItem={({ item }) => {
              const userPresence = presence[item.userId];
              const isOnline = userPresence?.online ?? false;
              return (
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
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
                          {
                            backgroundColor: isOnline ? "#10B981" : "#9CA3AF",
                            borderColor: colors.card,
                          },
                        ]}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.name, { color: colors.foreground }]}>
                        {item.name}
                      </Text>
                      <Text
                        style={[styles.username, { color: colors.mutedForeground }]}
                      >
                        @{item.username}
                      </Text>
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: isOnline ? "#10B981" : colors.mutedForeground,
                          },
                        ]}
                      >
                        {isOnline ? "● Online" : "○ Offline"}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: colors.primary + "22",
                        borderColor: colors.primary + "44",
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(`/chat/${item.userId}`);
                    }}
                    activeOpacity={0.8}
                  >
                    <Feather name="message-circle" size={17} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.center}>
                <Feather name="users" size={48} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  No friends yet
                </Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Search for users and send friend requests to grow your network
                </Text>
                <TouchableOpacity
                  style={[styles.findBtn, { backgroundColor: colors.primary }]}
                  onPress={() => router.push("/search")}
                  activeOpacity={0.8}
                >
                  <Feather name="search" size={16} color="#fff" />
                  <Text style={styles.findBtnText}>Find Friends</Text>
                </TouchableOpacity>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <ConfirmModal
        visible={!!removeTarget}
        onClose={() => !removing && setRemoveTarget(null)}
        onConfirm={async () => {
          if (!removeTarget || !user) return;
          setRemoving(true);
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await removeFriend(user.uid, removeTarget.userId);
            setRemoveTarget(null);
          } finally {
            setRemoving(false);
          }
        }}
        title="Remove Friend"
        message={`Remove @${removeTarget?.username} from your friends?`}
        confirmLabel="Remove"
        iconName="user-minus"
        loading={removing}
      />
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  headerActions: { flexDirection: "row", gap: 10, alignItems: "center" },
  iconBtn: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center", justifyContent: "center",
  },
  addBtn: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: "center", justifyContent: "center",
  },
  badge: {
    position: "absolute", top: -4, right: -4,
    minWidth: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  list: { gap: 10 },
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
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 2,
  },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  username: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 1 },
  statusText: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
  center: {
    flex: 1, alignItems: "center", justifyContent: "center",
    gap: 12, paddingTop: 100,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptyText: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    textAlign: "center", maxWidth: 260,
  },
  findBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 24, paddingVertical: 13,
    borderRadius: 22, marginTop: 4,
  },
  findBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
