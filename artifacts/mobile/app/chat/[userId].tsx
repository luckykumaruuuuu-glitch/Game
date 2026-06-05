import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  ChatMessage,
  UserProfile,
  getChatId,
  getUserProfile,
  sendMessage,
  subscribeToMessages,
} from "@/lib/firestore";
import { useColors } from "@/hooks/useColors";

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userId: otherUserId } = useLocalSearchParams<{ userId: string }>();
  const { user } = useAuth();
  const [otherProfile, setOtherProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const chatId = getChatId(user?.uid ?? "", otherUserId ?? "");

  useEffect(() => {
    if (!otherUserId) return;
    getUserProfile(otherUserId).then(setOtherProfile);
  }, [otherUserId]);

  useEffect(() => {
    if (!chatId) return;
    const unsub = subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return unsub;
  }, [chatId]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || !user || sending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSending(true);
    setText("");
    try {
      await sendMessage(chatId, user.uid, trimmed, [user.uid, otherUserId!]);
    } catch {
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }, [text, user, chatId, otherUserId, sending]);

  const isMe = (msg: ChatMessage) => msg.senderId === user?.uid;

  return (
    <ThemedBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 12,
              backgroundColor: colors.card,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.background }]}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerProfile}
            onPress={() => router.push(`/user/${otherUserId}`)}
            activeOpacity={0.8}
          >
            <ProfileAvatar uri={otherProfile?.photo} size={36} name={otherProfile?.name} />
            <View>
              <Text style={[styles.headerName, { color: colors.foreground }]} numberOfLines={1}>
                {otherProfile?.name ?? "..."}
              </Text>
              <Text style={[styles.headerUsername, { color: colors.mutedForeground }]}>
                @{otherProfile?.username ?? ""}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.messageId}
          contentContainerStyle={[styles.messageList, { paddingBottom: 20 }]}
          renderItem={({ item, index }) => {
            const mine = isMe(item);
            const prevMsg = messages[index - 1];
            const showTime =
              !prevMsg || item.timestamp - prevMsg.timestamp > 5 * 60 * 1000;
            return (
              <View>
                {showTime && (
                  <Text style={[styles.timeLabel, { color: colors.mutedForeground }]}>
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                )}
                <View
                  style={[
                    styles.msgRow,
                    mine ? styles.msgRowRight : styles.msgRowLeft,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      mine
                        ? [styles.myBubble, { backgroundColor: colors.primary }]
                        : [styles.theirBubble, { backgroundColor: colors.card, borderColor: colors.border }],
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        { color: mine ? "#fff" : colors.foreground },
                      ]}
                    >
                      {item.text}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={[styles.emptyChatText, { color: colors.mutedForeground }]}>
                No messages yet. Say hello! 👋
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <View
          style={[
            styles.inputBar,
            {
              paddingBottom: insets.bottom + 12,
              backgroundColor: colors.card,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { color: colors.foreground, backgroundColor: colors.input, borderColor: colors.border },
            ]}
            placeholder="Type a message..."
            placeholderTextColor={colors.mutedForeground}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              { backgroundColor: text.trim() ? colors.primary : colors.secondary },
            ]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="send" size={18} color={text.trim() ? "#fff" : colors.mutedForeground} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  headerProfile: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  headerUsername: { fontSize: 12, fontFamily: "Inter_400Regular" },
  messageList: { paddingHorizontal: 16, paddingTop: 16, gap: 4 },
  timeLabel: {
    fontSize: 11, fontFamily: "Inter_400Regular",
    textAlign: "center", marginVertical: 8,
  },
  msgRow: { flexDirection: "row", marginVertical: 2 },
  msgRowRight: { justifyContent: "flex-end" },
  msgRowLeft: { justifyContent: "flex-start" },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myBubble: { borderBottomRightRadius: 4 },
  theirBubble: { borderBottomLeftRadius: 4, borderWidth: StyleSheet.hairlineWidth },
  bubbleText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 20 },
  emptyChat: { flex: 1, alignItems: "center", paddingTop: 60 },
  emptyChatText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    maxHeight: 120,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: "center", justifyContent: "center",
  },
});
