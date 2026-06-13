import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
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
import { useTheme } from '@/context/ThemeContext';
import {
  GameChatMessage,
  getUserProfile,
  sendGameMessage,
  subscribeToGameMessages,
  UserProfile,
} from '@/lib/firestore';

interface Props {
  roomId: string;
  userId: string;
  isVisible: boolean;
  onClose: () => void;
}

function fmtTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

const EMOJI_ONLY_RE = /^[\p{Emoji_Presentation}\uFE0F\u200D\u20E3\s]+$/u;
function isEmojiOnly(text: string): boolean {
  return text.trim().length > 0 && EMOJI_ONLY_RE.test(text.trim());
}

function MsgRow({ msg, isMe, isDark }: { msg: GameChatMessage; isMe: boolean; isDark: boolean }) {
  const bubbleBg = isMe ? '#8B5CF6' : isDark ? '#2A2A2A' : '#F3F4F6';
  const textColor = isMe ? '#FFFFFF' : isDark ? '#F9FAFB' : '#111827';
  const metaColor = isDark ? '#6B7280' : '#9CA3AF';

  return (
    <View style={[s.row, isMe && s.rowMe]}>
      {!isMe && (
        <ProfileAvatar uri={msg.senderPhoto ?? undefined} name={msg.senderName} size={28} />
      )}
      <View style={[s.bubble, isMe && s.bubbleMe]}>
        {!isMe && (
          <Text style={[s.senderName, { color: metaColor }]}>{msg.senderName}</Text>
        )}
        {isEmojiOnly(msg.text ?? '') ? (
          <Text style={[s.emojiBubble, isMe ? s.emojiBubbleRight : s.emojiBubbleLeft]}>
            {msg.text}
          </Text>
        ) : (
          <View style={[s.bubbleBox, { backgroundColor: bubbleBg }]}>
            <Text style={[s.bubbleText, { color: textColor }]}>{msg.text}</Text>
          </View>
        )}
        <Text style={[s.ts, { color: metaColor }, isMe && s.tsMe]}>{fmtTime(msg.timestamp)}</Text>
      </View>
    </View>
  );
}

export function GameChatPanel({ roomId, userId, isVisible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [messages, setMessages] = useState<GameChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!userId) return;
    getUserProfile(userId).then(setMyProfile);
  }, [userId]);

  useEffect(() => {
    if (!isVisible || !roomId) return;
    return subscribeToGameMessages(roomId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
    });
  }, [isVisible, roomId]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText('');
    try {
      await sendGameMessage(
        roomId,
        userId,
        myProfile?.name || myProfile?.username || 'Player',
        myProfile?.photo ?? undefined,
        trimmed
      );
    } catch {
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }, [text, sending, roomId, userId, myProfile]);

  const bg = isDark ? '#111111' : '#FFFFFF';
  const headerBg = isDark ? '#1C1C1E' : '#F2F2F7';
  const inputBg = isDark ? '#2C2C2E' : '#EFEFF4';
  const titleColor = isDark ? '#FFFFFF' : '#111827';
  const placeholderColor = isDark ? '#6B7280' : '#9CA3AF';

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={s.backdrop} pointerEvents="box-none">
        <TouchableOpacity style={s.backdropHit} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[s.sheet, { backgroundColor: bg, paddingBottom: insets.bottom + 8 }]}
        >
          <View style={[s.header, { backgroundColor: headerBg }]}>
            <View style={s.handle} />
            <View style={s.headerRow}>
              <Ionicons name="chatbubbles" size={17} color="#8B5CF6" />
              <Text style={[s.headerTitle, { color: titleColor }]}>Match Chat</Text>
              <TouchableOpacity onPress={onClose} hitSlop={12}>
                <Ionicons name="close" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={(m) => m.messageId}
            contentContainerStyle={s.list}
            renderItem={({ item }) => (
              <MsgRow msg={item} isMe={item.senderId === userId} isDark={isDark} />
            )}
            onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <Text style={[s.empty, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
                No messages yet — say hi to your opponents!
              </Text>
            }
          />

          <View style={[s.inputRow, { backgroundColor: headerBg }]}>
            <TextInput
              style={[s.input, { backgroundColor: inputBg, color: titleColor }]}
              value={text}
              onChangeText={setText}
              placeholder="Message…"
              placeholderTextColor={placeholderColor}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              maxLength={300}
            />
            <TouchableOpacity
              style={[s.sendBtn, { opacity: text.trim() && !sending ? 1 : 0.4 }]}
              onPress={handleSend}
              disabled={!text.trim() || sending}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  backdropHit: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    maxHeight: '68%',
    minHeight: 300,
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
  headerTitle: {
    flex: 1, fontSize: 15, fontFamily: 'Inter_600SemiBold',
  },
  list: { padding: 12, paddingBottom: 4, flexGrow: 1 },
  row: {
    flexDirection: 'row', alignItems: 'flex-end',
    gap: 7, marginBottom: 10,
  },
  rowMe: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '75%' },
  bubbleMe: { alignItems: 'flex-end' },
  senderName: { fontSize: 11, fontFamily: 'Inter_500Medium', marginBottom: 2, marginLeft: 2 },
  bubbleBox: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10 },
  bubbleText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  emojiBubble: { fontSize: 36, lineHeight: 46, paddingVertical: 2 },
  emojiBubbleRight: { textAlign: 'right' as const },
  emojiBubbleLeft: { textAlign: 'left' as const },
  ts: { fontSize: 10, marginTop: 3, marginLeft: 2, fontFamily: 'Inter_400Regular' },
  tsMe: { textAlign: 'right', marginRight: 2 },
  empty: {
    textAlign: 'center', paddingTop: 40,
    fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20,
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
