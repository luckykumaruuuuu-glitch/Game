import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { ChatRoom, subscribeToUserChats, getUserProfile } from "@/lib/firestore";
import { useColors } from "@/hooks/useColors";

function timeLabel(ts: number): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function ChatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserChats(user.uid, async (rooms) => {
      // Fetch profiles for rooms that don't have one yet
      const withProfiles = await Promise.all(
        rooms.map(async (room) => {
          const otherId = room.participants.find((p) => p !== user.uid);
          if (!otherId) return room;
          const profile = await getUserProfile(otherId);
          return { ...room, otherUserProfile: profile };
        })
      );
      setChats(withProfiles);
      setLoading(false);
    });
    return unsub;
  }, [user]);

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
          <Text style={[styles.title, { color: colors.foreground }]}>Messages</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(c) => c.chatId}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const otherId = item.participants.find((p) => p !== user?.uid) ?? "";
              const other = item.otherUserProfile;
              const lastSeenAt = item.lastSeenBy?.[user?.uid ?? ""] ?? 0;
              const hasUnread =
                item.lastTimestamp > lastSeenAt &&
                item.lastSenderId !== user?.uid;

              return (
                <TouchableOpacity
                  style={[styles.chatCard, {
                    backgroundColor: hasUnread ? colors.primary + "0D" : colors.card,
                    borderColor: hasUnread ? colors.primary + "44" : colors.border,
                  }]}
                  onPress={() => router.push(`/chat/${otherId}`)}
                  activeOpacity={0.8}
                >
                  <ProfileAvatar uri={other?.photo} size={52} name={other?.name} />
                  <View style={styles.chatInfo}>
                    <View style={styles.chatTop}>
                      <Text
                        style={[
                          styles.chatName,
                          { color: colors.foreground, fontFamily: hasUnread ? "Inter_700Bold" : "Inter_600SemiBold" },
                        ]}
                        numberOfLines={1}
                      >
                        {other?.name ?? "Unknown"}
                      </Text>
                      <Text style={[styles.chatTime, { color: colors.mutedForeground }]}>
                        {timeLabel(item.lastTimestamp)}
                      </Text>
                    </View>
                    <View style={styles.lastMsgRow}>
                      <Text
                        style={[
                          styles.lastMsg,
                          { color: hasUnread ? colors.foreground : colors.mutedForeground,
                            fontFamily: hasUnread ? "Inter_600SemiBold" : "Inter_400Regular" },
                        ]}
                        numberOfLines={1}
                      >
                        {item.lastMessage || "No messages yet"}
                      </Text>
                      {hasUnread && (
                        <View style={[styles.unreadDot, { backgroundColor: "#EF4444" }]} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.center}>
                <Feather name="message-circle" size={44} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No messages yet</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Add friends and start chatting
                </Text>
                <TouchableOpacity
                  style={[styles.findBtn, { backgroundColor: colors.primary }]}
                  onPress={() => router.push("/friends")}
                  activeOpacity={0.8}
                >
                  <Feather name="users" size={16} color="#fff" />
                  <Text style={styles.findBtnText}>View Friends</Text>
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
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  list: { gap: 8, paddingBottom: 40 },
  chatCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chatInfo: { flex: 1, gap: 4 },
  chatTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chatName: { fontSize: 15, flex: 1 },
  chatTime: { fontSize: 12, fontFamily: "Inter_400Regular" },
  lastMsgRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  lastMsg: { fontSize: 13, flex: 1 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4, flexShrink: 0,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 80 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  findBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, marginTop: 8,
  },
  findBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
