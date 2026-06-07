import React, { useRef, useState } from 'react';
import {
  View, Pressable, StyleSheet, SafeAreaView,
  StatusBar, ActivityIndicator, Text, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LUDO_GAME_HTML } from '../../lib/ludo/ludo-html';

function WebBackButton({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.topBar}>
      <Pressable style={styles.backBtn} onPress={onPress}>
        <Ionicons name="chevron-back" size={20} color="#1a1410" />
      </Pressable>
      <Text style={styles.topTitle}>Ludo</Text>
      <View style={styles.backBtn} />
    </View>
  );
}

// ─── Web (Expo web / browser preview): render an iframe ───────────────────────
function LudoWeb() {
  const [loaded, setLoaded] = useState(false);
  const blob = React.useMemo(() => {
    if (typeof Blob !== 'undefined') {
      return URL.createObjectURL(new Blob([LUDO_GAME_HTML], { type: 'text/html' }));
    }
    return null;
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <WebBackButton onPress={() => router.replace('/(tabs)' as any)} />
      {!loaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading game…</Text>
        </View>
      )}
      {blob ? (
        <iframe
          src={blob}
          style={{ flex: 1, border: 'none', width: '100%', height: '100%' } as any}
          onLoad={() => setLoaded(true)}
          title="Ludo"
        />
      ) : (
        <iframe
          srcDoc={LUDO_GAME_HTML}
          style={{ flex: 1, border: 'none', width: '100%', height: '100%' } as any}
          onLoad={() => setLoaded(true)}
          title="Ludo"
        />
      )}
    </SafeAreaView>
  );
}

// ─── Native (iOS / Android): react-native-webview ─────────────────────────────
function LudoNative() {
  const WebView = require('react-native-webview').WebView;
  const webViewRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <WebBackButton onPress={() => router.replace('/(tabs)' as any)} />

      {loading && !error && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading game…</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Could not load game.</Text>
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
  safe: { flex: 1, backgroundColor: '#EFE9DC' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EFE9DC',
    borderBottomWidth: 1,
    borderBottomColor: '#D4C9B0',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontSize: 16, fontWeight: '600', color: '#1a1410' },
  webview: { flex: 1 },
  hidden: { opacity: 0, height: 0 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EFE9DC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 10,
  },
  loadingText: { fontSize: 14, color: '#6B5E4A' },
  errorBox: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16,
    backgroundColor: '#EFE9DC',
  },
  errorText: { fontSize: 15, color: '#6B5E4A' },
  retryBtn: {
    backgroundColor: '#1a1410', borderRadius: 10,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  retryText: { color: '#EDE4D3', fontSize: 15, fontWeight: '600' },
});
