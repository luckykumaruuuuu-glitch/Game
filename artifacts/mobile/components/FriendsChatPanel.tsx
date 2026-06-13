import { Ionicons, Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { RoomInviteCard } from '@/components/RoomInviteCard';
import { useTheme } from '@/context/ThemeContext';
import {
  ChatMessage,
  ChatRoom,
  UserProfile,
  getChatId,
  getUserProfile,
  markChatRead,
  sendMessage,
  subscribeToMessages,
  subscribeToUserChats,
} from '@/lib/firestore';

interface Props {
  userId: string;
  isVisible: boolean;
  onClose: () => void;
}

function timeLabel(ts: number): string {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function fmtTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

interface ActiveConvo {
  chatId: string;
  otherId: string;
  otherProfile: UserProfile;
}

function ConvoList({
  userId, isDark, onOpen,
}: {
  userId: string; isDark: boolean; onOpen: (c: ActiveConvo) => void;
}) {
  const [rooms, setRooms] = useState<(ChatRoom & { profile?: UserProfile | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const titleColor = isDark ? '#FFFFFF' : '#111827';
  const subColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#2A2A2A' : '#F3F4F6';

  useEffect(() => {
    return subscribeToUserChats(userId, async (r) => {
      const withP = await Promise.all(
        r.map(async (room) => {
          const otherId = room.participants.find((p) => p !== userId);
          if (!otherId) return { ...room, profile: null };
          const profile = await getUserProfile(otherId);
          return { ...room, profile };
        })
      );
      setRooms(withP);
      setLoading(false);
    });
  }, [userId]);

  if (loading) {
    return (
      <View style={cl.centered}>
        <ActivityIndicator color="#8B5CF6" />
      </View>
    );
  }

  if (!rooms.length) {
    return (
      <View style={cl.centered}>
        <Text style={[cl.empty, { color: subColor }]}>No conversations yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={rooms}
      keyExtractor={(r) => r.chatId}
      renderItem={({ item }) => {
        const otherId = item.participants.find((p) => p !== userId);
        if (!otherId || !item.profile) return null;
        const unread =
          item.lastTimestamp && item.lastSenderId !== userId
            ? !(item.lastSeenBy?.[userId] && item.lastSeenBy[userId] >= (item.lastTimestamp ?? 0))
            : false;
        return (
          <TouchableOpacity
            style={[cl.item, { borderBottomColor: borderColor }]}
            onPress={() =>
              onOpen({ chatId: item.chatId, otherId, otherProfile: item.profile! })
            }
            activeOpacity={0.7}
          >
            <ProfileAvatar uri={item.profile.photo ?? undefined} name={item.profile.name || item.profile.username} size={42} />
            <View style={cl.itemMid}>
              <Text style={[cl.itemName, { color: titleColor }]} numberOfLines={1}>
                {item.profile.name || item.profile.username}
              </Text>
              <Text style={[cl.itemMsg, { color: subColor }]} numberOfLines={1}>
                {item.lastMessage || ''}
              </Text>
            </View>
            <View style={cl.itemRight}>
              <Text style={[cl.itemTime, { color: subColor }]}>
                {timeLabel(item.lastTimestamp ?? 0)}
              </Text>
              {unread && <View style={cl.dot} />}
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

function ChatView({
  userId, convo, isDark, onBack,
}: {
  userId: string; convo: ActiveConvo; isDark: boolean; onBack: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const titleColor = isDark ? '#FFFFFF' : '#111827';
  const subColor = isDark ? '#9CA3AF' : '#6B7280';
  const inputBg = isDark ? '#2C2C2E' : '#EFEFF4';
  const headerBg = isDark ? '#1C1C1E' : '#F2F2F7';

  useEffect(() => {
    markChatRead(convo.chatId, userId).catch(() => {});
    return subscribeToMessages(convo.chatId, userId, null, (msgs) => {
      setMessages(msgs);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
    });
  }, [convo.chatId, userId]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText('');
    try {
      await sendMessage(convo.chatId, userId, trimmed, [userId, convo.otherId]);
    } catch {
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }, [text, sending, convo, userId]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={[cv.header, { backgroundColor: headerBg }]}>
        <TouchableOpacity onPress={onBack} hitSlop={12} style={cv.backBtn}>
          <Ionicons name="chevron-back" size={22} color={isDark ? '#FFFFFF' : '#111827'} />
        </TouchableOpacity>
        <ProfileAvatar uri={convo.otherProfile.photo ?? undefined} name={convo.otherProfile.name || convo.otherProfile.username} size={32} />
        <Text style={[cv.headerName, { color: titleColor }]} numberOfLines={1}>
          {convo.otherProfile.name || convo.otherProfile.username}
        </Text>
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(m) => m.messageId ?? String(m.timestamp)}
        contentContainerStyle={cv.list}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const isMe = item.senderId === userId;
          const bubbleBg = isMe ? '#8B5CF6' : isDark ? '#2A2A2A' : '#F3F4F6';
          const textColor = isMe ? '#FFFFFF' : isDark ? '#F9FAFB' : '#111827';
          const deleted = item.deletedForEveryone || item.deletedFor?.includes(userId);

          // ── Room invite card ────────────────────────────────
          if (!deleted && item.type === 'room_invite' && item.roomId) {
            return (
              <View style={[cv.row, isMe && cv.rowMe]}>
                <View>
                  <RoomInviteCard roomId={item.roomId} isMine={isMe} isDark={isDark} />
                  <Text style={[cv.ts, { color: subColor }, isMe && cv.tsMe]}>
                    {fmtTime(item.timestamp)}
                  </Text>
                </View>
              </View>
            );
          }

          return (
            <View style={[cv.row, isMe && cv.rowMe]}>
              <View style={[cv.bubbleBox, { backgroundColor: bubbleBg }]}>
                <Text
                  style={[
                    cv.bubbleText,
                    { color: deleted ? (isDark ? '#6B7280' : '#9CA3AF') : textColor },
                    deleted && cv.deleted,
                  ]}
                >
                  {deleted ? 'Message deleted' : item.text}
                </Text>
              </View>
              <Text style={[cv.ts, { color: subColor }, isMe && cv.tsMe]}>
                {fmtTime(item.timestamp)}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={[cv.empty, { color: subColor }]}>
            No messages yet. Start the conversation!
          </Text>
        }
      />

      <View style={[cv.inputRow, { backgroundColor: headerBg }]}>
        <TextInput
          style={[cv.input, { backgroundColor: inputBg, color: titleColor }]}
          value={text}
          onChangeText={setText}
          placeholder="Message…"
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          maxLength={1000}
        />
        <TouchableOpacity
          style={[cv.sendBtn, { opacity: text.trim() && !sending ? 1 : 0.4 }]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

export function FriendsChatPanel({ userId, isVisible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [activeConvo, setActiveConvo] = useState<ActiveConvo | null>(null);

  const bg = isDark ? '#111111' : '#FFFFFF';
  const headerBg = isDark ? '#1C1C1E' : '#F2F2F7';
  const titleColor = isDark ? '#FFFFFF' : '#111827';

  function handleClose() {
    setActiveConvo(null);
    onClose();
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={activeConvo ? () => setActiveConvo(null) : handleClose}
      statusBarTranslucent
    >
      <View style={s.backdrop} pointerEvents="box-none">
        <TouchableOpacity style={s.backdropHit} activeOpacity={1} onPress={handleClose} />
        <View
          style={[s.sheet, { backgroundColor: bg, paddingBottom: insets.bottom + 8 }]}
        >
          <View style={[s.header, { backgroundColor: headerBg }]}>
            <View style={s.handle} />
            <View style={s.headerRow}>
              {activeConvo ? (
                <TouchableOpacity onPress={() => setActiveConvo(null)} hitSlop={12}>
                  <Ionicons name="chevron-back" size={20} color={isDark ? '#FFFFFF' : '#111827'} />
                </TouchableOpacity>
              ) : (
                <Ionicons name="people" size={17} color="#8B5CF6" />
              )}
              <Text style={[s.headerTitle, { color: titleColor }]}>
                {activeConvo
                  ? (activeConvo.otherProfile.name || activeConvo.otherProfile.username)
                  : 'Friends Chat'}
              </Text>
              <TouchableOpacity onPress={handleClose} hitSlop={12}>
                <Ionicons name="close" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            {activeConvo ? (
              <ChatView
                userId={userId}
                convo={activeConvo}
                isDark={isDark}
                onBack={() => setActiveConvo(null)}
              />
            ) : (
              <ConvoList userId={userId} isDark={isDark} onOpen={setActiveConvo} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  backdropHit: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    height: '72%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(128,128,128,0.35)',
    alignSelf: 'center',
    marginTop: 10, marginBottom: 2,
  },
  header: { paddingBottom: 10 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingTop: 4,
  },
  headerTitle: { flex: 1, fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});

const cl = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  empty: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  item: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemMid: { flex: 1 },
  itemName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  itemMsg: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  itemRight: { alignItems: 'flex-end', gap: 4 },
  itemTime: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
});

const cv = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, paddingHorizontal: 14, paddingVertical: 10,
  },
  backBtn: { marginRight: 2 },
  headerName: { flex: 1, fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  list: { padding: 12, paddingBottom: 4, flexGrow: 1 },
  row: { flexDirection: 'row', marginBottom: 10 },
  rowMe: { justifyContent: 'flex-end' },
  bubbleBox: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7, maxWidth: '75%' },
  bubbleText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  deleted: { fontStyle: 'italic' },
  ts: { fontSize: 10, marginTop: 3, marginHorizontal: 4, alignSelf: 'flex-end', fontFamily: 'Inter_400Regular' },
  tsMe: { textAlign: 'right' },
  empty: {
    textAlign: 'center', paddingTop: 40,
    fontSize: 13, fontFamily: 'Inter_400Regular',
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, paddingHorizontal: 12, paddingVertical: 10,
  },
  input: {
    flex: 1, borderRadius: 22,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 10 : 7,
    fontSize: 14, fontFamily: 'Inter_400Regular',
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#8B5CF6',
    alignItems: 'center', justifyContent: 'center',
  },
});
