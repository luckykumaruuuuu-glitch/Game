import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
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

// ─── Presence ─────────────────────────────────────────────────────────────────

export interface UserPresence {
  online: boolean;
  lastSeen: number;
}

export async function setUserOnline(userId: string, online: boolean): Promise<void> {
  await setDoc(doc(db, "userPresence", userId), { online, lastSeen: Date.now() }, { merge: true });
}

export function subscribeToFriendsPresence(
  friendIds: string[],
  callback: (presence: Record<string, UserPresence>) => void
): () => void {
  if (friendIds.length === 0) { callback({}); return () => {}; }
  const unsubs: (() => void)[] = [];
  const presenceMap: Record<string, UserPresence> = {};
  for (const uid of friendIds) {
    const unsub = onSnapshot(doc(db, "userPresence", uid), (snap) => {
      presenceMap[uid] = snap.exists()
        ? (snap.data() as UserPresence)
        : { online: false, lastSeen: 0 };
      callback({ ...presenceMap });
    });
    unsubs.push(unsub);
  }
  return () => unsubs.forEach((u) => u());
}

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
  gender?: "male" | "female" | "other" | "";
  dateOfBirth?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  locality?: string;
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
  deletedFor?: string[];
  deletedForEveryone?: boolean;
}

export interface ChatRoom {
  chatId: string;
  participants: string[];
  lastMessage: string;
  lastTimestamp: number;
  lastSenderId?: string;
  lastSeenBy?: Record<string, number>;
  typing?: Record<string, number>;
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
  data: Partial<Pick<UserProfile, "name" | "bio" | "photo" | "gender" | "dateOfBirth" | "phone" | "country" | "state" | "city" | "locality">>
): Promise<void> {
  await updateDoc(doc(db, "users", userId), data);
}

export function maskPhoneNumber(phone: string): string {
  if (!phone) return "";
  const len = phone.length;
  const showCount = Math.min(6, Math.ceil(len * 0.6));
  return phone.slice(0, showCount) + "*".repeat(len - showCount);
}

export function subscribeToUserProfile(
  userId: string,
  callback: (profile: UserProfile | null) => void
): () => void {
  return onSnapshot(doc(db, "users", userId), (snap) => {
    callback(snap.exists() ? (snap.data() as UserProfile) : null);
  });
}

export async function searchUsers(term: string, currentUserId: string): Promise<UserProfile[]> {
  if (!term.trim()) return [];
  const lower = term.toLowerCase().trim();

  const blockedIds = await getAllBlockedIds(currentUserId);

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
      if (blockedIds.has(p.userId)) continue;
      seen.add(p.userId);
      results.push(p);
    }
  }

  if (!seen.has(lower) && lower.length > 10) {
    try {
      const byId = await getDoc(doc(db, "users", term.trim()));
      if (byId.exists()) {
        const p = byId.data() as UserProfile;
        if (p.userId !== currentUserId && !seen.has(p.userId) && !blockedIds.has(p.userId)) {
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

// ─── Block System ─────────────────────────────────────────────────────────────

export async function blockUser(myId: string, blockedId: string): Promise<void> {
  const blockId = `${myId}_${blockedId}`;
  await setDoc(doc(db, "blocks", blockId), {
    blockerId: myId,
    blockedId,
    createdAt: Date.now(),
  });
  await removeFriend(myId, blockedId).catch(() => {});
  try {
    const outQ = query(collection(db, "friendRequests"), where("senderId", "==", myId), where("receiverId", "==", blockedId));
    const inQ = query(collection(db, "friendRequests"), where("senderId", "==", blockedId), where("receiverId", "==", myId));
    const [out, inn] = await Promise.all([getDocs(outQ), getDocs(inQ)]);
    await Promise.all([
      ...out.docs.map(d => updateDoc(d.ref, { status: "rejected" })),
      ...inn.docs.map(d => updateDoc(d.ref, { status: "rejected" })),
    ]);
  } catch { /* ignore */ }
}

export async function unblockUser(myId: string, blockedId: string): Promise<void> {
  await deleteDoc(doc(db, "blocks", `${myId}_${blockedId}`));
}

export async function isUserBlockedByMe(myId: string, otherUserId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "blocks", `${myId}_${otherUserId}`));
  return snap.exists();
}

export async function isBlockedByOther(myId: string, otherUserId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "blocks", `${otherUserId}_${myId}`));
  return snap.exists();
}

