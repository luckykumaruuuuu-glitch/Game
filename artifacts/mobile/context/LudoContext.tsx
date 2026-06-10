import React, {
  createContext, useContext, useRef, useState, useCallback, useEffect,
} from 'react';
import {
  View, Pressable, StyleSheet, Platform,
  StatusBar, ActivityIndicator, Text, TouchableOpacity,
  AppState, Modal, Image, ScrollView,
  Animated, TextInput, KeyboardAvoidingView,
} from 'react-native';
import { playWebClickSound } from '@/lib/webSound';
import { router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  subscribeToGameRoom,
  writeGameAction,
  writeCurrentTurn,
  saveGameState,
  markPlayerExit,
  markPlayerRejoin,
  castExitVote,
  checkAndExpireRoomIfInactive,
  subscribeToFriends,
  subscribeToFriendsPresence,
  sendSpectatorInvite,
  sendRoomMessage,
  subscribeToRoomMessages,
  GameAction,
  SavedGameState,
  GameRoomPlayer,
  PlayerStatus,
  UserProfile,
  UserPresence,
  RoomMessage,
} from '@/lib/firestore';
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
    userId?: string,
    savedGameState?: SavedGameState,
    isHost?: boolean,
    playerIndexMap?: Record<string, number>,
    gameMode?: 2 | 3 | 4
  ) => void;
  playSound: () => void;
}

const LudoContext = createContext<LudoContextValue>({
  show: () => {},
  hide: () => {},
  isVisible: false,
  startOnlineGame: () => {},
  playSound: () => {},
});

export function useLudo() {
  return useContext(LudoContext);
}

// Build the JS string that starts the game and, optionally, activates multiplayer mode.
function buildStartGameJS(
  quickStartId: string,
  namesByPlayerIndex: string[],
  myPlayerIndex?: number,
  savedGameState?: SavedGameState
): string {
  const mpInit = typeof myPlayerIndex === 'number'
    ? `setTimeout(function(){if(typeof window._initMultiplayer==='function'){window._initMultiplayer(${myPlayerIndex});}},${ 800});`
    : '';
  const restoreCall = savedGameState && typeof myPlayerIndex === 'number'
    ? `setTimeout(function(){if(typeof window._restoreGameState==='function'){window._restoreGameState(${JSON.stringify(savedGameState)});}},1600);`
    : '';
  return (
    `(function(){` +
      `try{` +
        `var fn=window._ludoDispatch||window.dispatch;` +
        `if(typeof fn==='function'){` +
          `fn({type:'START_GAME',quickStartId:${JSON.stringify(quickStartId)},namesByPlayerIndex:${JSON.stringify(namesByPlayerIndex)}});` +
          mpInit +
          restoreCall +
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
  savedGameState?: SavedGameState;
  isHost?: boolean;
  playerIndexMap?: Record<string, number>;
  gameMode?: 2 | 3 | 4;
};

type MpConfig = {
  roomId: string;
  myPlayerIndex: number;
  userId: string;
  isHost: boolean;
  playerIndexMap: Record<string, number>;
  gameMode: 2 | 3 | 4;
};

type ExitPlayer = {
  userId: string;
  name: string;
  playerIndex: number;
  voteCount: number;
  hasMyVote: boolean;
  votesNeeded: number;
};

type MoveLogEntry = {
  id: number;
  playerIndex: number;
  tokenIndex: number;
  diceValue?: number;
  fromPosition?: number;
  toPosition?: number;
};

const MP_COLORS = [
  { name: 'Yellow', emoji: '🟡' },
  { name: 'Green',  emoji: '🟢' },
  { name: 'Red',    emoji: '🔴' },
  { name: 'Blue',   emoji: '🔵' },
];

const CHAT_EMOJIS = ['😜','😭','❤️','🤔','😅','😁','😍','👌','😎','🥵','🥶','😈'];

type FloatingMsg = {
  id: string;
  text: string;
  senderName: string;
  type: 'text' | 'emoji';
};

function FloatingChatMessage({ msg, onDone }: { msg: FloatingMsg; onDone: (id: string) => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(msg.type === 'emoji' ? 0.3 : 0.85)).current;

  useEffect(() => {
    if (msg.type === 'emoji') {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
        ]),
        Animated.delay(1000),
        Animated.parallel([
          Animated.timing(translateY, { toValue: 50, duration: 900, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
        ]),
      ]).start(() => onDone(msg.id));
    } else {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 260, useNativeDriver: true }),
        ]),
        Animated.delay(7500),
        Animated.parallel([
          Animated.timing(translateY, { toValue: 30, duration: 1200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
        ]),
      ]).start(() => onDone(msg.id));
    }
  }, []);

  if (msg.type === 'emoji') {
    return (
      <Animated.Text
        style={{ fontSize: 44, opacity, transform: [{ scale }, { translateY }], marginBottom: 6 }}
      >
        {msg.text}
      </Animated.Text>
    );
  }
  return (
    <Animated.View
      style={{ opacity, transform: [{ scale }, { translateY }], marginBottom: 6, maxWidth: 210 }}
    >
      <View style={floatMsgStyle}>
        <Text style={floatNameStyle} numberOfLines={1}>{msg.senderName}</Text>
        <Text style={floatTextStyle}>{msg.text}</Text>
      </View>
    </Animated.View>
  );
}

const floatMsgStyle = {
  backgroundColor: 'rgba(6,4,18,0.80)',
  borderRadius: 14,
  paddingHorizontal: 11,
  paddingVertical: 7,
  borderWidth: 1,
  borderColor: 'rgba(139,92,246,0.30)',
} as const;
const floatNameStyle = {
  color: '#F59E0B',
  fontSize: 10,
  fontFamily: 'Inter_600SemiBold' as const,
  marginBottom: 2,
};
const floatTextStyle = {
  color: '#FFFFFF',
  fontSize: 13,
  fontFamily: 'Inter_500Medium' as const,
};

