import {
  addDoc,
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  userId: string;
  username: string;
  name: string;
  email: string;
  authEmail?: string;
  photo: string;
  bio: string;
  qrCode: string;
  createdAt: number;
}

export interface ContentItem {
  contentId: string;
  userId: string;
  type: "image" | "text";
  url: string;
  caption?: string;
  timestamp: number;
}

export interface FriendRequest {
  requestId: string;
  senderId: string;
  receiverId: string;
  senderUsername: string;
  senderName: string;
  senderPhoto: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: number;
}

export interface ChatMessage {
  messageId: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface ChatRoom {
  chatId: string;
  participants: string[];
  lastMessage: string;
  lastTimestamp: number;
  otherUserProfile?: UserProfile | null;
}

export interface Notification {
  notifId: string;
  userId: string;
  type: "friend_request" | "friend_accepted" | "message" | "game_invite" | "general";
  title: string;
  body: string;
  fromUserId?: string;
  read: boolean;
  createdAt: number;
}

// ─── Username ─────────────────────────────────────────────────────────────────

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "usernames", username.toLowerCase()));
  return !snap.exists();
}

export async function createUserProfileWithUsername(
  userId: string,
  data: { email: string; username: string; authEmail?: string }
): Promise<void> {
  const usernameLower = data.username.toLowerCase();

  await runTransaction(db, async (tx) => {
    const usernameRef = doc(db, "usernames", usernameLower);
    const usernameSnap = await tx.get(usernameRef);

    if (usernameSnap.exists()) {
      const err: any = new Error("Username is already taken.");
      err.code = "username-taken";
      throw err;
    }

    tx.set(usernameRef, { userId, createdAt: Date.now() });
    tx.set(doc(db, "users", userId), {
      userId,
      username: usernameLower,
      name: usernameLower,
      email: data.email,
      authEmail: data.authEmail ?? data.email,
      photo: "",
      bio: "",
      qrCode: userId,
      createdAt: Date.now(),
    });
  });
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "usernames", username.toLowerCase()));
  if (!snap.exists()) return null;
  const { userId } = snap.data() as { userId: string };
  return getUserProfile(userId);
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function updateUserProfile(
  userId: string,
  data: Partial<Pick<UserProfile, "name" | "bio" | "photo">>
): Promise<void> {
  await updateDoc(doc(db, "users", userId), data);
}

export async function searchUsers(term: string, currentUserId: string): Promise<UserProfile[]> {
  if (!term.trim()) return [];
  const lower = term.toLowerCase().trim();

  const [byUsername, byName] = await Promise.all([
    getDocs(query(
      collection(db, "users"),
      where("username", ">=", lower),
      where("username", "<=", lower + "\uf8ff"),
      limit(20)
    )),
    getDocs(query(
      collection(db, "users"),
      where("name", ">=", lower),
      where("name", "<=", lower + "\uf8ff"),
      limit(20)
    )),
  ]);

  const seen = new Set<string>();
  const results: UserProfile[] = [];

  for (const snap of [byUsername, byName]) {
    for (const d of snap.docs) {
      const p = d.data() as UserProfile;
      if (p.userId === currentUserId || seen.has(p.userId)) continue;
      seen.add(p.userId);
      results.push(p);
    }
  }

  // Also check if the term matches a userId exactly
  if (!seen.has(lower) && lower.length > 10) {
    try {
      const byId = await getDoc(doc(db, "users", term.trim()));
      if (byId.exists()) {
        const p = byId.data() as UserProfile;
        if (p.userId !== currentUserId && !seen.has(p.userId)) {
          results.push(p);
        }
      }
    } catch { /* ignore */ }
  }

  return results;
}

// ─── Content ──────────────────────────────────────────────────────────────────

export async function getUserContent(userId: string): Promise<ContentItem[]> {
  const q = query(collection(db, "content"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ contentId: d.id, ...d.data() } as ContentItem))
    .sort((a, b) => b.timestamp - a.timestamp);
}

export async function addContent(
  userId: string,
  type: ContentItem["type"],
  url: string,
  caption?: string
): Promise<string> {
  const ref = await addDoc(collection(db, "content"), {
    userId,
    type,
    url,
    caption: caption ?? "",
    timestamp: Date.now(),
  });
  return ref.id;
}

export async function deleteContent(contentId: string): Promise<void> {
  await deleteDoc(doc(db, "content", contentId));
}

// ─── Friend Requests ──────────────────────────────────────────────────────────