export async function getBlockedByMe(myId: string): Promise<string[]> {
  const q = query(collection(db, "blocks"), where("blockerId", "==", myId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data().blockedId as string);
}

export async function getAllBlockedIds(myId: string): Promise<Set<string>> {
  const [blockedByMe, blockedMe] = await Promise.all([
    getDocs(query(collection(db, "blocks"), where("blockerId", "==", myId))),
    getDocs(query(collection(db, "blocks"), where("blockedId", "==", myId))),
  ]);
  const ids = new Set<string>();
  blockedByMe.docs.forEach(d => ids.add(d.data().blockedId as string));
  blockedMe.docs.forEach(d => ids.add(d.data().blockerId as string));
  return ids;
}

// ─── Friend Requests ──────────────────────────────────────────────────────────

export async function sendFriendRequest(
  senderId: string,
  senderProfile: UserProfile,
  receiverId: string
): Promise<void> {
  const blockedIds = await getAllBlockedIds(senderId);
  if (blockedIds.has(receiverId)) {
    const err: any = new Error("Cannot send friend request.");
    err.code = "blocked";
    throw err;
  }

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

export function subscribeToFriendRequests(
  userId: string,
  callback: (requests: FriendRequest[]) => void
): () => void {
  const q = query(
    collection(db, "friendRequests"),
    where("receiverId", "==", userId),
    where("status", "==", "pending")
  );
  return onSnapshot(q, (snap) => {
    const requests = snap.docs
      .map((d) => ({ requestId: d.id, ...d.data() } as FriendRequest))
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(requests);
  }, () => callback([]));
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

export function subscribeToFriends(
  userId: string,
  callback: (friends: UserProfile[]) => void
): () => void {
  const q = query(collection(db, "friends"), where("userId", "==", userId));
  return onSnapshot(q, async (snap) => {
    const friendIds = snap.docs.map((d) => d.data().friendId as string);
    const profiles = await Promise.all(friendIds.map((id) => getUserProfile(id)));
    callback(profiles.filter(Boolean) as UserProfile[]);
  }, () => callback([]));
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
  const now = Date.now();
  await setDoc(
    doc(db, "chats", chatId),
    {
      participants,
      lastMessage: text,
      lastTimestamp: now,
      lastSenderId: senderId,
    },
    { merge: true }
  );
  await addDoc(collection(db, "chats", chatId, "messages"), {
    senderId,
    text: text.trim(),
    timestamp: now,
  });
  const otherId = participants.find(p => p !== senderId);
  if (otherId) {
    await createNotification(otherId, {
      type: "message",
      title: "New Message",
      body: text.length > 60 ? text.slice(0, 57) + "..." : text,
      fromUserId: senderId,
    });
  }
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

export function subscribeToUserChats(
  userId: string,
  callback: (rooms: ChatRoom[]) => void
): () => void {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", userId)
  );
  return onSnapshot(q, (snap) => {
    const rooms = snap.docs
      .map((d) => ({ chatId: d.id, ...d.data() } as ChatRoom))
      .sort((a, b) => (b.lastTimestamp ?? 0) - (a.lastTimestamp ?? 0));
    callback(rooms);
  }, () => callback([]));
}

export async function markChatRead(chatId: string, userId: string): Promise<void> {
  try {
    await setDoc(
      doc(db, "chats", chatId),
      { lastSeenBy: { [userId]: Date.now() } },
      { merge: true }
    );
  } catch { /* ignore */ }
}

export async function setTypingStatus(
  chatId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  try {
    const chatRef = doc(db, "chats", chatId);
    if (isTyping) {
      await setDoc(chatRef, { typing: { [userId]: Date.now() } }, { merge: true });
    } else {
      await updateDoc(chatRef, { [`typing.${userId}`]: deleteField() });
    }
  } catch { /* ignore */ }
}

export function subscribeToTyping(
  chatId: string,
  myId: string,
  callback: (isTyping: boolean) => void
): () => void {
  return onSnapshot(doc(db, "chats", chatId), (snap) => {
    if (!snap.exists()) { callback(false); return; }
    const data = snap.data();
    const typing = data.typing ?? {};
    const now = Date.now();
    const otherTyping = Object.entries(typing).some(
      ([uid, ts]) => uid !== myId && typeof ts === "number" && now - (ts as number) < 5000
    );
    callback(otherTyping);
  }, () => callback(false));
}

export function subscribeToMessages(
  chatId: string,
  myId: string,
  clearedBefore: number | null,
  callback: (msgs: ChatMessage[]) => void
): () => void {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("timestamp", "asc")
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs
      .map((d) => ({ messageId: d.id, ...d.data() } as ChatMessage))
      .filter((m) => {
        if (clearedBefore && m.timestamp < clearedBefore) return false;
        if (m.deletedFor?.includes(myId)) return false;
        return true;
      });
    callback(msgs);
  });
}

export async function deleteMessageForMe(
  chatId: string,
  messageId: string,
  userId: string
): Promise<void> {
  await updateDoc(doc(db, "chats", chatId, "messages", messageId), {
    deletedFor: arrayUnion(userId),
  });
}

export async function deleteMessageForEveryone(
  chatId: string,
  messageId: string
): Promise<void> {
  await updateDoc(doc(db, "chats", chatId, "messages", messageId), {
    deletedForEveryone: true,
  });
}

export async function deleteChatForMe(
  chatId: string,
  userId: string
): Promise<void> {
  await setDoc(
    doc(db, "chats", chatId),
    { clearedAt: { [userId]: Date.now() } },
    { merge: true }
  );
}

export function subscribeToChatClearedAt(
  chatId: string,
  userId: string,
  callback: (ts: number | null) => void
): () => void {
  return onSnapshot(
    doc(db, "chats", chatId),
    (snap) => {
      if (!snap.exists()) { callback(null); return; }
      const data = snap.data();
      callback(data.clearedAt?.[userId] ?? null);
    },
    () => callback(null)
  );
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

  const contentSnap = await getDocs(query(collection(db, "content"), where("userId", "==", userId)));
  await batchDelete(contentSnap.docs);

  const notifsReceivedSnap = await getDocs(query(collection(db, "notifications"), where("userId", "==", userId)));
  await batchDelete(notifsReceivedSnap.docs);

  const notifsSentSnap = await getDocs(query(collection(db, "notifications"), where("fromUserId", "==", userId)));
  await batchDelete(notifsSentSnap.docs);

  const frSentSnap = await getDocs(query(collection(db, "friendRequests"), where("senderId", "==", userId)));
  await batchDelete(frSentSnap.docs);

  const frReceivedSnap = await getDocs(query(collection(db, "friendRequests"), where("receiverId", "==", userId)));
  await batchDelete(frReceivedSnap.docs);

  const friendsMeSnap = await getDocs(query(collection(db, "friends"), where("userId", "==", userId)));
  await batchDelete(friendsMeSnap.docs);

  const friendsThemSnap = await getDocs(query(collection(db, "friends"), where("friendId", "==", userId)));
  await batchDelete(friendsThemSnap.docs);

  const blocksBy = await getDocs(query(collection(db, "blocks"), where("blockerId", "==", userId)));
  const blocksOf = await getDocs(query(collection(db, "blocks"), where("blockedId", "==", userId)));
  await batchDelete([...blocksBy.docs, ...blocksOf.docs]);

  const chatsSnap = await getDocs(query(collection(db, "chats"), where("participants", "array-contains", userId)));
  await Promise.all(
    chatsSnap.docs.map((d) =>
      updateDoc(d.ref, {
        participants: arrayRemove(userId),
        deletedUserId: userId,
      })
    )
  );

  try { await deleteDoc(doc(db, "userPresence", userId)); } catch { /* ignore */ }
  try { await deleteDoc(doc(db, "usernames", username.toLowerCase())); } catch { /* ignore */ }
  try { await deleteDoc(doc(db, "users", userId)); } catch { /* ignore */ }
}

// ─── Game Invites ─────────────────────────────────────────────────────────────

export interface GameInvite {
  inviteId: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderPhoto: string;
  receiverId: string;
  gameMode: 2 | 3 | 4;
  roomId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: number;
}

export async function sendGameInvite(
  senderId: string,
  senderProfile: UserProfile,
  receiverIds: string[],
  gameMode: 2 | 3 | 4
): Promise<string> {
  const roomId = doc(collection(db, "gameRooms")).id;
  await createGameRoom(roomId, senderId, senderProfile, gameMode);
  await Promise.all(
    receiverIds.map(async (receiverId) => {
      await addDoc(collection(db, "gameInvites"), {
        senderId,
        senderName: senderProfile.name,
        senderUsername: senderProfile.username,
        senderPhoto: senderProfile.photo,
        receiverId,
        gameMode,
        roomId,
        status: "pending",
        createdAt: Date.now(),
      });
      await createNotification(receiverId, {
        type: "game_invite",
        title: "Ludo Invite",
        body: `${senderProfile.name} invited you to a ${gameMode}-player Ludo game!`,
        fromUserId: senderId,
      });
    })
  );
  return roomId;
}

export function subscribeToGameInvites(
  userId: string,
  callback: (invites: GameInvite[]) => void
): () => void {
  if (!userId) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, "gameInvites"),
    where("receiverId", "==", userId),
    where("status", "==", "pending")
  );
  return onSnapshot(
    q,
    (snap) => {
      const invites = snap.docs
        .map((d) => ({ inviteId: d.id, ...d.data() } as GameInvite))
        .filter((inv) => inv.receiverId === userId && inv.senderId !== userId)
        .sort((a, b) => b.createdAt - a.createdAt);
      callback(invites);
    },
    () => callback([])
  );
}