function LudoNativeOverlay({
  isVisible,
  onHide,
  pendingOnlineGame,
  gameStartTrigger,
  injectJSRef,
}: {
  isVisible: boolean;
  onHide: () => void;
  pendingOnlineGame: React.MutableRefObject<PendingGame | null>;
  gameStartTrigger: number;
  injectJSRef: React.MutableRefObject<((js: string) => void) | null>;
}) {
  const WebView = require('react-native-webview').WebView;
  const { resolvedTheme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const isDark = resolvedTheme === 'dark';
  const webViewRef = useRef<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [ludoScreen, setLudoScreen] = useState('home');
  const resolvedThemeRef = useRef(resolvedTheme);
  const hasEverLoaded = useRef(false);

  // Multiplayer session state
  const [mpConfig, setMpConfig] = useState<MpConfig | null>(null);
  const mpConfigRef = useRef<MpConfig | null>(null);
  const [debugTurn, setDebugTurn] = useState(-1);
  const [moveLog, setMoveLog] = useState<MoveLogEntry[]>([]);
  const lastSeenSeqRef = useRef(0);
  const lastWrittenSeqRef = useRef(0);
  const lastKnownTurnRef = useRef(-1);

  // Exit detection state
  const [exitPlayers, setExitPlayers] = useState<ExitPlayer[]>([]);
  const [winnerInfo, setWinnerInfo] = useState<{ name: string } | null>(null);
  const kickedIndicesRef = useRef<Set<number>>(new Set());

  // Debounce timer for game state saves
  const saveStateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Remote action queue — ensures ROLL_DICE and SELECT_TOKEN animations play
  // sequentially, never in parallel. Parallel injection caused dice animation to
  // be cut short by an immediately-following SELECT_TOKEN (main board-effects issue).
  const remoteActionQueueRef = useRef<GameAction[]>([]);
  const isQueueDrainingRef = useRef(false);
  const queueSafetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tool Menu + Share Room state
  const [toolMenuOpen, setToolMenuOpen] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [presence, setPresence] = useState<Record<string, UserPresence>>({});
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSent, setInviteSent] = useState<Set<string>>(new Set());

  // Friend Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [emojiPanelOpen, setEmojiPanelOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [floatingMsgs, setFloatingMsgs] = useState<FloatingMsg[]>([]);
  const lastTextSentRef = useRef(0);
  const lastEmojiSentRef = useRef(0);

  // Offline pass-and-play player count modal (fallback for postMessage path)
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  // Helper to compute next non-kicked player index
  function nextActiveIndex(from: number, total: number): number {
    const kicked = kickedIndicesRef.current;
    let next = (from + 1) % total;
    for (let i = 0; i < total; i++) {
      if (!kicked.has(next)) return next;
      next = (next + 1) % total;
    }
    return from;
  }

  // Helper: activate a new multiplayer session
  function activateMpConfig(cfg: MpConfig) {
    lastSeenSeqRef.current = 0;
    lastWrittenSeqRef.current = 0;
    lastKnownTurnRef.current = -1;
    kickedIndicesRef.current = new Set();
    remoteActionQueueRef.current = [];
    isQueueDrainingRef.current = false;
    if (queueSafetyTimerRef.current) {
      clearTimeout(queueSafetyTimerRef.current);
      queueSafetyTimerRef.current = null;
    }
    mpConfigRef.current = cfg;
    setMpConfig(cfg);
    setDebugTurn(-1);
    setMoveLog([]);
    setExitPlayers([]);
    setWinnerInfo(null);
  }

  // Drain one action from the remote action queue into the WebView.
  // Only called after the previous action's mpActionDone arrives (or safety timeout).
  function drainRemoteActionQueue() {
    if (remoteActionQueueRef.current.length === 0) {
      isQueueDrainingRef.current = false;
      return;
    }
    isQueueDrainingRef.current = true;
    const action = remoteActionQueueRef.current.shift()!;
    const js =
      `(function(){try{` +
        `if(typeof window._applyRemoteAction==='function'){` +
          `window._applyRemoteAction(${JSON.stringify(action)});` +
        `}` +
      `}catch(e){console.warn('[MP queue]',String(e));}` +
      `})();true;`;
    webViewRef.current?.injectJavaScript(js);
    // Safety: if mpActionDone never arrives (e.g. synchronous dispatch path),
    // auto-drain after 12 s (slightly longer than the 10 s applyingRemote safety timer).
    if (queueSafetyTimerRef.current) clearTimeout(queueSafetyTimerRef.current);
    queueSafetyTimerRef.current = setTimeout(() => {
      console.warn('[MP] Queue safety drain triggered');
      queueSafetyTimerRef.current = null;
      drainRemoteActionQueue();
    }, 12000);
  }

  function enqueueRemoteAction(action: GameAction) {
    remoteActionQueueRef.current.push(action);
    if (!isQueueDrainingRef.current) {
      drainRemoteActionQueue();
    }
  }

  useEffect(() => {
    console.log('[GAME_SCREEN_MOUNTED] native WebView overlay mounted, isVisible=' + isVisible);
    injectJSRef.current = (js: string) => {
      webViewRef.current?.injectJavaScript(js);
    };
    return () => {
      injectJSRef.current = null;
    };
  }, []);

  useEffect(() => { resolvedThemeRef.current = resolvedTheme; }, [resolvedTheme]);

  // Load friends + presence when inside an online match
  useEffect(() => {
    if (!mpConfig || !user) { setFriends([]); setPresence({}); return; }
    const unsub = subscribeToFriends(user.uid, setFriends);
    return () => { unsub(); setFriends([]); setPresence({}); };
  }, [mpConfig?.roomId, user?.uid]);

  useEffect(() => {
    if (!friends.length) { setPresence({}); return; }
    const ids = friends.map(f => f.userId);
    const unsub = subscribeToFriendsPresence(ids, setPresence);
    return () => { unsub(); };
  }, [friends.map(f => f.userId).join(',')]);

  // Subscribe to room live chat when inside an online match
  useEffect(() => {
    if (!mpConfig) { setFloatingMsgs([]); return; }
    const startTime = Date.now();
    const unsub = subscribeToRoomMessages(mpConfig.roomId, startTime, (newMsgs) => {
      newMsgs.forEach(msg => {
        const floating: FloatingMsg = {
          id: `${msg.createdAt}-${msg.senderId}-${Math.random()}`,
          text: msg.text,
          senderName: msg.senderName,
          type: msg.type,
        };
        setFloatingMsgs(prev => [...prev.slice(-4), floating]);
      });
    });
    return () => { unsub(); setFloatingMsgs([]); };
  }, [mpConfig?.roomId]);

  // Helper: send text chat message
  async function handleSendChatText() {
    const text = chatInput.trim();
    if (!text || !mpConfig || !user) return;
    const now = Date.now();
    if (now - lastTextSentRef.current < 2000) return;
    lastTextSentRef.current = now;
    setChatInput('');
    try {
      await sendRoomMessage(mpConfig.roomId, user.uid, user.displayName || 'Player', text, 'text');
    } catch (e) { console.warn('[Chat] send failed', e); }
  }

  // Subscribe to remote game actions via Firebase when a multiplayer session is active.
  useEffect(() => {
    if (!mpConfig) return;
    const unsub = subscribeToGameRoom(mpConfig.roomId, (room) => {
      if (!room) return;

      // ── EXIT / KICKED player tracking ─────────────────────────────────────
      const players = Object.values(room.players) as GameRoomPlayer[];
      const activePlayers = players.filter(p => p.playerStatus !== 'KICKED');

      // Rebuild kicked indices set
      const newKicked = new Set<number>();
      players.forEach(p => {
        if (p.playerStatus === 'KICKED') {
          const idx = mpConfig.playerIndexMap[p.userId];
          if (typeof idx === 'number') newKicked.add(idx);
        }
      });
      kickedIndicesRef.current = newKicked;

      // Build EXIT_PENDING list for overlay
      const pendingExit = players.filter(p => p.playerStatus === 'EXIT_PENDING');
      const newExitPlayers: ExitPlayer[] = pendingExit.map(p => {
        const voterCount = activePlayers.filter(a => a.playerStatus !== 'EXIT_PENDING').length;
        const needed = Math.floor(voterCount / 2) + 1;
        return {
          userId: p.userId,
          name: p.name,
          playerIndex: mpConfig.playerIndexMap[p.userId] ?? 0,
          voteCount: (p.exitVotes ?? []).length,
          hasMyVote: (p.exitVotes ?? []).includes(mpConfig.userId),
          votesNeeded: needed,
        };
      });
      setExitPlayers(newExitPlayers);

      // ── Winner detection (2-player: last player wins) ─────────────────────
      if (room.status === 'finished' && (room as any).winnerId === mpConfig.userId) {
        setWinnerInfo({ name: 'You' });
      }

      // ── currentTurnPlayerIndex sync ───────────────────────────────────────
      if (typeof room.currentTurnPlayerIndex === 'number') {
        const fbTurn = room.currentTurnPlayerIndex;

        // If it's a kicked player's turn, HOST auto-advances
        if (kickedIndicesRef.current.has(fbTurn) && mpConfig.isHost) {
          const next = nextActiveIndex(fbTurn, mpConfig.gameMode);
          if (next !== fbTurn) {
            writeCurrentTurn(mpConfig.roomId, next).catch(console.warn);
            const skipJs =
              `(function(){try{` +
                `if(typeof window._setTurnPlayer==='function'){` +
                  `window._setTurnPlayer(${next});` +
                `}` +
              `}catch(e){}})();true;`;
            setTimeout(() => { webViewRef.current?.injectJavaScript(skipJs); }, 100);
          }
          return;
        }

        // Determine if a new remote action is about to be relayed from this
        // same snapshot. When an action IS relayed, _applyRemoteAction will run
        // the full animation pipeline (ROLL_DICE → dice anim, SELECT_TOKEN →
        // token anim → TURN_ADVANCED). Injecting _setTurnPlayer in parallel would
        // fire moveDice()/updateCornerWidgets() mid-animation → visual jitter.
        // Only inject _setTurnPlayer when there is NO new action to relay
        // (missed-update correction / reconnect scenario).
        const hasPendingAction =
          !!room.lastAction &&
          room.lastAction.seq > lastSeenSeqRef.current &&
          room.lastAction.actorId !== mpConfig.userId;

        if (fbTurn !== lastKnownTurnRef.current) {
          // Always update the ref first so we never double-inject for the same value.
          lastKnownTurnRef.current = fbTurn;

          if (!hasPendingAction) {
            // No action to relay — inject _setTurnPlayer to correct any state drift
            // (reconnect / missed TURN_ADVANCED). _setTurnPlayer now has an
            // applyingRemote guard so it is safe even if called while animating.
            const syncJs =
              `(function(){try{` +
                `if(typeof window._setTurnPlayer==='function'){` +
                  `window._setTurnPlayer(${fbTurn});` +
                `}` +
              `}catch(e){console.warn('[MP turn sync]',String(e));}` +
              `})();true;`;
            setTimeout(() => { webViewRef.current?.injectJavaScript(syncJs); }, 80);
          }
        }
      }

      // ── lastAction relay ──────────────────────────────────────────────────
      // Actions are enqueued and applied one at a time. Each _applyRemoteAction
      // call posts mpActionDone when its animation completes, which drains the
      // next item. This prevents ROLL_DICE and SELECT_TOKEN from running in
      // parallel, which was the root cause of cut-short dice animations.
      if (!room.lastAction) return;
      const action = room.lastAction;
      if (action.seq <= lastSeenSeqRef.current) return;
      lastSeenSeqRef.current = action.seq;
      if (action.actorId === mpConfig.userId) return;
      enqueueRemoteAction(action);
    });
    return unsub;
  }, [mpConfig]);

  // ── Periodic inactivity check — every 2 min while match is live ─────────
  // If the room has been inactive for 10+ minutes (e.g. all players backgrounded),
  // mark it INACTIVE so it disappears from Active Rooms and blocks spectator entry.
  useEffect(() => {
    if (!mpConfig) return;
    const interval = setInterval(async () => {
      const expired = await checkAndExpireRoomIfInactive(mpConfig.roomId);
      if (expired) {
        console.log('[MP] Room marked INACTIVE due to inactivity — closing overlay');
        clearInterval(interval);
      }
    }, 2 * 60 * 1000); // check every 2 minutes
    return () => clearInterval(interval);
  }, [mpConfig?.roomId]);

  // ── AppState listener: mark EXIT_PENDING when app goes background ────────
  useEffect(() => {
    if (!mpConfig) return;
    const sub = AppState.addEventListener('change', (nextState) => {
      const cfg = mpConfigRef.current;
      if (!cfg) return;
      if (nextState === 'background' || nextState === 'inactive') {
        markPlayerExit(cfg.roomId, cfg.userId).catch(console.warn);
      } else if (nextState === 'active') {
        markPlayerRejoin(cfg.roomId, cfg.userId).catch(console.warn);
      }
    });
    return () => sub.remove();
  }, [mpConfig?.roomId, mpConfig?.userId]);

  // ── Vote to kick a disconnected player ──────────────────────────────────
  async function handleVoteKick(targetUserId: string) {
    const cfg = mpConfigRef.current;
    if (!cfg) return;
    try {
      const result = await castExitVote(cfg.roomId, targetUserId, cfg.userId);
      if (result.isLastPlayer && result.winnerId === cfg.userId) {
        setWinnerInfo({ name: 'You' });
      }
    } catch (e) {
      console.warn('[MP] castExitVote failed', e);
    }
  }

  // When startOnlineGame is called and the WebView is already loaded, inject
  // the START_GAME command immediately (onLoadEnd won't fire a second time).
  useEffect(() => {
    if (gameStartTrigger === 0) return;
    if (!hasEverLoaded.current) return;
    if (!pendingOnlineGame.current) return;
    const { quickStartId, namesByPlayerIndex, roomId, myPlayerIndex, userId, savedGameState, isHost, playerIndexMap, gameMode } = pendingOnlineGame.current;
    pendingOnlineGame.current = null;
    const js = buildStartGameJS(quickStartId, namesByPlayerIndex, myPlayerIndex, savedGameState);
    if (roomId && typeof myPlayerIndex === 'number' && userId) {
      activateMpConfig({ roomId, myPlayerIndex, userId, isHost: isHost ?? false, playerIndexMap: playerIndexMap ?? {}, gameMode: gameMode ?? 4 });
    }
    setTimeout(() => { webViewRef.current?.injectJavaScript(js); }, 400);
  }, [gameStartTrigger]);

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
      } else if (data?.type === 'action' && data?.action === 'offlineFriend') {
        setShowOfflineModal(true);
      } else if (data?.type === 'mpAction') {
        const cfg = mpConfigRef.current;
        if (!cfg) return;
        lastWrittenSeqRef.current += 1;
        const action: GameAction = {
          action: data.action,
          playerIndex: data.playerIndex,
          diceValue: data.diceValue,
          tokenIndex: data.tokenIndex,
          fromPosition: data.fromPosition,
          toPosition: data.toPosition,
          seq: lastWrittenSeqRef.current,
          actorId: cfg.userId,
          ts: Date.now(),
        };
        // For ROLL_DICE: currentTurnPlayerIndex = the rolling player (it's still their turn while selecting token)
        const turnForAction = data.action === 'ROLL_DICE' ? data.playerIndex : undefined;
        writeGameAction(cfg.roomId, action, turnForAction).catch((e) =>
          console.warn('[MP] writeGameAction failed', e)
        );
      } else if (data?.type === 'mpTurn' || data?.type === 'mpReady' || data?.type === 'mpRestored') {
        // mpTurn fires from TURN_ADVANCED / GAME_STARTED on the ACTOR's device only.
        // (non-actor's subscribe listener is suppressed by applyingRemote=true)
        // This is the authoritative signal to write currentTurnPlayerIndex to Firebase.
        if (typeof data.currentPlayerIndex === 'number') {
          setDebugTurn(data.currentPlayerIndex);
          lastKnownTurnRef.current = data.currentPlayerIndex;
          // Write the new current turn to Firebase so all players can sync.
          const cfg = mpConfigRef.current;
          if (cfg) {
            writeCurrentTurn(cfg.roomId, data.currentPlayerIndex).catch((e) =>
              console.warn('[MP] writeCurrentTurn failed', e)
            );
          }
        }
      } else if (data?.type === 'mpTurnSync') {
        // mpTurnSync fires from _setTurnPlayer (Firebase correction, not a local action).
        // Only update local tracking — do NOT write to Firebase.
        // (The turn value came from Firebase; writing it back would cause a second
        //  snapshot → potential flicker loop.)
        if (typeof data.currentPlayerIndex === 'number') {
          setDebugTurn(data.currentPlayerIndex);
          lastKnownTurnRef.current = data.currentPlayerIndex;
        }
      } else if (data?.type === 'mpActionDone') {
        // Remote action animation completed — drain next queued action.
        // Clear the safety timer and process the next item (with a small gap
        // so the game engine UI has time to settle between actions).
        if (queueSafetyTimerRef.current) {
          clearTimeout(queueSafetyTimerRef.current);
          queueSafetyTimerRef.current = null;
        }
        setTimeout(() => drainRemoteActionQueue(), 80);
      } else if (data?.type === 'mpMoveLog') {
        const entry: MoveLogEntry = {
          id: Date.now(),
          playerIndex: data.playerIndex ?? 0,
          tokenIndex: data.tokenIndex ?? 0,
          diceValue: data.diceValue,
          fromPosition: data.fromPosition,
          toPosition: data.toPosition,
        };
        setMoveLog(prev => [entry, ...prev].slice(0, 5));
      } else if (data?.type === 'mpGameState') {
        const cfg = mpConfigRef.current;
        if (!cfg) return;
        if (saveStateTimerRef.current) clearTimeout(saveStateTimerRef.current);
        const stateSnapshot = {
          tokenPositions: data.tokenPositions,
          currentPlayerIndex: data.currentPlayerIndex,
          phase: data.phase,
          savedAt: Date.now(),
        };
        saveStateTimerRef.current = setTimeout(() => {
          saveGameState(cfg.roomId, stateSnapshot).catch((e) =>
            console.warn('[MP] saveGameState failed', e)
          );
        }, 500);
      }
    } catch {}
  }, [onHide]);

  return (
    <View
      style={[
        styles.overlay,
        { backgroundColor: bgColor, paddingTop: insets.top },
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
            const { quickStartId, namesByPlayerIndex, roomId, myPlayerIndex, userId, savedGameState, isHost, playerIndexMap, gameMode } = pendingOnlineGame.current;
            pendingOnlineGame.current = null;
            const js = buildStartGameJS(quickStartId, namesByPlayerIndex, myPlayerIndex, savedGameState);
            if (roomId && typeof myPlayerIndex === 'number' && userId) {
              activateMpConfig({ roomId, myPlayerIndex, userId, isHost: isHost ?? false, playerIndexMap: playerIndexMap ?? {}, gameMode: gameMode ?? 4 });
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

      {/* Tool button — only inside live online match AND on the game board screen */}
      {isVisible && mpConfig && ludoScreen === 'game' && (
        <TouchableOpacity
          style={[styles.toolBtn, { top: insets.top + 10 }]}
          onPress={() => setToolMenuOpen(true)}
          activeOpacity={0.8}
          hitSlop={10}
        >
          <Text style={styles.toolBtnIcon}>🛠️</Text>
        </TouchableOpacity>
      )}

      {/* ── TOOL MENU modal — glassmorphism popup ── */}
      <Modal
        visible={toolMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setToolMenuOpen(false)}
      >
        <Pressable
          style={styles.toolMenuBackdrop}
          onPress={() => setToolMenuOpen(false)}
        >
          <Pressable style={styles.toolMenuCard} onPress={() => {}}>
            <View style={styles.toolMenuHandle} />
            <Text style={styles.toolMenuTitle}>⚡ Room Tools</Text>
            <TouchableOpacity
              style={styles.toolMenuItem}
              activeOpacity={0.75}
              onPress={() => {
                setToolMenuOpen(false);
                setInviteSent(new Set());
                setSelectedFriends(new Set());
                setTimeout(() => setShareMenuOpen(true), 150);
              }}
            >
              <Text style={styles.toolMenuItemIcon}>📨</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.toolMenuItemLabel}>Share Room</Text>
                <Text style={styles.toolMenuItemSub}>Invite friends to watch live</Text>
              </View>
              <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolMenuItem}
              activeOpacity={0.75}
              onPress={() => {
                setToolMenuOpen(false);
                setTimeout(() => { setChatInput(''); setEmojiPanelOpen(false); setChatOpen(true); }, 150);
              }}
            >
              <Text style={styles.toolMenuItemIcon}>💬</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.toolMenuItemLabel}>Friend Chat</Text>
                <Text style={styles.toolMenuItemSub}>Chat with players & spectators</Text>
              </View>
              <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── SHARE ROOM / Friend Picker modal ── */}
      <Modal
        visible={shareMenuOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setShareMenuOpen(false)}
      >
        <Pressable
          style={styles.toolMenuBackdrop}
          onPress={() => setShareMenuOpen(false)}
        >
          <Pressable style={styles.shareCard} onPress={() => {}}>
            <View style={styles.toolMenuHandle} />
            <Text style={styles.toolMenuTitle}>📨 Invite to Watch Live</Text>
            <Text style={styles.shareSubtitle}>Select friends to send a spectator invite</Text>

            {/* Room ID chip — always visible at top of share sheet */}
            {mpConfig?.roomId ? (
              <View style={styles.roomIdChip}>
                <Text style={[styles.roomIdChipLabel, { color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }]}>ROOM ID</Text>
                <Text style={[styles.roomIdChipValue, { color: isDark ? '#C4B5FD' : '#6D28D9' }]}>
                  {mpConfig.roomId.slice(-6).toUpperCase()}
                </Text>
              </View>
            ) : null}

            {friends.length === 0 ? (
              <View style={styles.shareEmptyBox}>
                <Text style={styles.shareEmptyText}>No friends yet. Add friends to invite them!</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.friendList}
                showsVerticalScrollIndicator={false}
              >
                {/* Online friends first */}
                {friends
                  .slice()
                  .sort((a, b) => {
                    const aOnline = presence[a.userId]?.online ? 1 : 0;
                    const bOnline = presence[b.userId]?.online ? 1 : 0;
                    return bOnline - aOnline;
                  })
                  .map((friend) => {
                    const isOnline = presence[friend.userId]?.online ?? false;
                    const isSelected = selectedFriends.has(friend.userId);
                    const wasSent = inviteSent.has(friend.userId);
                    return (
                      <TouchableOpacity
                        key={friend.userId}
                        style={[
                          styles.friendRow,
                          isSelected && styles.friendRowSelected,
                          wasSent && styles.friendRowSent,
                        ]}
                        activeOpacity={0.75}
                        disabled={wasSent}
                        onPress={() => {
                          setSelectedFriends(prev => {
                            const next = new Set(prev);
                            if (next.has(friend.userId)) next.delete(friend.userId);
                            else next.add(friend.userId);
                            return next;
                          });
                        }}
                      >
                        <View style={styles.friendAvatarWrap}>
                          {friend.photo ? (
                            <Image
                              source={{ uri: friend.photo }}
                              style={styles.friendAvatar}
                            />
                          ) : (
                            <View style={[styles.friendAvatar, styles.friendAvatarPlaceholder]}>
                              <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' }}>
                                {(friend.name || friend.username || '?')[0].toUpperCase()}
                              </Text>
                            </View>
                          )}
                          <View style={[
                            styles.presenceDot,
                            { backgroundColor: isOnline ? '#22C55E' : '#6B7280' },
                          ]} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.friendName} numberOfLines={1}>
                            {friend.name || friend.username}
                          </Text>
                          <Text style={styles.friendStatus}>
                            {wasSent ? '✅ Invite sent' : isOnline ? '🟢 Online' : '⚫ Offline'}
                          </Text>
                        </View>
                        {wasSent ? (
                          <View style={styles.sentBadge}>
                            <Text style={styles.sentBadgeText}>Sent</Text>
                          </View>
                        ) : isSelected ? (
                          <View style={styles.checkCircle}>
                            <Feather name="check" size={14} color="#fff" />
                          </View>
                        ) : (
                          <View style={styles.uncheckCircle} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            )}

            {/* Gaming-style invite card preview */}
            {selectedFriends.size > 0 && (
              <View style={styles.inviteCardPreview}>
                <Text style={styles.inviteCardTitle}>🎮 LIVE MATCH INVITATION</Text>
                <Text style={styles.inviteCardBody}>
                  {user?.displayName || 'A player'} invited you to watch a live Ludo match.
                </Text>
                <Text style={styles.inviteCardRoom}>Room · {mpConfig?.roomId?.slice(-6).toUpperCase()}</Text>
                <Text style={styles.inviteCardCta}>👁 Watch Live Match</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.sendInviteBtn,
                (selectedFriends.size === 0 || inviteSending) && styles.sendInviteBtnDisabled,
              ]}
              activeOpacity={0.8}
              disabled={selectedFriends.size === 0 || inviteSending}
              onPress={async () => {
                if (!mpConfig || !user) return;
                setInviteSending(true);
                try {
                  await sendSpectatorInvite(
                    user.uid,
                    user.displayName || 'A player',
                    Array.from(selectedFriends),
                    mpConfig.roomId
                  );
                  setInviteSent(prev => {
                    const next = new Set(prev);
                    selectedFriends.forEach(id => next.add(id));
                    return next;
                  });
                  setSelectedFriends(new Set());
                } catch (e) {
                  console.warn('[ShareRoom] invite failed', e);
                } finally {
                  setInviteSending(false);
                }
              }}
            >
              <Text style={styles.sendInviteBtnText}>
                {inviteSending
                  ? 'Sending...'
                  : selectedFriends.size === 0
                    ? 'Select friends to invite'
                    : `Send Invite to ${selectedFriends.size} friend${selectedFriends.size > 1 ? 's' : ''}`}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── FRIEND CHAT Modal ── */}
      <Modal
        visible={chatOpen}
        transparent
        animationType="slide"
        onRequestClose={() => { setChatOpen(false); setEmojiPanelOpen(false); }}
      >
        <Pressable
          style={styles.toolMenuBackdrop}
          onPress={() => { setChatOpen(false); setEmojiPanelOpen(false); }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ width: '100%' }}
          >
            <Pressable style={styles.chatCard} onPress={() => {}}>
              <View style={styles.toolMenuHandle} />
              <Text style={styles.toolMenuTitle}>💬 Live Chat</Text>
              <Text style={styles.chatSub}>Visible to all players &amp; spectators in real-time</Text>

              {/* Emoji reaction panel */}
              {emojiPanelOpen && (
                <View style={styles.emojiPanel}>
                  {CHAT_EMOJIS.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={styles.emojiBtn}
                      activeOpacity={0.7}
                      onPress={async () => {
                        const now = Date.now();
                        if (now - lastEmojiSentRef.current < 1000) return;
                        if (!mpConfig || !user) return;
                        lastEmojiSentRef.current = now;
                        setEmojiPanelOpen(false);
                        try {
                          await sendRoomMessage(
                            mpConfig.roomId, user.uid,
                            user.displayName || 'Player',
                            emoji, 'emoji'
                          );
                        } catch (e) { console.warn('[Chat] emoji failed', e); }
                      }}
                    >
                      <Text style={styles.emojiBtnText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Message input row */}
              <View style={styles.chatInputRow}>
                <TouchableOpacity
                  style={styles.chatEmojiToggle}
                  onPress={() => setEmojiPanelOpen(v => !v)}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 24 }}>😊</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.chatTextInput}
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder="Say something..."
                  placeholderTextColor="rgba(255,255,255,0.28)"
                  maxLength={120}
                  returnKeyType="send"
                  onSubmitEditing={handleSendChatText}
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  style={[
                    styles.chatSendBtn,
                    !chatInput.trim() && styles.chatSendBtnDisabled,
                  ]}
                  disabled={!chatInput.trim()}
                  onPress={handleSendChatText}
                  activeOpacity={0.8}
                >
                  <Feather name="send" size={17} color="#fff" />
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* ── Floating Chat Messages (over game board only) ── */}
      {isVisible && mpConfig && ludoScreen === 'game' && floatingMsgs.length > 0 && (
        <View
          style={[styles.floatingMsgPanel, { top: insets.top + 56 }]}
          pointerEvents="none"
        >
          {floatingMsgs.map(msg => (
            <FloatingChatMessage
              key={msg.id}
              msg={msg}
              onDone={(id) => setFloatingMsgs(prev => prev.filter(m => m.id !== id))}
            />
          ))}
        </View>
      )}

      {/* Move history log — shown during online games on game board only */}
      {isVisible && mpConfig && ludoScreen === 'game' && moveLog.length > 0 && (
        <View style={[styles.moveLogContainer, { bottom: insets.bottom + 52 }]}>
          {moveLog.map((entry) => {
            const color = MP_COLORS[entry.playerIndex];
            const tokenLabel = `Token ${entry.tokenIndex + 1}`;
            const fromStr = entry.fromPosition !== undefined ? String(entry.fromPosition) : '?';
            const toStr = entry.toPosition !== undefined ? String(entry.toPosition) : '?';
            const diceStr = entry.diceValue !== undefined ? ` (🎲${entry.diceValue})` : '';
            return (
              <Text key={entry.id} style={styles.moveLogEntry}>
                {(color?.emoji ?? '⬜') + ' ' + (color?.name ?? 'P' + entry.playerIndex) +
                 ' moved ' + tokenLabel + ' ' + fromStr + '→' + toStr + diceStr}
              </Text>
            );
          })}
        </View>
      )}

      {/* EXIT players voting panel — shown during online games on game board only */}
      {isVisible && mpConfig && ludoScreen === 'game' && exitPlayers.length > 0 && (
        <View style={[styles.exitPanel, { bottom: insets.bottom + 56 }]}>
          <Text style={styles.exitPanelTitle}>⚠ Player(s) Disconnected</Text>
          {exitPlayers.map(ep => (
            <View key={ep.userId} style={styles.exitPlayerRow}>
              <Text style={styles.exitPlayerEmoji}>
                {MP_COLORS[ep.playerIndex]?.emoji ?? '⬜'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.exitPlayerName} numberOfLines={1}>{ep.name}</Text>
                <Text style={styles.exitVoteCount}>
                  {ep.voteCount}/{ep.votesNeeded} votes to kick
                </Text>
              </View>
              {ep.hasMyVote ? (
                <View style={styles.votedPill}>
                  <Text style={styles.votedPillText}>Voted</Text>
                </View>
              ) : ep.userId !== mpConfig.userId ? (
                <TouchableOpacity
                  style={styles.kickBtn}
                  onPress={() => handleVoteKick(ep.userId)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.kickBtnText}>Kick</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </View>
      )}

      {/* Offline Pass-and-Play modal — fallback when postMessage path fires */}
      <Modal
        visible={showOfflineModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOfflineModal(false)}
      >
        <View style={styles.ofModalBackdrop}>
          <View style={styles.ofModalCard}>
            <Text style={styles.ofModalTitle}>Pass & Play</Text>
            <Text style={styles.ofModalSub}>Players take turns on this device</Text>
            <View style={styles.ofModalRow}>
              {([2, 3, 4] as const).map((n) => {
                const configs: Record<number, { qid: string; names: string[] }> = {
                  2: { qid: 'qs,2,0,2,0',   names: ['Player 2', '', 'Player 1', ''] },
                  3: { qid: 'qs,3,0,2,0,1', names: ['Player 2', 'Player 3', 'Player 1', ''] },
                  4: { qid: 'qs,4,0',       names: ['Player 1', 'Player 2', 'Player 3', 'Player 4'] },
                };
                return (
                  <TouchableOpacity
                    key={n}
                    style={styles.ofModalBtn}
                    activeOpacity={0.75}
                    onPress={() => {
                      setShowOfflineModal(false);
                      const cfg = configs[n];
                      const js = buildStartGameJS(cfg.qid, cfg.names);
                      setTimeout(() => { webViewRef.current?.injectJavaScript(js); }, 200);
                    }}
                  >
                    <Text style={styles.ofModalBtnNum}>{n}</Text>
                    <Text style={styles.ofModalBtnLbl}>PLAYERS</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={styles.ofModalCancel}
              onPress={() => setShowOfflineModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.ofModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Winner overlay — shown when last player wins by kick-out */}
      {isVisible && winnerInfo && (
        <View style={styles.winnerOverlay}>
          <Text style={styles.winnerEmoji}>🏆</Text>
          <Text style={styles.winnerTitle}>You Win!</Text>
          <Text style={styles.winnerSub}>All other players were removed</Text>
          <TouchableOpacity
            style={styles.winnerCloseBtn}
            onPress={() => setWinnerInfo(null)}
            activeOpacity={0.8}
          >
            <Text style={styles.winnerCloseBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}

export function LudoProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const pendingOnlineGame = useRef<PendingGame | null>(null);
  const injectJSRef = useRef<((js: string) => void) | null>(null);
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

  const playSound = useCallback(() => {
    if (Platform.OS === 'web') {
      playWebClickSound();
      return;
    }
    injectJSRef.current?.(
      '(function(){try{if(typeof window._playClickSound==="function"){window._playClickSound();}}catch(e){}})();true;'
    );
  }, []);

  const startOnlineGame = useCallback((
    quickStartId: string,
    namesByPlayerIndex: string[],
    roomId?: string,
    myPlayerIndex?: number,
    userId?: string,
    savedGameState?: SavedGameState,
    isHost?: boolean,
    playerIndexMap?: Record<string, number>,
    gameMode?: 2 | 3 | 4
  ) => {
    pendingOnlineGame.current = { quickStartId, namesByPlayerIndex, roomId, myPlayerIndex, userId, savedGameState, isHost, playerIndexMap, gameMode };
    setHasLoaded(true);
    setIsVisible(true);
    setGameStartTrigger(n => n + 1);
  }, []);

  return (
    <LudoContext.Provider value={{ show, hide, isVisible, startOnlineGame, playSound }}>
      <View style={styles.root}>
        {children}
        {Platform.OS !== 'web' && hasLoaded && (
          <LudoNativeOverlay
            isVisible={isVisible}
            onHide={hide}
            pendingOnlineGame={pendingOnlineGame}
            gameStartTrigger={gameStartTrigger}
            injectJSRef={injectJSRef}
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
  moveLogContainer: {
    position: 'absolute',
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    zIndex: 200,
    gap: 3,
  },
  moveLogEntry: {
    color: '#E5E7EB',
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.1,
  },
  exitPanel: {
    position: 'absolute',
    left: 10,
    right: 10,
    backgroundColor: 'rgba(20,10,0,0.88)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    zIndex: 300,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
  },
  exitPanelTitle: {
    color: '#F59E0B',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  exitPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exitPlayerEmoji: {
    fontSize: 18,
  },
  exitPlayerName: {
    color: '#F3F4F6',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  exitVoteCount: {
    color: '#9CA3AF',
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  kickBtn: {
    backgroundColor: 'rgba(239,68,68,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.45)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  kickBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  votedPill: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  votedPillText: {
    color: '#F59E0B',
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  roomIdLabel: {
    position: 'absolute',
    right: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  roomIdText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.4,
  },
  winnerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    gap: 12,
  },
  winnerEmoji: { fontSize: 64 },
  winnerTitle: {
    color: '#FFFFFF',
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
  },
  winnerSub: {
    color: '#9CA3AF',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  winnerCloseBtn: {
    marginTop: 8,
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  winnerCloseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  ofModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  ofModalCard: {
    backgroundColor: '#111111',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    gap: 10,
  },
  ofModalTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  ofModalSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    marginBottom: 4,
  },
  ofModalRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ofModalBtn: {
    flex: 1,
    height: 88,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  ofModalBtnNum: {
    color: '#dc2626',
    fontSize: 30,
    fontFamily: 'Inter_700Bold',
    lineHeight: 32,
  },
  ofModalBtnLbl: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.6,
  },
  ofModalCancel: {
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  ofModalCancelText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },

  // ── Tool Button ──────────────────────────────────────────────────────────────
  toolBtn: {
    position: 'absolute',
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,10,30,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  toolBtnIcon: {
    fontSize: 18,
    lineHeight: 22,
  },

  // ── Tool Menu card ───────────────────────────────────────────────────────────
  toolMenuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  toolMenuCard: {
    backgroundColor: 'rgba(14,8,28,0.97)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 10,
    gap: 14,
  },
  toolMenuHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'center',
    marginBottom: 6,
  },
  toolMenuTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },
  toolMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.22)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  toolMenuItemIcon: {
    fontSize: 22,
  },
  toolMenuItemLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  toolMenuItemSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },

  // ── Share Room / Friend Picker ───────────────────────────────────────────────
  shareCard: {
    backgroundColor: 'rgba(10,6,22,0.98)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 10,
    maxHeight: '85%',
    gap: 12,
  },
  shareSubtitle: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: -6,
  },
  roomIdChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.40)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  roomIdChipLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
  },
  roomIdChipValue: {
    color: '#C4B5FD',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 3,
  },
  shareEmptyBox: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  shareEmptyText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  friendList: {
    maxHeight: 280,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    gap: 12,
  },
  friendRowSelected: {
    borderColor: 'rgba(139,92,246,0.55)',
    backgroundColor: 'rgba(139,92,246,0.10)',
  },
  friendRowSent: {
    borderColor: 'rgba(34,197,94,0.35)',
    backgroundColor: 'rgba(34,197,94,0.06)',
    opacity: 0.75,
  },
  friendAvatarWrap: {
    position: 'relative',
  },
  friendAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#3730A3',
  },
  friendAvatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  presenceDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(10,6,22,0.98)',
  },
  friendName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  friendStatus: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  sentBadge: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.35)',
  },
  sentBadgeText: {
    color: '#22C55E',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },

  // ── Invite card preview ──────────────────────────────────────────────────────
  inviteCardPreview: {
    backgroundColor: 'rgba(139,92,246,0.10)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.35)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
  },
  inviteCardTitle: {
    color: '#F59E0B',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  inviteCardBody: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  inviteCardRoom: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.3,
  },
  inviteCardCta: {
    color: '#8B5CF6',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 2,
  },

  // ── Send Invite button ───────────────────────────────────────────────────────
  sendInviteBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  sendInviteBtnDisabled: {
    backgroundColor: 'rgba(139,92,246,0.3)',
  },
  sendInviteBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.2,
  },

  // ── Floating Chat Messages ────────────────────────────────────────────────────
  floatingMsgPanel: {
    position: 'absolute',
    left: 12,
    zIndex: 150,
    gap: 4,
    maxWidth: 220,
  },

  // ── Friend Chat Modal ─────────────────────────────────────────────────────────
  chatCard: {
    backgroundColor: 'rgba(10,6,22,0.98)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
    paddingHorizontal: 18,
    paddingBottom: 36,
    paddingTop: 10,
    gap: 12,
  },
  chatSub: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: -6,
  },
  emojiPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.15)',
  },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  emojiBtnText: {
    fontSize: 26,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.22)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chatEmojiToggle: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatTextInput: {
    flex: 1,
    height: 40,
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 0,
  },
  chatSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSendBtnDisabled: {
    backgroundColor: 'rgba(139,92,246,0.3)',
  },
});
