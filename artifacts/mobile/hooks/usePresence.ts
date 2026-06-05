import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { setUserOnline } from '@/lib/ludoFirestore';

export function usePresence() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    setUserOnline(uid, true).catch(() => {});

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setUserOnline(uid, true).catch(() => {});
      } else {
        setUserOnline(uid, false).catch(() => {});
      }
    });

    return () => {
      sub.remove();
      setUserOnline(uid, false).catch(() => {});
    };
  }, [user]);
}