export async function respondToGameInvite(
  inviteId: string,
  accept: boolean
): Promise<void> {
  await updateDoc(doc(db, "gameInvites", inviteId), {
    status: accept ? "accepted" : "declined",
  });
}

// ─── Game Rooms ───────────────────────────────────────────────────────────────

export interface GameRoomPlayer {
  userId: string;
  name: string;
  photo: string;
  isReady: boolean;
  joinedAt: number;
}

export interface GameAction {
  action: "ROLL_DICE" | "SELECT_TOKEN";
  playerIndex: number;
  diceValue?: number;
  tokenIndex?: number;
  seq: number;
  actorId: string;
  ts: number;
}

export interface GameRoom {
  roomId: string;
  hostId: string;
  hostName: string;
  gameMode: 2 | 3 | 4;
  status: "waiting" | "ready" | "starting" | "in_game" | "finished";
  players: Record<string, GameRoomPlayer>;
  playerIds: string[];        // flat array for array-contains queries
  createdAt: number;
  startingAt?: number;
  matchStartedAt?: number;    // set when status transitions to in_game
  lastActivityAt?: number;    // updated on any write
  lastAction?: GameAction;    // last game action for sync relay
}

export async function createGameRoom(
  roomId: string,
  hostId: string,
  hostProfile: UserProfile,
  gameMode: 2 | 3 | 4
): Promise<void> {
  const now = Date.now();
  await setDoc(doc(db, "gameRooms", roomId), {
    roomId,
    hostId,
    hostName: hostProfile.name,
    gameMode,
    status: "waiting",
    players: {
      [hostId]: {
        userId: hostId,
        name: hostProfile.name,
        photo: hostProfile.photo || "",
        isReady: false,
        joinedAt: now,
      },
    },
    playerIds: [hostId],
    createdAt: now,
    lastActivityAt: now,
  });
}

