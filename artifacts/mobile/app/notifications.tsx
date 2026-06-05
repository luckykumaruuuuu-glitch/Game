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
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import {
  Notification,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/firestore";
import { useColors } from "@/hooks/useColors";

const NOTIF_ICONS: Record<Notification["type"], string> = {
  friend_request: "user-plus",
  friend_accepted: "user-check",
  message: "message-circle",
  game_invite: "target",
  general: "bell",
};

const NOTIF_COLORS: Record<Notification["type"], string> = {
  friend_request: "#7C3AED",
  friend_accepted: "#10B981",
  message: "#06B6D4",
  game_invite: "#F59E0B",
  general: "#6B7280",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { allNotifications, ready } = useNotifications();
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!user || !ready) return;
    const hasUnread = allNotifications.some((n) => !n.read);
    if (!hasUnread) return;
    const timer = setTimeout(async () => {
      try {
        await markAllNotificationsRead(user.uid);
      } catch { /* ignore */ }
    }, 1500);
    return () => clearTimeout(timer);
  }, [user, ready, allNotifications.length]);

  async function handleTap(notif: Notification) {
    if (!notif.read) {
      markNotificationRead(notif.notifId).catch(() => {});
    }
    if (notif.type === "friend_request") {
      router.push("/friend-requests");
    } else if (notif.type === "message" && notif.fromUserId) {
      router.push(`/chat/${notif.fromUserId}`);
    } else if (notif.type === "game_invite" && notif.fromUserId) {
      router.push("/ludo");
    } else if (notif.fromUserId) {
      router.push(`/user/${notif.fromUserId}`);
    }
  }

  async function handleMarkAll() {
    if (!user || marking) return;
    setMarking(true);
    try {
      await markAllNotificationsRead(user.uid);
    } catch { /* ignore */ } finally {
      setMarking(false);
    }
  }

  const hasUnread = allNotifications.some((n) => !n.read);

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
          <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
          {hasUnread ? (
            <TouchableOpacity onPress={handleMarkAll} disabled={marking}>
              <Text style={[styles.markAll, { color: colors.primary }]}>
                {marking ? "..." : "Mark all read"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 80 }} />
          )}
        </View>

        {!ready ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={allNotifications}
            keyExtractor={(n) => n.notifId}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const iconColor = NOTIF_COLORS[item.type] ?? "#6B7280";
              return (
                <TouchableOpacity
                  style={[
                    styles.notifCard,
                    {
                      backgroundColor: item.read ? colors.card : colors.primary + "11",
                      borderColor: item.read ? colors.border : colors.primary + "33",
                    },
                  ]}
                  onPress={() => handleTap(item)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconWrap, { backgroundColor: iconColor + "22" }]}>
                    <Feather name={NOTIF_ICONS[item.type] as any} size={20} color={iconColor} />
                  </View>
                  <View style={styles.notifContent}>
                    <Text style={[styles.notifTitle, { color: colors.foreground }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.notifBody, { color: colors.mutedForeground }]}>
                      {item.body}
                    </Text>
                    <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>
                      {timeAgo(item.createdAt)}
                    </Text>
                  </View>
                  {!item.read && (
                    <View style={[styles.unreadDot, { backgroundColor: "#EF4444" }]} />
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.center}>
                <Feather name="bell" size={44} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No notifications yet
                </Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  markAll: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  list: { gap: 10, paddingBottom: 40 },
  notifCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  notifContent: { flex: 1, gap: 3 },
  notifTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  notifBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  notifTime: { fontSize: 11, fontFamily: "Inter_400Regular" },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 80 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