export async function sendFriendRequest(
  senderId: string,
  senderProfile: UserProfile,
  receiverId: string
): Promise<void> {
  const existing = await getDocs(
    query(
      collection(db, "friendRequests"),
      where("senderId", "==", senderId),
      where("receiverId", "==", receiverId),
      where("status", "==", "pending")
    )
  );
  if (!existing.empty) {
    const err: any = new Error("Friend request already sent.");
    err.code = "already-sent";
    throw err;
  }

  await addDoc(collection(db, "friendRequests"), {
    senderId,
    receiverId,
    senderUsername: senderProfile.username,
    senderName: senderProfile.name,
    senderPhoto: senderProfile.photo,
    status: "pending",
    createdAt: Date.now(),
  });

  await createNotification(receiverId, {
    type: "friend_request",
    title: "New Friend Request",
    body: `@${senderProfile.username} sent you a friend request`,
    fromUserId: senderId,
  });
}

export async function getPendingRequests(userId: string): Promise<FriendRequest[]> {
  const q = query(
    collection(db, "friendRequests"),
    where("receiverId", "==", userId),
    where("status", "==", "pending")
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ requestId: d.id, ...d.data() } as FriendRequest))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getSentRequests(userId: string): Promise<FriendRequest[]> {
  const q = query(
    collection(db, "friendRequests"),
    where("senderId", "==", userId),
    where("status", "==", "pending")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ requestId: d.id, ...d.data() } as FriendRequest));
}

export async function respondToRequest(
  requestId: string,
  accept: boolean,
  myUserId: string,
  senderProfile: FriendRequest
): Promise<void> {
  await updateDoc(doc(db, "friendRequests", requestId), {
    status: accept ? "accepted" : "rejected",
  });

  if (accept) {
    await addDoc(collection(db, "friends"), {
      userId: myUserId,
      friendId: senderProfile.senderId,
      createdAt: Date.now(),
    });
    await addDoc(collection(db, "friends"), {
      userId: senderProfile.senderId,
      friendId: myUserId,
      createdAt: Date.now(),
    });
    await createNotification(senderProfile.senderId, {
      type: "friend_accepted",
      title: "Friend Request Accepted",
      body: "Your friend request was accepted!",
      fromUserId: myUserId,
    });
  }
}

export async function hasPendingRequest(
  senderId: string,
  receiverId: string
): Promise<boolean> {
  const q = query(
    collection(db, "friendRequests"),
    where("senderId", "==", senderId),
    where("receiverId", "==", receiverId),
    where("status", "==", "pending")
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

// ─── Friends ──────────────────────────────────────────────────────────────────

export async function getFriends(userId: string): Promise<UserProfile[]> {
  const q = query(collection(db, "friends"), where("userId", "==", userId));
  const snap = await getDocs(q);
  const friendIds = snap.docs.map((d) => d.data().friendId as string);
  const profiles = await Promise.all(friendIds.map((id) => getUserProfile(id)));
  return profiles.filter(Boolean) as UserProfile[];
}

export async function areFriends(userId1: string, userId2: string): Promise<boolean> {
  const q = query(
    collection(db, "friends"),
    where("userId", "==", userId1),
    where("friendId", "==", userId2)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function removeFriend(myId: string, friendId: string): Promise<void> {
  const q1 = query(
    collection(db, "friends"),
    where("userId", "==", myId),
    where("friendId", "==", friendId)
  );
  const q2 = query(
    collection(db, "friends"),
    where("userId", "==", friendId),
    where("friendId", "==", myId)
  );
  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  await Promise.all([
    ...snap1.docs.map((d) => deleteDoc(d.ref)),
    ...snap2.docs.map((d) => deleteDoc(d.ref)),
  ]);
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export function getChatId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join("_");
}

export async function sendMessage(
  chatId: string,
  senderId: string,
  text: string,
  participants: string[]
): Promise<void> {
  await setDoc(
    doc(db, "chats", chatId),
    { participants, lastMessage: text, lastTimestamp: Date.now() },
    { merge: true }
  );
  await addDoc(collection(db, "chats", chatId, "messages"), {
    senderId,
    text: text.trim(),
    timestamp: Date.now(),
  });
}

export async function getUserChats(userId: string): Promise<ChatRoom[]> {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", userId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ chatId: d.id, ...d.data() } as ChatRoom))
    .sort((a, b) => (b.lastTimestamp ?? 0) - (a.lastTimestamp ?? 0));
}

export function subscribeToMessages(
  chatId: string,
  callback: (msgs: ChatMessage[]) => void
): () => void {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("timestamp", "asc")
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(
      (d) => ({ messageId: d.id, ...d.data() } as ChatMessage)
    );
    callback(msgs);
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────

async function createNotification(
  userId: string,
  data: Pick<Notification, "type" | "title" | "body" | "fromUserId">
): Promise<void> {
  await addDoc(collection(db, "notifications"), {
    userId,
    type: data.type,
    title: data.title,
    body: data.body,
    fromUserId: data.fromUserId ?? null,
    read: false,
    createdAt: Date.now(),
  });
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ notifId: d.id, ...d.data() } as Notification))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function subscribeToNotifications(
  userId: string,
  callback: (notifs: Notification[]) => void
): () => void {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const notifs = snap.docs.map((d) => ({ notifId: d.id, ...d.data() } as Notification));
    callback(notifs);
  }, () => callback([]));
}

export async function markNotificationRead(notifId: string): Promise<void> {
  await updateDoc(doc(db, "notifications", notifId), { read: true });
}

export async function markNotificationsReadByType(
  userId: string,
  types: Notification["type"][]
): Promise<void> {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false)
  );
  const snap = await getDocs(q);
  const toMark = snap.docs.filter((d) => types.includes((d.data() as Notification).type));
  await Promise.all(toMark.map((d) => updateDoc(d.ref, { read: true })));
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false)
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
}

