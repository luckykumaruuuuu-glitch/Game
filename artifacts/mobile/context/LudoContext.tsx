import React, {
  createContext, useContext, useRef, useState, useCallback, useEffect,
} from 'react';
import {
  View, Pressable, StyleSheet, Platform,
  StatusBar, ActivityIndicator, Text, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  subscribeToGameInvites,
  subscribeToGameRoom,
  subscribeToGameMessages,
  writeGameAction,
  GameAction,
} from '@/lib/firestore';
import { GameChatPanel } from '@/components/GameChatPanel';
import { FriendsChatPanel } from '@/components/FriendsChatPanel';
import { LUDO_GAME_HTML } from '@/lib/ludo/ludo-html';

interface LudoContextValue {
  show: () => void;
  hide: () => void;
  isVisible: boolean;
  startOnlineGame: (
    quickStartId: string,
    namesByPlayerIndex: string[],
    roomId?: string,
    myPlayerIndex?: number,
    userId?: string
  ) => void;
}

const LudoContext = createContext<LudoContextValue>({
  show: () => {},
  hide: () => {},
  isVisible: false,
  startOnlineGame: () => {},
});

export function useLudo() {
  return useContext(LudoContext);
}

// Build the JS string that starts the game and, optionally, activates multiplayer mode.
function buildStartGameJS(
  quickStartId: string,
  namesByPlayerIndex: string[],
  myPlayerIndex?: number
): string {
  const mpInit = typeof myPlayerIndex === 'number'
    ? `setTimeout(function(){if(typeof window._initMultiplayer==='function'){window._initMultiplayer(${myPlayerIndex});}},${ 800});`
    : '';
  return (
    `(function(){` +
      `try{` +
        `var fn=window._ludoDispatch||window.dispatch;` +
        `if(typeof fn==='function'){` +
          `fn({type:'START_GAME',quickStartId:${JSON.stringify(quickStartId)},namesByPlayerIndex:${JSON.stringify(namesByPlayerIndex)}});` +
          mpInit +
        `}else{` +
          `console.warn('[LeLudo] _ludoDispatch not ready');` +
        `}` +
      `}catch(e){console.warn('[LeLudo] startGame failed',String(e));}` +
    `})();true;`
  );
}

type PendingGame = {
  quickStartId: string;
  namesByPlayerIndex: string[];
  roomId?: string;
  myPlayerIndex?: number;
  userId?: string;
};

type MpConfig = {
  roomId: string;
  myPlayerIndex: number;
  userId: string;
};

const MP_COLORS = [
  { name: 'Yellow', emoji: '🟡' },
  { name: 'Green',  emoji: '🟢' },
  { name: 'Red',    emoji: '🔴' },
  { name: 'Blue',   emoji: '🔵' },
];

