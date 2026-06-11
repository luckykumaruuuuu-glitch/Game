import React, {
  createContext, useContext, useRef, useState, useCallback, useEffect,
} from 'react';
import {
  View, Pressable, StyleSheet, Platform,
  StatusBar, ActivityIndicator, Text, TouchableOpacity,
  AppState, Modal, Image, ScrollView,
  Animated, TextInput, KeyboardAvoidingView, PanResponder,
} from 'react-native';
import { playWebClickSound } from '@/lib/webSound';
import { LinearGradient } from 'expo-linear-gradient';
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
  SpectatorSlot,
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
  // Always reset _mp before START_GAME so a previous online session never
  // bleeds into an offline or new-online game. _initMultiplayer (called
  // 800 ms later for online games only) will re-enable it with fresh state.
  const mpReset =
    `if(window._mp){` +
      `window._mp.enabled=false;` +
      `window._mp.myPlayerIndex=-1;` +
      `window._mp.applyingRemote=false;` +
      `window._mp.lastSentSeq=0;` +
    `}`;
  return (
    `(function(){` +
      `try{` +
        mpReset +
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

const MCP_SLOTS = [
  { id: 'crown',   emoji: '👑', name: 'Crown',   shortName: 'CROWN',   desc: 'Royal King · Luxury Power Mode',       feature: 'Dynasty Mode',  color: '#FFD700', border: '#B8860B', glow: 'rgba(255,215,0,0.22)',   gradient: ['#1f1600', '#2a1d00', '#1a1000'] as [string,string,string] },
  { id: 'flame',   emoji: '🔥', name: 'Flame',   shortName: 'FLAME',   desc: 'Fire Surge · Heat Wave Active',        feature: 'Blaze Rush',    color: '#FF5500', border: '#CC3300', glow: 'rgba(255,85,0,0.22)',    gradient: ['#200800', '#2a0d00', '#1a0500'] as [string,string,string] },
  { id: 'thunder', emoji: '⚡', name: 'Thunder', shortName: 'THUNDER', desc: 'Electric Storm · Voltage Surge',       feature: 'Shock Wave',    color: '#00AAFF', border: '#0077BB', glow: 'rgba(0,170,255,0.22)',   gradient: ['#00091f', '#000d28', '#000614'] as [string,string,string] },
  { id: 'diamond', emoji: '💎', name: 'Diamond', shortName: 'DIAMOND', desc: 'Crystal Glass · Prismatic Energy',     feature: 'Prism Shield',  color: '#00DDDD', border: '#009999', glow: 'rgba(0,221,221,0.22)',   gradient: ['#001a1a', '#002222', '#001212'] as [string,string,string] },
  { id: 'dragon',  emoji: '🐉', name: 'Dragon',  shortName: 'DRAGON',  desc: 'Ancient Beast · Mythical Force',       feature: 'Scale Armor',   color: '#00CC44', border: '#007730', glow: 'rgba(0,204,68,0.22)',    gradient: ['#001a07', '#002210', '#001205'] as [string,string,string] },
  { id: 'shadow',  emoji: '☠️', name: 'Shadow',  shortName: 'SHADOW',  desc: 'Dark Phantom · Stealth Protocol',      feature: 'Void Strike',   color: '#9933FF', border: '#6600BB', glow: 'rgba(153,51,255,0.22)',  gradient: ['#0d0014', '#130022', '#09000f'] as [string,string,string] },
] as const;
type McpSlotId = typeof MCP_SLOTS[number]['id'];

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
  const lastSeenByActorRef = useRef<Record<string, number>>({});
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
  const [watchersOpen, setWatchersOpen] = useState(false);
  const [spectators, setSpectators] = useState<SpectatorSlot[]>([]);
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

  // ── Secret Key system ──────────────────────────────────────────────────────
  const [secretKeyModalOpen, setSecretKeyModalOpen] = useState(false);
  const [secretKeyInput, setSecretKeyInput] = useState('');
  const [secretKeyError, setSecretKeyError] = useState('');
  const [secretKeyActivated, setSecretKeyActivated] = useState(false);
  const [secretKeySuccess, setSecretKeySuccess] = useState(false);

  // Monster Control Panel state
  const [monsterPanelOpen, setMonsterPanelOpen] = useState(false);
  const [mcpActiveSlot, setMcpActiveSlot] = useState<McpSlotId>('crown');
  const [hackedSlot, setHackedSlot] = useState<string | null>(null);

  // Monster floating animation
  const monsterPos = useRef(new Animated.ValueXY({ x: 20, y: 300 })).current;
  const monsterFloat = useRef(new Animated.Value(0)).current;

  // Tap-vs-drag detection: PanResponder only claims gesture on real movement
  // so TouchableOpacity inside handles taps cleanly.
  const monsterPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
      onPanResponderGrant: () => { monsterPos.extractOffset(); },
      onPanResponderMove: Animated.event(
        [null, { dx: monsterPos.x, dy: monsterPos.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => { monsterPos.flattenOffset(); },
    })
  ).current;

  // Floating hack panel position + drag responder
  const hackPanelPos = useRef(new Animated.ValueXY({ x: 16, y: 80 })).current;
  const hackPanelPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 3 || Math.abs(gs.dy) > 3,
      onPanResponderGrant: () => { hackPanelPos.extractOffset(); },
      onPanResponderMove: Animated.event(
        [null, { dx: hackPanelPos.x, dy: hackPanelPos.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => { hackPanelPos.flattenOffset(); },
    })
  ).current;

  // Start/stop float loop based on activation
  useEffect(() => {
    if (!secretKeyActivated) { monsterFloat.stopAnimation(); monsterFloat.setValue(0); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(monsterFloat, { toValue: -12, duration: 900, useNativeDriver: true }),
        Animated.timing(monsterFloat, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [secretKeyActivated]);

  // Reset ALL secret key + monster state when leaving the online match
  useEffect(() => {
    if (!mpConfig) {
      setSecretKeyActivated(false);
      setSecretKeyModalOpen(false);
      setSecretKeyInput('');
      setSecretKeyError('');
      setSecretKeySuccess(false);
      setMonsterPanelOpen(false);
      setHackedSlot(null);
      monsterPos.setValue({ x: 20, y: 300 });
      hackPanelPos.setValue({ x: 16, y: 80 });
    }
  }, [mpConfig]);

  function handleSecretKeyConfirm() {
    if (secretKeyInput.toUpperCase().trim() === '7X1CM4') {
      setSecretKeyError('');
      setSecretKeySuccess(true);
      setTimeout(() => {
        setSecretKeySuccess(false);
        setSecretKeyModalOpen(false);
        setSecretKeyInput('');
        setSecretKeyActivated(true);
        setMonsterPanelOpen(true); // auto-open floating hack panel
      }, 1400);
    } else {
      setSecretKeyError('Invalid Secret Key');
    }
  }

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
    lastSeenByActorRef.current = {};
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

      // ── SPECTATORS live sync ───────────────────────────────────────────────
      setSpectators(
        Object.values(room.spectators ?? {}).sort((a, b) => a.joinedAt - b.joinedAt)
      );

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
          room.lastAction.actorId !== mpConfig.userId &&
          room.lastAction.seq > (lastSeenByActorRef.current[room.lastAction.actorId] ?? 0);

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
      //
      // IMPORTANT: seq is a per-device counter — each player's device starts at 0
      // and increments independently. We must NOT compare remote players' seq
      // against our own lastSeenSeqRef (which tracks our own reflected actions).
      // Instead use a per-actorId map so Player 2's seq=1 is never filtered out
      // because Player 1 has already seen their own seq=3.
      if (!room.lastAction) return;
      const action = room.lastAction;

      if (action.actorId === mpConfig.userId) {
        // Own action reflected back from Firestore — suppress relay but track seq
        // so future re-deliveries of the same action are also skipped.
        if (action.seq > lastSeenSeqRef.current) lastSeenSeqRef.current = action.seq;
        return;
      }

      // Remote action — deduplicate per actor using per-actorId seq tracking.
      const lastSeenForActor = lastSeenByActorRef.current[action.actorId] ?? 0;
      if (action.seq <= lastSeenForActor) return;
      lastSeenByActorRef.current[action.actorId] = action.seq;
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
          {spectators.length > 0 && (
            <View style={styles.toolBtnBadge}>
              <Text style={styles.toolBtnBadgeText}>{spectators.length}</Text>
            </View>
          )}
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
            <TouchableOpacity
              style={styles.toolMenuItem}
              activeOpacity={0.75}
              onPress={() => {
                setToolMenuOpen(false);
                setTimeout(() => setWatchersOpen(true), 150);
              }}
            >
              <Text style={styles.toolMenuItemIcon}>👁️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.toolMenuItemLabel}>
                  Watching
                  {spectators.length > 0 ? ` · ${spectators.length}` : ''}
                </Text>
                <Text style={styles.toolMenuItemSub}>
                  {spectators.length === 0
                    ? 'No one is watching yet'
                    : spectators.length === 1
                    ? '1 person watching live'
                    : `${spectators.length} people watching live`}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>

            {/* Secret Key — premium red option */}
            <TouchableOpacity
              style={styles.secretKeyMenuItem}
              activeOpacity={0.75}
              onPress={() => {
                setToolMenuOpen(false);
                setSecretKeyInput('');
                setSecretKeyError('');
                setSecretKeySuccess(false);
                setTimeout(() => setSecretKeyModalOpen(true), 150);
              }}
            >
              <Text style={styles.secretKeyMenuIcon}>🔐</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.secretKeyMenuLabel}>
                  Secret Key{secretKeyActivated ? ' ✓' : ''}
                </Text>
                <Text style={styles.secretKeyMenuSub}>
                  {secretKeyActivated ? 'Activated' : 'Enter access code'}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color="rgba(239,68,68,0.5)" />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── SECRET KEY modal ── */}
      <Modal
        visible={secretKeyModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => { setSecretKeyModalOpen(false); setSecretKeyError(''); setSecretKeySuccess(false); }}
      >
        <Pressable style={styles.skBackdrop} onPress={() => { setSecretKeyModalOpen(false); setSecretKeyError(''); setSecretKeySuccess(false); }}>
          <Pressable style={styles.skCard} onPress={() => {}}>
            <View style={styles.skHandle} />

            {secretKeySuccess ? (
              <View style={styles.skSuccessBox}>
                <Text style={styles.skSuccessIcon}>👾</Text>
                <Text style={styles.skSuccessTitle}>Secret Key Activated</Text>
                <Text style={styles.skSuccessSub}>Welcome to the inner circle</Text>
              </View>
            ) : (
              <>
                <View style={styles.skHeader}>
                  <Text style={styles.skLockIcon}>🔐</Text>
                  <View>
                    <Text style={styles.skTitle}>Secret Key</Text>
                    <Text style={styles.skSub}>Enter your exclusive access code</Text>
                  </View>
                </View>

                <View style={styles.skDivider} />

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                  <TextInput
                    style={[styles.skInput, secretKeyError ? styles.skInputError : null]}
                    placeholder="Enter code…"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={secretKeyInput}
                    onChangeText={(t) => { setSecretKeyInput(t); setSecretKeyError(''); }}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={10}
                    onSubmitEditing={handleSecretKeyConfirm}
                    returnKeyType="done"
                  />
                  {secretKeyError ? (
                    <Text style={styles.skErrorText}>{secretKeyError}</Text>
                  ) : null}
                </KeyboardAvoidingView>

                <View style={styles.skBtnRow}>
                  <TouchableOpacity
                    style={styles.skCancelBtn}
                    activeOpacity={0.75}
                    onPress={() => { setSecretKeyModalOpen(false); setSecretKeyError(''); setSecretKeyInput(''); }}
                  >
                    <Text style={styles.skCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.skConfirmBtn}
                    activeOpacity={0.75}
                    onPress={handleSecretKeyConfirm}
                  >
                    <Text style={styles.skConfirmText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── FLOATING HACK PANEL — draggable anywhere on screen ── */}
      {isVisible && mpConfig && ludoScreen === 'game' && secretKeyActivated && monsterPanelOpen && (
        <Animated.View
          style={[
            styles.hackFloatPanel,
            { transform: [{ translateX: hackPanelPos.x }, { translateY: hackPanelPos.y }] },
          ]}
        >
          {/* Drag handle bar — touching this area moves the panel */}
          <View {...hackPanelPanResponder.panHandlers} style={styles.hackDragBar}>
            <View style={styles.hackDragDots}>
              <View style={[styles.hackDot, { backgroundColor: '#FF5F57' }]} />
              <View style={[styles.hackDot, { backgroundColor: '#FEBC2E' }]} />
              <View style={[styles.hackDot, { backgroundColor: '#28C840' }]} />
            </View>
            <Text style={styles.hackPanelTitle}>⚡ DICE_OVERRIDE</Text>
            <TouchableOpacity onPress={() => setMonsterPanelOpen(false)} style={styles.hackXBtn} activeOpacity={0.7}>
              <Text style={styles.hackXText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Terminal status line */}
          <View style={styles.hackTermRow}>
            <Text style={styles.hackTermText}>{'> root@sys: INJECT MODE ACTIVE_'}</Text>
          </View>

          {/* 6 hack buttons — 2 columns × 3 rows */}
          <View style={styles.hackBtnGrid}>
            {MCP_SLOTS.map((slot, idx) => {
              const diceVal = idx + 1;
              const isActive = hackedSlot === slot.id;
              return (
                <TouchableOpacity
                  key={slot.id}
                  activeOpacity={0.72}
                  style={[
                    styles.hackBtn,
                    {
                      borderColor: isActive ? slot.color : slot.border + '77',
                      backgroundColor: isActive ? slot.glow : 'rgba(0,255,65,0.03)',
                      shadowColor: isActive ? slot.color : 'transparent',
                      shadowOpacity: isActive ? 0.9 : 0,
                      shadowRadius: isActive ? 8 : 0,
                      elevation: isActive ? 8 : 2,
                    },
                  ]}
                  onPress={() => {
                    const js = `(function(){
                      try {
                        if (typeof window.__hackSetNextDice === 'function') {
                          window.__hackSetNextDice(${diceVal});
                        }
                      } catch(e) { console.warn('[HACK]', String(e)); }
                    })();true;`;
                    webViewRef.current?.injectJavaScript(js);
                    setHackedSlot(slot.id);
                    setTimeout(() => setHackedSlot(null), 900);
                  }}
                >
                  {isActive && <View style={[styles.hackBtnFlash, { backgroundColor: slot.color + '20' }]} />}
                  <Text style={[styles.hackBtnEmoji, isActive && { transform: [{ scale: 1.15 }] }]}>
                    {slot.emoji}
                  </Text>
                  <Text style={[styles.hackBtnNum, { color: isActive ? slot.color : '#00FF41' }]}>
                    {`[0${diceVal}]`}
                  </Text>
                  <Text style={[styles.hackBtnLabel, { color: isActive ? slot.color : 'rgba(0,255,65,0.5)' }]}>
                    {slot.shortName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Status bar */}
          <View style={styles.hackStatusRow}>
            <Text style={[styles.hackStatusTxt, { color: hackedSlot ? '#FFD600' : '#00FF41' }]}>
              {hackedSlot
                ? `⚡ INJECTING → DICE ${MCP_SLOTS.findIndex(s => s.id === hackedSlot) + 1}`
                : '● STANDING BY · AWAITING COMMAND'}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Minimized chip — tap to reopen, drag to reposition */}
      {isVisible && mpConfig && ludoScreen === 'game' && secretKeyActivated && !monsterPanelOpen && (
        <Animated.View
          style={[
            styles.hackMinChip,
            { transform: [{ translateX: monsterPos.x }, { translateY: monsterPos.y }] },
          ]}
          {...monsterPanResponder.panHandlers}
        >
          <TouchableOpacity onPress={() => setMonsterPanelOpen(true)} style={styles.hackMinTouch} activeOpacity={0.8}>
            <Text style={styles.hackMinEmoji}>👾</Text>
            <Text style={styles.hackMinLabel}>HACK</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

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

      {/* ── WATCHERS Panel modal ── */}
      <Modal
        visible={watchersOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setWatchersOpen(false)}
      >
        <Pressable
          style={styles.toolMenuBackdrop}
          onPress={() => setWatchersOpen(false)}
        >
          <Pressable style={styles.watchersCard} onPress={() => {}}>
            <View style={styles.toolMenuHandle} />

            {/* Header */}
            <View style={styles.watchersHeader}>
              <View style={styles.watchersEyeBadge}>
                <Text style={{ fontSize: 18 }}>👁️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toolMenuTitle}>Watching Now</Text>
                <Text style={styles.watchersSubtitle}>
                  {spectators.length === 0
                    ? 'No spectators yet'
                    : spectators.length === 1
                    ? '1 person watching this match'
                    : `${spectators.length} people watching this match`}
                </Text>
              </View>
              <View style={styles.watchersCountBubble}>
                <Text style={styles.watchersCountBubbleText}>{spectators.length}</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.watchersDivider} />

            {/* Spectator list */}
            {spectators.length === 0 ? (
              <View style={styles.watchersEmptyWrap}>
                <Text style={styles.watchersEmptyIcon}>🎭</Text>
                <Text style={styles.watchersEmptyText}>Share the Room ID to let friends watch live</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.watchersList}
                showsVerticalScrollIndicator={false}
              >
                {spectators.map((sp, idx) => (
                  <View key={sp.userId} style={styles.watcherRow}>
                    {/* Avatar */}
                    {sp.photo ? (
                      <Image source={{ uri: sp.photo }} style={styles.watcherAvatar} />
                    ) : (
                      <View style={[styles.watcherAvatar, styles.watcherAvatarFallback]}>
                        <Text style={styles.watcherAvatarInitial}>
                          {(sp.name || '?')[0].toUpperCase()}
                        </Text>
                      </View>
                    )}
                    {/* Name + index */}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.watcherName} numberOfLines={1}>{sp.name || 'Spectator'}</Text>
                      <Text style={styles.watcherStatus}>👁️ Watching live</Text>
                    </View>
                    {/* Sequence number */}
                    <View style={styles.watcherIndexBadge}>
                      <Text style={styles.watcherIndexText}>#{idx + 1}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
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

      {/* floating monster icon replaced by hackMinChip above */}

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

  // ── Tool button badge ─────────────────────────────────────────────────────────
  toolBtnBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'rgba(10,6,22,0.9)',
  },
  toolBtnBadgeText: {
    color: '#000',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    lineHeight: 13,
  },

  // ── Watchers panel ────────────────────────────────────────────────────────────
  watchersCard: {
    backgroundColor: 'rgba(14,8,28,0.97)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 10,
    gap: 14,
    maxHeight: '75%',
  },
  watchersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  watchersEyeBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchersSubtitle: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  watchersCountBubble: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  watchersCountBubbleText: {
    color: '#F59E0B',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  watchersDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: -4,
    marginTop: -4,
  },
  watchersList: {
    maxHeight: 340,
  },
  watchersEmptyWrap: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 10,
  },
  watchersEmptyIcon: {
    fontSize: 36,
  },
  watchersEmptyText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  watcherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  watcherAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  watcherAvatarFallback: {
    backgroundColor: 'rgba(245,158,11,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  watcherAvatarInitial: {
    color: '#F59E0B',
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
  },
  watcherName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  watcherStatus: {
    color: 'rgba(255,255,255,0.40)',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  watcherIndexBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(245,158,11,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
  },
  watcherIndexText: {
    color: 'rgba(245,158,11,0.8)',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },

  // ── Secret Key menu item ───────────────────────────────────────────────────
  secretKeyMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.20)',
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 12,
  },
  secretKeyMenuIcon: {
    fontSize: 18,
  },
  secretKeyMenuLabel: {
    color: '#EF4444',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.2,
  },
  secretKeyMenuSub: {
    color: 'rgba(239,68,68,0.55)',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },

  // ── Secret Key modal ───────────────────────────────────────────────────────
  skBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  skCard: {
    width: '100%',
    backgroundColor: 'rgba(10,4,20,0.98)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.30)',
    paddingHorizontal: 22,
    paddingVertical: 24,
    gap: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  skHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(239,68,68,0.25)',
    alignSelf: 'center',
    marginBottom: 2,
  },
  skHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  skLockIcon: {
    fontSize: 32,
  },
  skTitle: {
    color: '#EF4444',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },
  skSub: {
    color: 'rgba(255,255,255,0.40)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  skDivider: {
    height: 1,
    backgroundColor: 'rgba(239,68,68,0.15)',
  },
  skInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 4,
    textAlign: 'center',
  },
  skInputError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  skErrorText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    marginTop: 6,
  },
  skBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  skCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  skCancelText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  skConfirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.45)',
  },
  skConfirmText: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  skSuccessBox: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  skSuccessIcon: {
    fontSize: 56,
  },
  skSuccessTitle: {
    color: '#22C55E',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  skSuccessSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },

  // ── Floating Monster Icon ──────────────────────────────────────────────────
  monsterFloat: {
    position: 'absolute',
    zIndex: 9000,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monsterTouchable: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monsterGlow: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(139,92,246,0.28)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 14,
    elevation: 10,
  },
  monsterEmoji: {
    fontSize: 36,
    textShadowColor: 'rgba(139,92,246,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // ── Floating Hack Panel ───────────────────────────────────────────────────
  hackFloatPanel: {
    position: 'absolute',
    zIndex: 9100,
    width: 220,
    backgroundColor: '#020C02',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#00FF4144',
    shadowColor: '#00FF41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 24,
    overflow: 'hidden',
  },
  // Drag handle bar at top
  hackDragBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1A0A',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#00FF4122',
  },
  hackDragDots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  hackDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  hackPanelTitle: {
    color: '#00FF41',
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
    flex: 1,
  },
  hackXBtn: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF000022',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FF000055',
  },
  hackXText: {
    color: '#FF4444',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    lineHeight: 14,
  },
  // Terminal status row
  hackTermRow: {
    backgroundColor: '#010A01',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#00FF4115',
  },
  hackTermText: {
    color: '#00CC33',
    fontSize: 8,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.4,
  },
  // 2 × 3 button grid
  hackBtnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 7,
  },
  hackBtn: {
    width: '29%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    overflow: 'hidden',
    position: 'relative',
    shadowOffset: { width: 0, height: 0 },
  },
  hackBtnFlash: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 8,
  },
  hackBtnEmoji: {
    fontSize: 24,
  },
  hackBtnNum: {
    fontSize: 8,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
  },
  hackBtnLabel: {
    fontSize: 7,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.0,
  },
  // Status bar
  hackStatusRow: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: '#00FF4115',
    backgroundColor: '#010A01',
  },
  hackStatusTxt: {
    fontSize: 8,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.8,
  },
  // Minimized chip
  hackMinChip: {
    position: 'absolute',
    zIndex: 9000,
    borderRadius: 20,
    backgroundColor: '#020C02',
    borderWidth: 1,
    borderColor: '#00FF4144',
    shadowColor: '#00FF41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 16,
  },
  hackMinTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
  },
  hackMinEmoji: {
    fontSize: 18,
  },
  hackMinLabel: {
    color: '#00FF41',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
  },
});