export async function getUnreadNotifCount(userId: string): Promise<number> {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false)
  );
  const snap = await getDocs(q);
  return snap.size;
}

// ─── Account Deletion ─────────────────────────────────────────────────────────

export async function deleteAllUserData(userId: string, username: string): Promise<void> {
  const batchDelete = async (docs: { ref: any }[]) => {
    await Promise.all(docs.map((d) => deleteDoc(d.ref)));
  };

  // 1. Content items
  const contentSnap = await getDocs(query(collection(db, "content"), where("userId", "==", userId)));
  await batchDelete(contentSnap.docs);

  // 2. Notifications received by user
  const notifsReceivedSnap = await getDocs(query(collection(db, "notifications"), where("userId", "==", userId)));
  await batchDelete(notifsReceivedSnap.docs);

  // 3. Notifications sent by user (fromUserId)
  const notifsSentSnap = await getDocs(query(collection(db, "notifications"), where("fromUserId", "==", userId)));
  await batchDelete(notifsSentSnap.docs);

  // 4. Friend requests sent
  const frSentSnap = await getDocs(query(collection(db, "friendRequests"), where("senderId", "==", userId)));
  await batchDelete(frSentSnap.docs);

  // 5. Friend requests received
  const frReceivedSnap = await getDocs(query(collection(db, "friendRequests"), where("receiverId", "==", userId)));
  await batchDelete(frReceivedSnap.docs);

  // 6. Friends where userId == user (my side of friendships)
  const friendsMeSnap = await getDocs(query(collection(db, "friends"), where("userId", "==", userId)));
  await batchDelete(friendsMeSnap.docs);

  // 7. Friends where friendId == user (other people's side) — remove those entries
  const friendsThemSnap = await getDocs(query(collection(db, "friends"), where("friendId", "==", userId)));
  await batchDelete(friendsThemSnap.docs);

  // 8. Chats: remove user from participants array; mark private chats as deleted
  const chatsSnap = await getDocs(query(collection(db, "chats"), where("participants", "array-contains", userId)));
  await Promise.all(
    chatsSnap.docs.map((d) =>
      updateDoc(d.ref, {
        participants: arrayRemove(userId),
        deletedUserId: userId,
      })
    )
  );

  // 9. Ludo invitations sent by user
  const ludiSentSnap = await getDocs(query(collection(db, "ludoInvitations"), where("fromUserId", "==", userId)));
  await batchDelete(ludiSentSnap.docs);

  // 10. Ludo invitations received by user
  const ludiRecvSnap = await getDocs(query(collection(db, "ludoInvitations"), where("toUserId", "==", userId)));
  await batchDelete(ludiRecvSnap.docs);

  // 11. Ludo rooms hosted by user → cancel them
  const ludoHostSnap = await getDocs(query(collection(db, "ludoRooms"), where("hostId", "==", userId)));
  await Promise.all(ludoHostSnap.docs.map((d) => updateDoc(d.ref, { status: "cancelled" })));

  // 12. Ludo rooms where user is a player (but not host) → remove from playerIds
  const ludoPlayerSnap = await getDocs(query(collection(db, "ludoRooms"), where("playerIds", "array-contains", userId)));
  await Promise.all(
    ludoPlayerSnap.docs.map((d) => {
      const data = d.data();
      const updatedPlayerIds: string[] = (data.playerIds ?? []).filter((id: string) => id !== userId);
      const updatedPlayers = (data.players ?? []).filter((p: any) => p.userId !== userId);
      return updateDoc(d.ref, { playerIds: updatedPlayerIds, players: updatedPlayers });
    })
  );

  // 13. User presence
  try {
    await deleteDoc(doc(db, "userPresence", userId));
  } catch { /* may not exist */ }

  // 14. Username lookup doc
  try {
    await deleteDoc(doc(db, "usernames", username.toLowerCase()));
  } catch { /* may not exist */ }

  // 15. User profile document (last — so reads still work during cleanup)
  try {
    await deleteDoc(doc(db, "users", userId));
  } catch { /* ignore */ }
}