export async function joinGameRoom(
  roomId: string,
  userId: string,
  userProfile: UserProfile
): Promise<void> {
  const roomRef = doc(db, "gameRooms", roomId);
  await updateDoc(roomRef, {
    [`players.${userId}`]: {
      userId,
      name: userProfile.name,
      photo: userProfile.photo || "",
      isReady: false,
      joinedAt: Date.now(),
    },
    playerIds: arrayUnion(userId),
    lastActivityAt: Date.now(),
  });
}

export async function togglePlayerReady(
  roomId: string,
  userId: string,
  ready: boolean
): Promise<void> {
  const roomRef = doc(db, "gameRooms", roomId);
  await updateDoc(roomRef, { [`players.${userId}.isReady`]: ready });
  const snap = await getDoc(roomRef);
  if (snap.exists()) {
    const room = snap.data() as GameRoom;
    const players = Object.values(room.players) as GameRoomPlayer[];
    const allJoined = players.length >= room.gameMode;
    const allReady = players.every((p) => p.isReady);
    if (allJoined && allReady) {
      await updateDoc(roomRef, { status: "ready" });
    } else if (room.status === "ready") {
      await updateDoc(roomRef, { status: "waiting" });
    }
  }
}

export async function setRoomStarting(roomId: string): Promise<void> {
  await updateDoc(doc(db, "gameRooms", roomId), {
    status: "starting",
    startingAt: Date.now(),
  });
}