function LudoNativeOverlay({
  isVisible,
  onHide,
  pendingOnlineGame,
  gameStartTrigger,
}: {
  isVisible: boolean;
  onHide: () => void;
  pendingOnlineGame: React.MutableRefObject<PendingGame | null>;
  gameStartTrigger: number;
}) {
  const WebView = require('react-native-webview').WebView;
  const { resolvedTheme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const isDark = resolvedTheme === 'dark';
  const webViewRef = useRef<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [ludoScreen, setLudoScreen] = useState('home');
  const [pendingInvites, setPendingInvites] = useState(0);
  const resolvedThemeRef = useRef(resolvedTheme);
  const hasEverLoaded = useRef(false);

  // Multiplayer session state
  const [mpConfig, setMpConfig] = useState<MpConfig | null>(null);
  const mpConfigRef = useRef<MpConfig | null>(null);
  const [debugTurn, setDebugTurn] = useState(-1);
  const lastSeenSeqRef = useRef(0);
  const lastWrittenSeqRef = useRef(0);

  // Chat panel state
  const [showGameChat, setShowGameChat] = useState(false);
  const [showFriendsChat, setShowFriendsChat] = useState(false);
  const [gameChatUnread, setGameChatUnread] = useState(0);
  const gameChatMsgCountRef = useRef(0);

  // Helper: activate a new multiplayer session
  function activateMpConfig(cfg: MpConfig) {
    lastSeenSeqRef.current = 0;
    lastWrittenSeqRef.current = 0;
    gameChatMsgCountRef.current = 0;
    setGameChatUnread(0);
    setShowGameChat(false);
    mpConfigRef.current = cfg;
    setMpConfig(cfg);
    setDebugTurn(-1);
  }

  useEffect(() => {
    console.log('[GAME_SCREEN_MOUNTED] native WebView overlay mounted, isVisible=' + isVisible);
  }, []);

  useEffect(() => { resolvedThemeRef.current = resolvedTheme; }, [resolvedTheme]);

  // Track unread game chat messages while the panel is closed.
  useEffect(() => {
    if (!mpConfig) return;
    return subscribeToGameMessages(mpConfig.roomId, (msgs) => {
      if (showGameChat) {
        gameChatMsgCountRef.current = msgs.length;
        setGameChatUnread(0);
      } else {
        const newCount = msgs.length;
        const diff = newCount - gameChatMsgCountRef.current;
        // Only count messages from others, not from ourselves
        if (diff > 0) {
          const newMsgs = msgs.slice(gameChatMsgCountRef.current);
          const othersCount = newMsgs.filter((m) => m.senderId !== mpConfig.userId).length;
          if (othersCount > 0) setGameChatUnread((n) => n + othersCount);
        }
        gameChatMsgCountRef.current = newCount;
      }
    });
  }, [mpConfig, showGameChat]);

  // Subscribe to remote game actions via Firebase when a multiplayer session is active.
  useEffect(() => {
    if (!mpConfig) return;
    const unsub = subscribeToGameRoom(mpConfig.roomId, (room) => {
      if (!room?.lastAction) return;
      const action = room.lastAction;
      if (action.seq <= lastSeenSeqRef.current) return; // already processed
      lastSeenSeqRef.current = action.seq;
      if (action.actorId === mpConfig.userId) return; // own action — already applied
      const js =
        `(function(){try{` +
          `if(typeof window._applyRemoteAction==='function'){` +
            `window._applyRemoteAction(${JSON.stringify(action)});` +
          `}` +
        `}catch(e){console.warn('[MP]',String(e));}` +
        `})();true;`;
      setTimeout(() => { webViewRef.current?.injectJavaScript(js); }, 50);
    });
    return unsub;
  }, [mpConfig]);

  // When startOnlineGame is called and the WebView is already loaded, inject
  // the START_GAME command immediately (onLoadEnd won't fire a second time).
  useEffect(() => {
    if (gameStartTrigger === 0) return;
    if (!hasEverLoaded.current) return; // onLoadEnd will handle it
    if (!pendingOnlineGame.current) return;
    const { quickStartId, namesByPlayerIndex, roomId, myPlayerIndex, userId } = pendingOnlineGame.current;
    pendingOnlineGame.current = null;
    const js = buildStartGameJS(quickStartId, namesByPlayerIndex, myPlayerIndex);
    if (roomId && typeof myPlayerIndex === 'number' && userId) {
      activateMpConfig({ roomId, myPlayerIndex, userId });
    }
    setTimeout(() => { webViewRef.current?.injectJavaScript(js); }, 400);
  }, [gameStartTrigger]);

  useEffect(() => {
    if (!user) return;
    return subscribeToGameInvites(user.uid, (invites) => {
      setPendingInvites(invites.length);
    });
  }, [user]);

  const bgColor = isDark ? '#080808' : '#F5F5F7';

  const injectedJSBeforeLoad = useRef(
    `(function(){try{localStorage.setItem('theme','${resolvedTheme}');}catch(e){}})();true;`
  ).current;

  const injectTheme = useCallback((theme: string) => {
    webViewRef.current?.injectJavaScript(
      `(function(){try{` +
        `localStorage.setItem('theme','${theme}');` +
        `if(typeof updateTheme==='function'){updateTheme('${theme}');}` +
        `else{var r=document.documentElement;r.classList.remove('dark','light');r.classList.add('${theme}');}` +
      `}catch(e){}})();true;`
    );
  }, []);

  useEffect(() => {
    if (hasEverLoaded.current) {
      injectTheme(resolvedTheme);
    }
  }, [resolvedTheme, injectTheme]);

  const onMessage = useCallback((event: any) => {
    try {
      const data = typeof event.nativeEvent.data === 'string'
        ? JSON.parse(event.nativeEvent.data)
        : event.nativeEvent.data;
      if (data?.type === 'screenChange') {
        setLudoScreen(data.screen ?? 'home');
      } else if (data?.type === 'action' && data?.action === 'onlineFriend') {
        onHide();
        router.push('/ludo/online-friend' as any);
      } else if (data?.type === 'mpAction') {
        const cfg = mpConfigRef.current;
        if (!cfg) return;
        lastWrittenSeqRef.current += 1;
        const action: GameAction = {
          action: data.action,
          playerIndex: data.playerIndex,
          diceValue: data.diceValue,
          tokenIndex: data.tokenIndex,
          seq: lastWrittenSeqRef.current,
          actorId: cfg.userId,
          ts: Date.now(),
        };
        writeGameAction(cfg.roomId, action).catch((e) =>
          console.warn('[MP] writeGameAction failed', e)
        );
      } else if (data?.type === 'mpTurn' || data?.type === 'mpReady') {
        if (typeof data.currentPlayerIndex === 'number') {
          setDebugTurn(data.currentPlayerIndex);
        }
      }
    } catch {}
  }, [onHide]);

  return (
    <View
      style={[
        styles.overlay,
        { backgroundColor: bgColor },
        isVisible ? styles.overlayVisible : styles.overlayHidden,
      ]}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {initialLoading && (
        <View style={[StyleSheet.absoluteFill, styles.loadingBox, { backgroundColor: bgColor }]}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={[styles.loadingText, { color: isDark ? '#9CA3AF' : '#6B5E4A' }]}>
            Loading game…
          </Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        style={styles.webview}
        source={{ html: LUDO_GAME_HTML, baseUrl: 'https://leludo.app' }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        injectedJavaScriptBeforeContentLoaded={injectedJSBeforeLoad}
        onLoadStart={() => {
          if (!hasEverLoaded.current) setInitialLoading(true);
        }}
        onLoadEnd={() => {
          setInitialLoading(false);
          hasEverLoaded.current = true;
          injectTheme(resolvedThemeRef.current);
          // If a room-based online game is waiting to start, inject it now
          if (pendingOnlineGame.current) {
            const { quickStartId, namesByPlayerIndex, roomId, myPlayerIndex, userId } = pendingOnlineGame.current;
            pendingOnlineGame.current = null;
            const js = buildStartGameJS(quickStartId, namesByPlayerIndex, myPlayerIndex);
            if (roomId && typeof myPlayerIndex === 'number' && userId) {
              activateMpConfig({ roomId, myPlayerIndex, userId });
            }
            setTimeout(() => { webViewRef.current?.injectJavaScript(js); }, 400);
          }
        }}
        onError={() => setInitialLoading(false)}
        onMessage={onMessage}
        mixedContentMode="always"
        allowsBackForwardNavigationGestures={false}
        bounces={false}
        overScrollMode="never"
      />

      {/* Back button — shown only on home screen */}
      {isVisible && ludoScreen === 'home' && (
        <Pressable
          style={[
            styles.backBtn,
            { top: insets.top + 10 },
            isDark ? styles.backBtnDark : styles.backBtnLight,
          ]}
          onPress={() => {
            setLudoScreen('home');
            onHide();
            router.replace('/(tabs)' as any);
          }}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={20} color={isDark ? '#FFFFFF' : '#1a1410'} />
        </Pressable>
      )}

      {/* Invites button — top-right corner */}
      {isVisible && (
        <TouchableOpacity
          style={[
            styles.inviteBtn,
            { top: insets.top + 10 },
            isDark ? styles.backBtnDark : styles.backBtnLight,
          ]}
          onPress={() => {
            onHide();
            router.push('/ludo/invites' as any);
          }}
          hitSlop={12}
          activeOpacity={0.8}
        >
          <Feather name="inbox" size={15} color={isDark ? '#FFFFFF' : '#1a1410'} />
          {pendingInvites > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {pendingInvites > 9 ? '9+' : pendingInvites}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Multiplayer debug bar — shown during online games */}
      {isVisible && mpConfig && (
        <View style={[styles.mpDebug, { bottom: insets.bottom + 6 }]}>
          <Text style={styles.mpDebugText}>
            {(MP_COLORS[mpConfig.myPlayerIndex]?.emoji ?? '⬜') + ' You: ' +
             (MP_COLORS[mpConfig.myPlayerIndex]?.name ?? '?') +
             '  ·  Turn: ' +
             (debugTurn >= 0
               ? ((MP_COLORS[debugTurn]?.emoji ?? '⬜') + ' ' + (MP_COLORS[debugTurn]?.name ?? '?'))
               : '…') +
             '  ·  ' + mpConfig.roomId.slice(-6)}
          </Text>
        </View>
      )}

      {/* ── Floating chat buttons — right side ── */}
      {isVisible && (
        <View style={[styles.chatBtns, { top: '42%' }]}>
          {/* Game Chat — only during a multiplayer match */}
          {mpConfig && (
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => {
                setGameChatUnread(0);
                gameChatMsgCountRef.current = 0;
                setShowGameChat(true);
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="chatbubbles" size={18} color="#FFFFFF" />
              {gameChatUnread > 0 && (
                <View style={styles.chatBadge}>
                  <Text style={styles.chatBadgeText}>
                    {gameChatUnread > 9 ? '9+' : gameChatUnread}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Friends Chat — always available */}
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => setShowFriendsChat(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="people" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Chat Panels ── */}
      {mpConfig && (
        <GameChatPanel
          roomId={mpConfig.roomId}
          userId={mpConfig.userId}
          isVisible={showGameChat}
          onClose={() => setShowGameChat(false)}
        />
      )}
      <FriendsChatPanel
        userId={user?.uid ?? ''}
        isVisible={showFriendsChat}
        onClose={() => setShowFriendsChat(false)}
      />
    </View>
  );
}

export function LudoProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const pendingOnlineGame = useRef<PendingGame | null>(null);
  // Incremented each time startOnlineGame is called so LudoNativeOverlay's
  // useEffect fires even when the WebView is already loaded.
  const [gameStartTrigger, setGameStartTrigger] = useState(0);

  const show = useCallback(() => {
    setHasLoaded(true);
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  const startOnlineGame = useCallback((
    quickStartId: string,
    namesByPlayerIndex: string[],
    roomId?: string,
    myPlayerIndex?: number,
    userId?: string
  ) => {
    pendingOnlineGame.current = { quickStartId, namesByPlayerIndex, roomId, myPlayerIndex, userId };
    setHasLoaded(true);
    setIsVisible(true);
    setGameStartTrigger(n => n + 1);
  }, []);

  return (
    <LudoContext.Provider value={{ show, hide, isVisible, startOnlineGame }}>
      <View style={styles.root}>
        {children}
        {Platform.OS !== 'web' && hasLoaded && (
          <LudoNativeOverlay
            isVisible={isVisible}
            onHide={hide}
            pendingOnlineGame={pendingOnlineGame}
            gameStartTrigger={gameStartTrigger}
          />
        )}
      </View>
    </LudoContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayVisible: {
    zIndex: 9999,
    opacity: 1,
  },
  overlayHidden: {
    zIndex: -1,
    opacity: 0,
  },
  webview: { flex: 1 },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 1,
  },
  loadingText: { fontSize: 14 },
  backBtn: {
    position: 'absolute',
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  backBtnDark: { backgroundColor: 'rgba(255,255,255,0.12)' },
  backBtnLight: { backgroundColor: 'rgba(0,0,0,0.08)' },
  inviteBtn: {
    position: 'absolute',
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 100,
  },
  badge: {
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
  },
  mpDebug: {
    position: 'absolute',
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 12,
    zIndex: 200,
    alignItems: 'center',
  },
  mpDebugText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.2,
  },
  chatBtns: {
    position: 'absolute',
    right: 0,
    flexDirection: 'column',
    gap: 8,
    zIndex: 150,
  },
  chatBtn: {
    width: 42,
    height: 42,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: 'rgba(139,92,246,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  chatBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
  },
});
