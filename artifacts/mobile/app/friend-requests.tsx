import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import {
  FriendRequest,
  subscribeToFriendRequests,
  respondToRequest,
  markNotificationsReadByType,
} from "@/lib/firestore";
import { useColors } from "@/hooks/useColors";

export default function FriendRequestsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  // Realtime listener for pending requests
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToFriendRequests(user.uid, (list) => {
      setRequests(list);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  // Mark friend_request notifications as read when screen opens
  useEffect(() => {
    if (!user) return;
    markNotificationsReadByType(user.uid, ["friend_request"]).catch(() => {});
  }, [user]);

  async function handle(req: FriendRequest, accept: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProcessing((prev) => ({ ...prev, [req.requestId]: true }));
    try {
      await respondToRequest(req.requestId, accept, user!.uid, req);
      // List updates automatically via realtime listener
    } catch {
      /* ignore */
    } finally {
      setProcessing((prev) => ({ ...prev, [req.requestId]: false }));
    }
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
            Friend Requests{requests.length > 0 ? ` (${requests.length})` : ""}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(r) => r.requestId}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const busy = processing[item.requestId];
              return (
                <View
                  style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <TouchableOpacity
                    style={styles.cardLeft}
                    onPress={() => router.push(`/user/${item.senderId}`)}
                    activeOpacity={0.8}
                  >
                    <ProfileAvatar uri={item.senderPhoto} size={52} name={item.senderName} />
                    <View>
                      <Text style={[styles.name, { color: colors.foreground }]}>
                        {item.senderName}
                      </Text>
                      <Text style={[styles.username, { color: colors.mutedForeground }]}>
                        @{item.senderUsername}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.btns}>
                    <TouchableOpacity
                      style={[styles.acceptBtn, { backgroundColor: "#10B981" }]}
                      onPress={() => handle(item, true)}
                      disabled={busy}
                      activeOpacity={0.8}
                    >
                      {busy ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Feather name="check" size={16} color="#fff" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.rejectBtn, { backgroundColor: colors.destructive + "22", borderColor: colors.destructive + "44" }]}
                      onPress={() => handle(item, false)}
                      disabled={busy}
                      activeOpacity={0.8}
                    >
                      <Feather name="x" size={16} color={colors.destructive} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.center}>
                <Feather name="user-plus" size={44} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  No pending requests
                </Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Friend requests you receive will appear here
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
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
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
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  username: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  btns: { flexDirection: "row", gap: 8 },
  acceptBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },
  rejectBtn: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 80 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
