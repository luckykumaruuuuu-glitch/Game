import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import {
  GameRoom,
  GameRoomPlayer,
  leaveRoomAsSpectator,
  subscribeToGameRoom,
} from '@/lib/firestore';
import { LUDO_GAME_HTML } from '@/lib/ludo/ludo-html';

// Matches HUMAN_PREFERRED_POSITIONS inside the Ludo game HTML bundle.
const HUMAN_PREFERRED_POSITIONS = [2, 0, 1, 3];
const AMBER = '#F59E0B';
const PLAYER_COLORS = ['#34D399', '#FBBF24', '#F87171', '#60A5FA'];

function buildQuickStartId(gameMode: 2 | 3 | 4): string {
  if (gameMode === 4) return 'qs,4,0';
  const humanColors = HUMAN_PREFERRED_POSITIONS.slice(0, gameMode).join(',');
  return `qs,${gameMode},0,${humanColors}`;
}

function buildNamesByPlayerIndex(
  sortedPlayers: GameRoomPlayer[],
  gameMode: 2 | 3 | 4
): string[] {
  const names = ['', '', '', ''];
  sortedPlayers.slice(0, gameMode).forEach((player, i) => {
    names[HUMAN_PREFERRED_POSITIONS[i]] = player.name || '';
  });
  return names;
}

// Transparent overlay injected into WebView to block all user interaction.
// The spectator can see everything but cannot tap/drag anything.
const SPECTATOR_BLOCKER_JS = `
(function(){
  try {
    if (!document.getElementById('__spectator_blocker__')) {
      var b = document.createElement('div');
      b.id = '__spectator_blocker__';
      b.style.cssText = [
        'position:fixed',
        'top:0',
        'left:0',
        'width:100%',
        'height:100%',
        'z-index:99999',
        'pointer-events:all',
        'background:transparent',
        'touch-action:none',
        '-webkit-user-select:none',
        'user-select:none',
      ].join(';');
      // Swallow all touch/mouse events
      ['touchstart','touchend','touchmove','mousedown','mouseup','click'].forEach(function(ev){
        b.addEventListener(ev, function(e){ e.stopPropagation(); e.preventDefault(); }, {passive:false, capture:true});
      });
      document.body.appendChild(b);
    }
  } catch(e) { console.warn('[SPECTATOR] blocker inject failed', String(e)); }
})();true;
`;

