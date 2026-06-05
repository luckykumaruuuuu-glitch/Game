import { router } from 'expo-router';
import { useEffect } from 'react';

export default function LudoTab() {
  useEffect(() => {
    router.push('/ludo');
  }, []);
  return null;
}
