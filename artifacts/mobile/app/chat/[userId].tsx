import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
import { ChatActionMenu } from "@/components/ChatActionMenu";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";
import {
  ChatMessage,
  UserProfile,
  getChatId,
  getUserProfile,
  sendMessage,
  subscribeToMessages,
  subscribeToTyping,
  setTypingStatus,
  markChatRead,
  markNotificationsReadByType,
  deleteMessageForMe,
  deleteMessageForEveryone,
  deleteChatForMe,
  subscribeToChatClearedAt,
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
  const [otherTyping, setOtherTyping] = useState(false);
  const [clearedBefore, setClearedBefore] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Action menu
  const [activeMsg, setActiveMsg] = useState<ChatMessage | null>(null);

  // Multi-select
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Confirmation modals
  const [deleteForMePending, setDeleteForMePending] = useState<ChatMessage | null>(null);
  const [deleteForEveryonePending, setDeleteForEveryonePending] = useState<ChatMessage | null>(null);
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false);
  const [showDeleteMultiModal, setShowDeleteMultiModal] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState("");
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Loading states
  const [deleting, setDeleting] = useState(false);
  const [deletingChat, setDeletingChat] = useState(false);

  const chatId = getChatId(user?.uid ?? "", otherUserId ?? "");

  useEffect(() => {
    if (!otherUserId) return;
    getUserProfile(otherUserId).then(setOtherProfile);
  }, [otherUserId]);

  // Subscribe to chat clearedAt for this user
  useEffect(() => {
    if (!chatId || !user) return;
    return subscribeToChatClearedAt(chatId, user.uid, setClearedBefore);
  }, [chatId, user]);

  // Subscribe to messages (with deletedFor + clearedBefore filters)
  useEffect(() => {
    if (!chatId || !user) return;
    const unsub = subscribeToMessages(chatId, user.uid, clearedBefore, (msgs) => {
      setMessages(msgs);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
    });
    return unsub;
  }, [chatId, user, clearedBefore]);

  // Subscribe to typing indicator
  useEffect(() => {
    if (!chatId || !user) return;
    return subscribeToTyping(chatId, user.uid, setOtherTyping);
  }, [chatId, user]);

  // Mark chat as read and clear message notifications on open
  useEffect(() => {
    if (!chatId || !user) return;
    markChatRead(chatId, user.uid).catch(() => {});
    markNotificationsReadByType(user.uid, ["message"]).catch(() => {});
  }, [chatId, user]);

  // Clear typing status on unmount
  useEffect(() => {
    return () => {
      if (user && chatId) {
        setTypingStatus(chatId, user.uid, false).catch(() => {});
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [chatId, user]);

  // ── Toast ──────────────────────────────────────────────────────────────────
  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastOpacity.setValue(0);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      toastTimer.current = setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setToastMsg(""));
      }, 1800);
    });
  }

  // ── Input ──────────────────────────────────────────────────────────────────
  function handleTextChange(val: string) {
    setText(val);
    if (!user || !chatId) return;
    setTypingStatus(chatId, user.uid, true).catch(() => {});
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(chatId, user.uid, false).catch(() => {});
    }, 3000);
  }

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || !user || sending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSending(true);
    setText("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setTypingStatus(chatId, user.uid, false).catch(() => {});
    try {
      await sendMessage(chatId, user.uid, trimmed, [user.uid, otherUserId!]);
      markChatRead(chatId, user.uid).catch(() => {});
    } catch {
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }, [text, user, chatId, otherUserId, sending]);

  // ── Multi-select helpers ───────────────────────────────────────────────────
  function exitMultiSelect() {
    setMultiSelect(false);
    setSelectedIds(new Set());
  }

  function toggleSelection(msgId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  }

  function handleLongPress(msg: ChatMessage) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (multiSelect) {
      toggleSelection(msg.messageId);
    } else {
      setActiveMsg(msg);
    }
  }

  function handleTap(msg: ChatMessage) {
    if (multiSelect) {
      Haptics.selectionAsync();
      toggleSelection(msg.messageId);
    }
  }

  // ── Copy ──────────────────────────────────────────────────────────────────
  async function copyMessage(msg: ChatMessage) {
    await Clipboard.setStringAsync(msg.text);
    showToast("Message copied");
  }

  async function copySelected() {
    const texts = messages
      .filter((m) => selectedIds.has(m.messageId))
      .map((m) => m.text)
      .join("\n");
    await Clipboard.setStringAsync(texts);
    showToast(`${selectedIds.size} message${selectedIds.size > 1 ? "s" : ""} copied`);
    exitMultiSelect();
  }

  // ── Delete For Me ──────────────────────────────────────────────────────────
  async function confirmDeleteForMe(msg: ChatMessage) {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteMessageForMe(chatId, msg.messageId, user.uid);
      setDeleteForMePending(null);
    } finally {
      setDeleting(false);
    }
  }

  async function confirmDeleteMultiForMe() {
    if (!user) return;
    setDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          deleteMessageForMe(chatId, id, user.uid)
        )
      );
      setShowDeleteMultiModal(false);
      exitMultiSelect();
    } finally {
      setDeleting(false);
    }
  }

  // ── Delete For Everyone ────────────────────────────────────────────────────
  async function confirmDeleteForEveryone(msg: ChatMessage) {
    setDeleting(true);
    try {
      await deleteMessageForEveryone(chatId, msg.messageId);
      setDeleteForEveryonePending(null);
    } finally {
      setDeleting(false);
    }
  }

  // ── Delete Chat ────────────────────────────────────────────────────────────
  async function confirmDeleteChat() {
    if (!user) return;
    setDeletingChat(true);
    try {
      await deleteChatForMe(chatId, user.uid);
      setShowDeleteChatModal(false);
    } finally {
      setDeletingChat(false);
    }
  }

  const isMe = (msg: ChatMessage) => msg.senderId === user?.uid;

  return (
    <ThemedBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        {multiSelect ? (
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
              onPress={exitMultiSelect}
              style={[styles.backBtn, { backgroundColor: colors.background }]}
            >
              <Feather name="x" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.headerName, { color: colors.foreground, flex: 1 }]}>
              {selectedIds.size} selected
            </Text>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.background }]}
              onPress={copySelected}
              disabled={selectedIds.size === 0}
            >
              <Feather
                name="copy"
                size={18}
                color={selectedIds.size > 0 ? colors.foreground : colors.mutedForeground}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: "#FEE2E2" }]}
              onPress={() => {
                if (selectedIds.size > 0) setShowDeleteMultiModal(true);
              }}
              disabled={selectedIds.size === 0}
            >
              <Feather
                name="trash-2"
                size={18}
                color={selectedIds.size > 0 ? "#EF4444" : colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>
        ) : (
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
                {otherTyping ? (
                  <Text style={[styles.typingText, { color: colors.primary }]}>Typing...</Text>
                ) : (
                  <Text style={[styles.headerUsername, { color: colors.mutedForeground }]}>
                    @{otherProfile?.username ?? ""}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.background }]}
              onPress={() => setShowDeleteChatModal(true)}
            >
              <Feather name="trash" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Messages ────────────────────────────────────────────────────── */}
        <View style={{ flex: 1 }}>
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
              const isSelected = selectedIds.has(item.messageId);
              const isDeleted = !!item.deletedForEveryone;

              return (
                <TouchableOpacity
                  activeOpacity={multiSelect ? 0.6 : 1}
                  onPress={() => handleTap(item)}
                  onLongPress={() => handleLongPress(item)}
                  delayLongPress={320}
                >
                  {/* Selection highlight */}
                  {multiSelect && isSelected && (
                    <View
                      style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: colors.primary + "22", borderRadius: 8 },
                      ]}
                    />
                  )}

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
                    {/* Multi-select checkbox */}
                    {multiSelect && (
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: colors.primary,
                            backgroundColor: isSelected ? colors.primary : "transparent",
                          },
                        ]}
                      >
                        {isSelected && (
                          <Feather name="check" size={11} color="#fff" />
                        )}
                      </View>
                    )}

                    <View
                      style={[
                        styles.bubble,
                        mine
                          ? [
                              styles.myBubble,
                              isDeleted
                                ? { backgroundColor: colors.card, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth }
                                : { backgroundColor: colors.primary },
                            ]
                          : [styles.theirBubble, { backgroundColor: colors.card, borderColor: colors.border }],
                      ]}
                    >
                      <Text
                        style={[
                          styles.bubbleText,
                          {
                            color: isDeleted
                              ? colors.mutedForeground
                              : mine
                              ? "#fff"
                              : colors.foreground,
                            fontStyle: isDeleted ? "italic" : "normal",
                          },
                        ]}
                      >
                        {isDeleted
                          ? mine
                            ? "You deleted this message"
                            : "This message was deleted"
                          : item.text}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
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

          {/* Toast */}
          {toastMsg ? (
            <Animated.View
              style={[
                styles.toast,
                { backgroundColor: colors.foreground, opacity: toastOpacity },
              ]}
              pointerEvents="none"
            >
              <Text style={[styles.toastText, { color: colors.background }]}>
                {toastMsg}
              </Text>
            </Animated.View>
          ) : null}
        </View>

        {/* ── Input ───────────────────────────────────────────────────────── */}
        {!multiSelect && (
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
              onChangeText={handleTextChange}
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
        )}
      </KeyboardAvoidingView>

      {/* ── Action Menu ──────────────────────────────────────────────────────── */}
      <ChatActionMenu
        visible={!!activeMsg}
        message={activeMsg}
        isMyMessage={activeMsg ? isMe(activeMsg) : false}
        onClose={() => setActiveMsg(null)}
        onCopy={() => {
          if (activeMsg) copyMessage(activeMsg);
          setActiveMsg(null);
        }}
        onDeleteForMe={() => {
          setDeleteForMePending(activeMsg);
          setActiveMsg(null);
        }}
        onDeleteForEveryone={() => {
          setDeleteForEveryonePending(activeMsg);
          setActiveMsg(null);
        }}
        onSelectMode={() => {
          if (activeMsg) {
            setMultiSelect(true);
            setSelectedIds(new Set([activeMsg.messageId]));
          }
          setActiveMsg(null);
        }}
      />

      {/* ── Confirm: Delete For Me ────────────────────────────────────────────── */}
      <ConfirmModal
        visible={!!deleteForMePending}
        onClose={() => !deleting && setDeleteForMePending(null)}
        onConfirm={() => { if (deleteForMePending) confirmDeleteForMe(deleteForMePending); }}
        title="Delete For Me"
        message="Delete this message from your chat? The other person will still see it."
        confirmLabel="Delete"
        iconName="trash-2"
        loading={deleting}
      />

      {/* ── Confirm: Delete For Everyone ─────────────────────────────────────── */}
      <ConfirmModal
        visible={!!deleteForEveryonePending}
        onClose={() => !deleting && setDeleteForEveryonePending(null)}
        onConfirm={() => { if (deleteForEveryonePending) confirmDeleteForEveryone(deleteForEveryonePending); }}
        title="Delete For Everyone"
        message="Delete this message for everyone? This cannot be undone."
        confirmLabel="Delete"
        iconName="alert-octagon"
        loading={deleting}
      />

      {/* ── Confirm: Delete Selected For Me ──────────────────────────────────── */}
      <ConfirmModal
        visible={showDeleteMultiModal}
        onClose={() => !deleting && setShowDeleteMultiModal(false)}
        onConfirm={confirmDeleteMultiForMe}
        title="Delete For Me"
        message={`Delete ${selectedIds.size} message${selectedIds.size > 1 ? "s" : ""} from your chat?`}
        confirmLabel="Delete"
        iconName="trash-2"
        loading={deleting}
      />

      {/* ── Confirm: Delete Chat ──────────────────────────────────────────────── */}
      <ConfirmModal
        visible={showDeleteChatModal}
        onClose={() => !deletingChat && setShowDeleteChatModal(false)}
        onConfirm={confirmDeleteChat}
        title="Delete Chat"
        message="Clear your entire chat history? The other person's messages will remain untouched."
        confirmLabel="Delete Chat"
        iconName="trash"
        loading={deletingChat}
      />
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
    gap: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  headerProfile: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  headerUsername: { fontSize: 12, fontFamily: "Inter_400Regular" },
  typingText: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  messageList: { paddingHorizontal: 16, paddingTop: 16, gap: 4 },
  timeLabel: {
    fontSize: 11, fontFamily: "Inter_400Regular",
    textAlign: "center", marginVertical: 8,
  },
  msgRow: { flexDirection: "row", marginVertical: 2, alignItems: "flex-end", gap: 8 },
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
  checkbox: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
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
  toast: {
    position: "absolute",
    alignSelf: "center",
    bottom: 12,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
