import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Pressable, StyleSheet, SafeAreaView,
  StatusBar, ActivityIndicator, Text, Platform,
} from 'react-native';
import { LUDO_GAME_HTML } from '../../lib/ludo/ludo-html';
import { useTheme } from '../../context/ThemeContext';

function LudoWeb() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const iframeRef = useRef<any>(null);

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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? '#080808' : '#F5F0EA' }]}>
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

function LudoNative() {
  const WebView = require('react-native-webview').WebView;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const webViewRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const bgColor = isDark ? '#080808' : '#F5F0EA';

  // Inject theme into localStorage + set class BEFORE any page script runs
  const injectedJavaScriptBeforeContentLoaded = `(function(){try{localStorage.setItem('theme','${resolvedTheme}');document.documentElement.classList.toggle('dark',${isDark});}catch(e){}})();true;`;

  // Send postMessage when theme changes while game is already open
  useEffect(() => {
    webViewRef.current?.postMessage(
      JSON.stringify({ type: 'setTheme', theme: resolvedTheme })
    );
  }, [resolvedTheme]);

  // Safety: clear loading after 8s if onLoadEnd never fires
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {loading && !error && (
        <View style={[styles.loadingOverlay, { backgroundColor: bgColor }]}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={[styles.loadingText, { color: isDark ? '#9CA3AF' : '#6B5E4A' }]}>
            Loading game…
          </Text>
        </View>
      )}

      {error && (
        <View style={[styles.errorBox, { backgroundColor: bgColor }]}>
          <Text style={[styles.errorText, { color: isDark ? '#9CA3AF' : '#6B5E4A' }]}>
            Could not load game.
          </Text>
          <Pressable
            onPress={() => { setError(false); setLoading(true); webViewRef.current?.reload(); }}
            style={styles.retryBtn}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      <WebView
        ref={webViewRef}
        style={[styles.webview, error && styles.hidden]}
        source={{ html: LUDO_GAME_HTML, baseUrl: 'https://leludo.app' }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
        onLoadStart={() => { setLoading(true); setError(false); }}
        onLoadEnd={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true); }}
        onHttpError={() => { setLoading(false); setError(true); }}
        mixedContentMode="always"
        allowsBackForwardNavigationGestures={false}
        bounces={false}
        overScrollMode="never"
      />
    </SafeAreaView>
  );
}

export default function LudoGameScreen() {
  return Platform.OS === 'web' ? <LudoWeb /> : <LudoNative />;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  iframeWrap: { flex: 1, position: 'relative' } as any,
  webview: { flex: 1 },
  hidden: { opacity: 0, height: 0 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 10,
  },
  loadingText: { fontSize: 14 },
  errorBox: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16,
  },
  errorText: { fontSize: 15 },
  retryBtn: {
    backgroundColor: '#7C3AED', borderRadius: 10,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  retryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