export default function SpectatorScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const webViewRef = useRef<any>(null);
  const hasInitialized = useRef(false);
  const lastSeenSeqRef = useRef(0);
  const lastKnownTurnRef = useRef(-1);
  const roomInitRef = useRef<GameRoom | null>(null);

  const [room, setRoom] = useState<GameRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [webLoaded, setWebLoaded] = useState(false);

  // Subscribe to room in realtime
  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeToGameRoom(roomId, (r) => {
      setRoom(r);
      if (!roomInitRef.current && r) roomInitRef.current = r;
      setLoading(false);
    });
    return unsub;
  }, [roomId]);

  // When WebView finishes loading, start game in read-only spectator mode
  const handleWebViewLoaded = useCallback(() => {
    if (hasInitialized.current) return;
    const initRoom = roomInitRef.current;
    if (!initRoom) return;
    hasInitialized.current = true;
    setWebLoaded(true);

    const sortedPlayers = Object.values(initRoom.players).sort(
      (a, b) => a.joinedAt - b.joinedAt
    );
    const quickStartId = buildQuickStartId(initRoom.gameMode as 2 | 3 | 4);
    const namesByPlayerIndex = buildNamesByPlayerIndex(
      sortedPlayers,
      initRoom.gameMode as 2 | 3 | 4
    );

    // 1. Start the game visually (NO _initMultiplayer — spectator has no player index)
    const startJs = `
(function(){
  try {
    var fn = window._ludoDispatch || window.dispatch;
    if (typeof fn === 'function') {
      fn({
        type: 'START_GAME',
        quickStartId: ${JSON.stringify(quickStartId)},
        namesByPlayerIndex: ${JSON.stringify(namesByPlayerIndex)},
      });
    }
  } catch(e) { console.warn('[SPECTATOR] startGame failed', String(e)); }
})();true;`;
    webViewRef.current?.injectJavaScript(startJs);

    // 2. Block all interaction after a short delay (game HTML needs a moment to mount)
    setTimeout(() => {
      webViewRef.current?.injectJavaScript(SPECTATOR_BLOCKER_JS);
    }, 400);

    // 3. Restore saved game state so spectator sees current board position
    if (initRoom.gameState) {
      setTimeout(() => {
        const restoreJs = `
(function(){
  try {
    if (typeof window._restoreGameState === 'function') {
      window._restoreGameState(${JSON.stringify(initRoom.gameState)});
    }
  } catch(e) { console.warn('[SPECTATOR] restoreState failed', String(e)); }
})();true;`;
        webViewRef.current?.injectJavaScript(restoreJs);
      }, 1400);
    }

    // 4. Sync current turn
    if (typeof initRoom.currentTurnPlayerIndex === 'number') {
      setTimeout(() => {
        const turnJs = `
(function(){
  try {
    if (typeof window._setTurnPlayer === 'function') {
      window._setTurnPlayer(${initRoom.currentTurnPlayerIndex});
    }
  } catch(e) {}
})();true;`;
        webViewRef.current?.injectJavaScript(turnJs);
        lastKnownTurnRef.current = initRoom.currentTurnPlayerIndex!;
      }, 1800);
    }
  }, []);

  // Apply realtime game updates to the WebView as they arrive
  useEffect(() => {
    if (!room || !webLoaded) return;

    // Turn sync
    if (
      typeof room.currentTurnPlayerIndex === 'number' &&
      room.currentTurnPlayerIndex !== lastKnownTurnRef.current
    ) {
      lastKnownTurnRef.current = room.currentTurnPlayerIndex;
      const syncJs = `
(function(){
  try {
    if (typeof window._setTurnPlayer === 'function') {
      window._setTurnPlayer(${room.currentTurnPlayerIndex});
    }
  } catch(e) {}
})();true;`;
      setTimeout(() => { webViewRef.current?.injectJavaScript(syncJs); }, 80);
    }

    // Action relay — mirror every remote action into the WebView engine
    if (room.lastAction && room.lastAction.seq > lastSeenSeqRef.current) {
      lastSeenSeqRef.current = room.lastAction.seq;
      const action = room.lastAction;
      const js = `
(function(){
  try {
    if (typeof window._applyRemoteAction === 'function') {
      window._applyRemoteAction(${JSON.stringify(action)});
    }
  } catch(e) { console.warn('[SPECTATOR] applyRemoteAction failed', String(e)); }
})();true;`;
      setTimeout(() => { webViewRef.current?.injectJavaScript(js); }, 50);
    }
  }, [room, webLoaded]);

  // Leave spectator slot when exiting
  const handleExit = useCallback(() => {
    if (roomId && user?.uid) {
      leaveRoomAsSpectator(roomId, user.uid).catch(console.warn);
    }
    router.back();
  }, [roomId, user?.uid]);

  const players: GameRoomPlayer[] = room
    ? Object.values(room.players).sort((a, b) => a.joinedAt - b.joinedAt)
    : [];

  // Find which player's turn it currently is (by board position index)
  const currentTurnPlayer = room && typeof room.currentTurnPlayerIndex === 'number'
    ? players.find((_, i) => HUMAN_PREFERRED_POSITIONS[i] === room.currentTurnPlayerIndex)
    : null;

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.webFallback}>Spectator mode is only available on mobile.</Text>
      </View>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const WebView = require('react-native-webview').WebView;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={handleExit} style={styles.backBtn} hitSlop={10}>
          <Feather name="x" size={19} color="#fff" />
        </Pressable>

        <View style={styles.spectatorBadge}>
          <Feather name="eye" size={12} color={AMBER} />
          <Text style={styles.spectatorLabel}>WATCHING MATCH</Text>
        </View>

        <View style={styles.turnWrap}>
          {currentTurnPlayer ? (
            <Text style={styles.turnText} numberOfLines={1}>
              {currentTurnPlayer.name}'s turn
            </Text>
          ) : (
            <View style={{ width: 80 }} />
          )}
        </View>
      </View>

      {/* ── Game Board (WebView) ────────────────────────────────────── */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={AMBER} />
          <Text style={styles.loadingText}>Loading match…</Text>
        </View>
      ) : room === null ? (
        <View style={styles.loadingWrap}>
          <Feather name="alert-circle" size={36} color="rgba(255,255,255,0.4)" />
          <Text style={styles.loadingText}>Room not found</Text>
          <Pressable onPress={handleExit} style={styles.leaveBtn}>
            <Text style={styles.leaveBtnText}>Go Back</Text>
          </Pressable>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: LUDO_GAME_HTML }}
          style={styles.webView}
          onLoadEnd={handleWebViewLoaded}
          javaScriptEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          originWhitelist={['*']}
          onMessage={() => {}}
        />
      )}

      {/* ── Player Chips (bottom bar) ───────────────────────────────── */}
      {!loading && players.length > 0 && (
        <View style={[styles.playerBar, { paddingBottom: insets.bottom + 8 }]}>
          {players.map((p, i) => {
            const isCurrentTurn =
              HUMAN_PREFERRED_POSITIONS[i] === room?.currentTurnPlayerIndex;
            const isKicked = p.playerStatus === 'KICKED';
            return (
              <View
                key={p.userId}
                style={[
                  styles.playerChip,
                  isCurrentTurn && styles.playerChipActive,
                  isKicked && styles.playerChipKicked,
                ]}
              >
                <View
                  style={[
                    styles.playerDot,
                    { backgroundColor: PLAYER_COLORS[i % PLAYER_COLORS.length] },
                    isKicked && { opacity: 0.35 },
                  ]}
                />
                <Text
                  style={[
                    styles.playerChipText,
                    isCurrentTurn && styles.playerChipTextActive,
                    isKicked && styles.playerChipTextKicked,
                  ]}
                  numberOfLines={1}
                >
                  {p.name}
                </Text>
                {isCurrentTurn && !isKicked && (
                  <Feather name="clock" size={10} color={AMBER} style={{ marginLeft: 1 }} />
                )}
                {isKicked && (
                  <Feather name="x-circle" size={10} color="rgba(255,255,255,0.3)" style={{ marginLeft: 1 }} />
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* ── Match Ended Overlay ─────────────────────────────────────── */}
      {room?.status === 'finished' && (
        <View style={styles.endedOverlay}>
          <View style={styles.endedCard}>
            <Feather name="flag" size={30} color={AMBER} />
            <Text style={styles.endedTitle}>Match Ended</Text>
            <Text style={styles.endedSub}>Thanks for watching</Text>
            <Pressable onPress={handleExit} style={styles.endedBtn}>
              <Text style={styles.endedBtnText}>Leave</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a14',
  },

  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spectatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.4)',
  },
  spectatorLabel: {
    color: AMBER,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.2,
  },
  turnWrap: {
    width: 84,
    alignItems: 'flex-end',
  },
  turnText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },

  // ── WebView ──────────────────────────────────────────────────────────────────
  webView: { flex: 1 },

  // ── Loading / error ──────────────────────────────────────────────────────────
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  leaveBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  leaveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },

  // ── Player bar ───────────────────────────────────────────────────────────────
  playerBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
  },
  playerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  playerChipActive: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderColor: 'rgba(245,158,11,0.5)',
  },
  playerChipKicked: {
    opacity: 0.38,
  },
  playerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  playerChipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    maxWidth: 80,
  },
  playerChipTextActive: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
  playerChipTextKicked: {
    textDecorationLine: 'line-through',
    color: 'rgba(255,255,255,0.3)',
  },

  // ── Match ended overlay ──────────────────────────────────────────────────────
  endedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  endedCard: {
    backgroundColor: '#12122a',
    borderRadius: 22,
    padding: 32,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    width: 230,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  endedTitle: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    marginTop: 4,
  },
  endedSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  endedBtn: {
    marginTop: 12,
    paddingHorizontal: 32,
    paddingVertical: 13,
    borderRadius: 13,
    backgroundColor: AMBER,
  },
  endedBtnText: {
    color: '#000',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },

  // ── Web fallback ─────────────────────────────────────────────────────────────
  webFallback: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    padding: 24,
    opacity: 0.6,
  },
});
