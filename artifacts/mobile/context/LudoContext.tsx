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
import { subscribeToGameInvites } from '@/lib/firestore';
import { LUDO_GAME_HTML } from '@/lib/ludo/ludo-html';

interface LudoContextValue {
  show: () => void;
  hide: () => void;
  isVisible: boolean;
}

const LudoContext = createContext<LudoContextValue>({
  show: () => {},
  hide: () => {},
  isVisible: false,
});

export function useLudo() {
  return useContext(LudoContext);
}

function LudoNativeOverlay({
  isVisible,
  onHide,
}: {
  isVisible: boolean;
  onHide: () => void;
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

  useEffect(() => { resolvedThemeRef.current = resolvedTheme; }, [resolvedTheme]);

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
    </View>
  );
}

export function LudoProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const show = useCallback(() => {
    setHasLoaded(true);
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <LudoContext.Provider value={{ show, hide, isVisible }}>
      <View style={styles.root}>
        {children}
        {Platform.OS !== 'web' && hasLoaded && (
          <LudoNativeOverlay isVisible={isVisible} onHide={hide} />
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
});
