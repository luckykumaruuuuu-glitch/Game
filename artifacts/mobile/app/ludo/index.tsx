import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  View, StyleSheet, SafeAreaView, StatusBar,
  TouchableOpacity, Text,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { subscribeToGameInvites } from '@/lib/firestore';

export default function LudoGameScreen() {
  const { resolvedTheme } = useTheme();
  const { user } = useAuth();
  const isDark = resolvedTheme === 'dark';
  const iframeRef = useRef<any>(null);
  const [ludoScreen, setLudoScreen] = useState('home');
  const [pendingInvites, setPendingInvites] = useState(0);

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
        if (data?.type === 'screenChange') {
          setLudoScreen(data.screen ?? 'home');
        } else if (data?.type === 'action' && data?.action === 'onlineFriend') {
          router.push('/ludo/online-friend' as any);
        } else if (data?.type === 'action' && data?.action === 'offlineFriend') {
          router.push('/ludo/offline-friend' as any);
        }
      } catch {}
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (!user) return;
    return subscribeToGameInvites(user.uid, (invites) => {
      setPendingInvites(invites.length);
    });
  }, [user]);

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

        {/* Invites button — top-right overlay */}
        <TouchableOpacity
          style={[
            styles.inviteBtn,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' },
          ]}
          onPress={() => router.push('/ludo/invites' as any)}
          activeOpacity={0.8}
        >
          <Feather name="inbox" size={16} color={isDark ? '#fff' : '#1a1410'} />
          <Text style={[styles.inviteBtnText, { color: isDark ? '#fff' : '#1a1410' }]}>
            Invites
          </Text>
          {pendingInvites > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {pendingInvites > 9 ? '9+' : pendingInvites}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  iframeWrap: { flex: 1, position: 'relative' } as any,
  inviteBtn: {
    position: 'absolute' as any,
    top: 10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    zIndex: 100,
  },
  inviteBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  badge: {
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
});