export async function setRoomInGame(roomId: string): Promise<void> {
  const now = Date.now();
  await updateDoc(doc(db, "gameRooms", roomId), {
    status: "in_game",
    matchStartedAt: now,
    lastActivityAt: now,
  });
}

export async function writeGameAction(
  roomId: string,
  action: GameAction
): Promise<void> {
  await updateDoc(doc(db, "gameRooms", roomId), {
    lastAction: action,
    lastActivityAt: Date.now(),
  });
}

// ─── Game Chat ────────────────────────────────────────────────────────────────

export interface GameChatMessage {
  messageId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  timestamp: number;
}

export async function sendGameMessage(
  roomId: string,
  senderId: string,
  senderName: string,
  senderPhoto: string | undefined,
  text: string
): Promise<void> {
  const ref = doc(collection(db, "gameChats", roomId, "messages"));
  await setDoc(ref, {
    messageId: ref.id,
    senderId,
    senderName,
    senderPhoto: senderPhoto ?? null,
    text: text.trim(),
    timestamp: Date.now(),
  });
}

export function subscribeToGameMessages(
  roomId: string,
  callback: (messages: GameChatMessage[]) => void
): () => void {
  const q = query(
    collection(db, "gameChats", roomId, "messages"),
    orderBy("timestamp", "asc"),
    limit(200)
  );
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => d.data() as GameChatMessage)),
    () => callback([])
  );
}

export async function cancelRoomStart(roomId: string): Promise<void> {
  await updateDoc(doc(db, "gameRooms", roomId), {
    status: "waiting",
    startingAt: null,
  });
}

export function subscribeToGameRoom(
  roomId: string,
  callback: (room: GameRoom | null) => void
): () => void {
  return onSnapshot(
    doc(db, "gameRooms", roomId),
    (snap) => {
      callback(snap.exists() ? ({ roomId: snap.id, ...snap.data() } as GameRoom) : null);
    },
    () => callback(null)
  );
}

// Returns all rooms where the user is a player and status is not finished.
// Uses only array-contains (no compound index needed); sorts client-side.
export function subscribeToUserActiveRooms(
  userId: string,
  callback: (rooms: GameRoom[]) => void
): () => void {
  const q = query(
    collection(db, "gameRooms"),
    where("playerIds", "array-contains", userId),
    limit(30)
  );
  return onSnapshot(
    q,
    (snap) => {
      const rooms = snap.docs
        .map((d) => ({ roomId: d.id, ...d.data() } as GameRoom))
        .filter((r) => r.status !== "finished")
        .sort((a, b) => (b.lastActivityAt ?? b.createdAt) - (a.lastActivityAt ?? a.createdAt));
      callback(rooms);
    },
    () => callback([])
  );
}
