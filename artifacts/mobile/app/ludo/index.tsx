import React, { useRef, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function LudoGameScreen() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const iframeRef = useRef<any>(null);

  useEffect(() => {
    console.log('[GAME_SCREEN_MOUNTED] web iframe screen mounted');
  }, []);

  const gameUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/ludo-game.html`
    : '/ludo-game.html';

  const sendTheme = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ type: 'setTheme', theme: resolvedTheme }),
      '*'
    );
  }, [resolvedTheme]);

  useEffect(() => {
    sendTheme();
  }, [sendTheme]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data?.type === 'action' && data?.action === 'onlineFriend') {
          router.push('/ludo/online-friend' as any);
        } else if (data?.type === 'action' && data?.action === 'offlineFriend') {
          router.push('/ludo/offline-friend' as any);
        }
      } catch {}
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const bgColor = isDark ? '#080808' : '#F5F5F7';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.iframeWrap}>
        <iframe
          ref={iframeRef}
          src={gameUrl}
          onLoad={sendTheme}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          } as any}
          title="Ludo"
          allow="autoplay"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  iframeWrap: { flex: 1, position: 'relative' } as any,
});
