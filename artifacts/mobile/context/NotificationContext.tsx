import React, { createContext, useContext, useEffect, useState } from "react";
import { Notification, subscribeToNotifications } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";

interface NotificationCounts {
  friendCount: number;
  messageCount: number;
  gameCount: number;
  generalCount: number;
  totalCount: number;
  allNotifications: Notification[];
}

interface NotificationContextType extends NotificationCounts {
  ready: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  friendCount: 0,
  messageCount: 0,
  gameCount: 0,
  generalCount: 0,
  totalCount: 0,
  allNotifications: [],
  ready: false,
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setAllNotifications([]);
      setReady(false);
      return;
    }

    const unsub = subscribeToNotifications(user.uid, (notifs) => {
      setAllNotifications(notifs);
      setReady(true);
    });

    return () => {
      unsub();
      setAllNotifications([]);
      setReady(false);
    };
  }, [user?.uid]);

  const unread = allNotifications.filter((n) => !n.read);

  const friendCount = unread.filter(
    (n) => n.type === "friend_request" || n.type === "friend_accepted"
  ).length;

  const messageCount = unread.filter((n) => n.type === "message").length;

  const gameCount = unread.filter((n) => n.type === "game_invite").length;

  const generalCount = unread.filter((n) => n.type === "general").length;

  const totalCount = unread.length;

  return (
    <NotificationContext.Provider
      value={{
        friendCount,
        messageCount,
        gameCount,
        generalCount,
        totalCount,
        allNotifications,
        ready,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
