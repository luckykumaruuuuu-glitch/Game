import React, {
  createContext, useContext, useRef, useState, useCallback, useEffect,
} from 'react';
import {
  View, Pressable, StyleSheet, Platform,
  StatusBar, ActivityIndicator, Text, TouchableOpacity,
  AppState,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  subscribeToGameInvites,
  subscribeToGameRoom,
  writeGameAction,
  writeCurrentTurn,
  saveGameState,
  markPlayerExit,
  markPlayerRejoin,
  castExitVote,
  GameAction,
  SavedGameState,
  GameRoomPlayer,
  PlayerStatus,
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
    mpConfigRef.current = cfg;
    setMpConfig(cfg);
    setDebugTurn(-1);
    setMoveLog([]);
    setExitPlayers([]);
    setWinnerInfo(null);
  }

  useEffect(() => {
    console.log('[GAME_SCREEN_MOUNTED] native WebView overlay mounted, isVisible=' + isVisible);
  }, []);

  useEffect(() => { resolvedThemeRef.current = resolvedTheme; }, [resolvedTheme]);

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

        if (fbTurn !== lastKnownTurnRef.current && fbTurn !== mpConfig.myPlayerIndex) {
          lastKnownTurnRef.current = fbTurn;
          const syncJs =
            `(function(){try{` +
              `if(typeof window._setTurnPlayer==='function'){` +
                `window._setTurnPlayer(${fbTurn});` +
              `}` +
            `}catch(e){console.warn('[MP turn sync]',String(e));}` +
            `})();true;`;
          setTimeout(() => { webViewRef.current?.injectJavaScript(syncJs); }, 80);
        } else if (fbTurn !== lastKnownTurnRef.current) {
          lastKnownTurnRef.current = fbTurn;
        }
      }

      // ── lastAction relay ──────────────────────────────────────────────────
      if (!room.lastAction) return;
      const action = room.lastAction;
      if (action.seq <= lastSeenSeqRef.current) return;
      lastSeenSeqRef.current = action.seq;
      if (action.actorId === mpConfig.userId) return;
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

      {/* Move history log — shown during online games, floats above debug bar */}
      {isVisible && mpConfig && moveLog.length > 0 && (
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

      {/* Multiplayer debug bar — shown during online games */}
      {isVisible && mpConfig && (
        <View style={[styles.mpDebug, { bottom: insets.bottom + 6 }]}>
          <Text style={styles.mpDebugText}>
            {'UID:' + mpConfig.userId.slice(-8) +
             '  ·  ' +
             (MP_COLORS[mpConfig.myPlayerIndex]?.emoji ?? '⬜') + ' Me:' +
             (MP_COLORS[mpConfig.myPlayerIndex]?.name ?? '?') +
             '(P' + mpConfig.myPlayerIndex + ')' +
             '  ·  Turn:' +
             (debugTurn >= 0
               ? ((MP_COLORS[debugTurn]?.emoji ?? '⬜') + (MP_COLORS[debugTurn]?.name ?? '?') + '(P' + debugTurn + ')')
               : '…') +
             '  ·  ' +
             (debugTurn === mpConfig.myPlayerIndex ? '✓ MY TURN' : '⏳ waiting')}
          </Text>
        </View>
      )}

      {/* EXIT players voting panel — shown during online games when someone disconnects */}
      {isVisible && mpConfig && exitPlayers.length > 0 && (
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
});
