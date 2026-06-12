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
  photoPublicId?: string;
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
  publicId?: string;
  caption?: string;
  timestamp: number;
}

export async function updateProfilePhoto(
  userId: string,
  profilePhotoUrl: string,
  profilePhotoPublicId: string
): Promise<void> {
  await updateDoc(doc(db, "users", userId), {
    photo: profilePhotoUrl,
    photoPublicId: profilePhotoPublicId,
  });
}

export async function removeProfilePhoto(userId: string): Promise<void> {
  await updateDoc(doc(db, "users", userId), {
    photo: "",
    photoPublicId: "",
  });
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
  roomId?: string;
  read: boolean;
  createdAt: number;
}

// ─── Username ─────────────────────────────────────────────────────────────────

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "usernames", username.toLowerCase()));
  return !snap.exists();
}

export async function checkEmailAvailable(email: string): Promise<boolean> {
  const q = query(
    collection(db, "users"),
    where("email", "==", email.trim().toLowerCase()),
    limit(1)
  );
  const snap = await getDocs(q);
  return snap.empty;
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

export function subscribeToUserContent(
  userId: string,
  callback: (items: ContentItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  // No orderBy here — avoids composite index requirement. Sort client-side.
  const q = query(
    collection(db, "content"),
    where("userId", "==", userId)
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => ({ contentId: d.id, ...d.data() } as ContentItem))
        .sort((a, b) => b.timestamp - a.timestamp);
      console.log(`[FIRESTORE] subscribeToUserContent → ${items.length} items for userId=${userId}`);
      callback(items);
    },
    (err) => {
      console.error("[FIRESTORE] subscribeToUserContent error:", err.message);
      onError?.(err);
    }
  );
}

export async function addContent(
  userId: string,
  type: ContentItem["type"],
  url: string,
  caption?: string,
  publicId?: string
): Promise<string> {
  const ref = await addDoc(collection(db, "content"), {
    userId,
    type,
    url,
    publicId: publicId ?? "",
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
        if (clearedBefore !== null && m.timestamp < clearedBefore) return false;
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
  data: Pick<Notification, "type" | "title" | "body" | "fromUserId"> & { roomId?: string }
): Promise<void> {
  await addDoc(collection(db, "notifications"), {
    userId,
    type: data.type,
    title: data.title,
    body: data.body,
    fromUserId: data.fromUserId ?? null,
    roomId: data.roomId ?? null,
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

  const gameInvitesSentSnap = await getDocs(query(collection(db, "gameInvites"), where("senderId", "==", userId)));
  await batchDelete(gameInvitesSentSnap.docs);

  const gameInvitesReceivedSnap = await getDocs(query(collection(db, "gameInvites"), where("receiverId", "==", userId)));
  await batchDelete(gameInvitesReceivedSnap.docs);

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

// ─── Room Live Chat ───────────────────────────────────────────────────────────

export interface RoomMessage {
  msgId: string;
  type: 'text' | 'emoji';
  text: string;
  senderId: string;
  senderName: string;
  createdAt: number;
}

export async function sendRoomMessage(
  roomId: string,
  senderId: string,
  senderName: string,
  text: string,
  type: 'text' | 'emoji'
): Promise<void> {
  await addDoc(collection(db, "gameRooms", roomId, "chat"), {
    type,
    text,
    senderId,
    senderName,
    createdAt: Date.now(),
  });
}

export function subscribeToRoomMessages(
  roomId: string,
  sinceTimestamp: number,
  callback: (newMessages: RoomMessage[]) => void
): () => void {
  const q = query(
    collection(db, "gameRooms", roomId, "chat"),
    orderBy("createdAt", "asc"),
    limit(200)
  );
  let isFirst = true;
  return onSnapshot(q, (snap) => {
    if (isFirst) { isFirst = false; return; }
    const added = snap.docChanges()
      .filter(c => c.type === 'added')
      .map(c => ({ msgId: c.doc.id, ...c.doc.data() } as RoomMessage))
      .filter(msg => msg.createdAt >= sinceTimestamp);
    if (added.length > 0) callback(added);
  }, () => {});
}

export async function sendSpectatorInvite(
  fromUserId: string,
  fromName: string,
  toUserIds: string[],
  roomId: string
): Promise<void> {
  const shortId = roomId.slice(-6).toUpperCase();
  const chatText =
    `🎮 LIVE MATCH INVITE\n` +
    `${fromName} invited you to watch their Ludo match live!\n` +
    `Room ID: ${shortId}\n` +
    `Open Active Games to join as spectator.`;

  await Promise.all(
    toUserIds.map(async (receiverId) => {
      // 1. In-app notification (bell icon)
      await createNotification(receiverId, {
        type: "game_invite",
        title: "🎮 LIVE MATCH INVITATION",
        body: `${fromName} invited you to watch a live Ludo match! Room: ${shortId}`,
        fromUserId: fromUserId,
        roomId: roomId,
      });
      // 2. DM chat message — appears in friend's Messages tab
      const chatId = getChatId(fromUserId, receiverId);
      const now = Date.now();
      await setDoc(
        doc(db, "chats", chatId),
        {
          participants: [fromUserId, receiverId],
          lastMessage: chatText,
          lastTimestamp: now,
          lastSenderId: fromUserId,
        },
        { merge: true }
      );
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: fromUserId,
        text: chatText,
        timestamp: now,
      });
    })
  );
}

// ─── Game Rooms ───────────────────────────────────────────────────────────────

export type PlayerStatus = 'ACTIVE' | 'EXIT_PENDING' | 'KICKED';

export interface GameRoomPlayer {
  userId: string;
  name: string;
  photo: string;
  isReady: boolean;
  joinedAt: number;
  playerStatus?: PlayerStatus;
  exitVotes?: string[];
}

export interface GameAction {
  action: "ROLL_DICE" | "SELECT_TOKEN";
  playerIndex: number;
  diceValue?: number;
  tokenIndex?: number;
  fromPosition?: number;
  toPosition?: number;
  seq: number;
  actorId: string;
  ts: number;
}

export interface SavedGameState {
  tokenPositions: Array<Array<number> | null>;
  currentPlayerIndex: number;
  phase: string;
  savedAt: number;
}

export type GameRoomStatus = 'ACTIVE' | 'INACTIVE';

export interface SpectatorSlot {
  userId: string;
  name: string;
  photo: string;
  joinedAt: number;
}

export interface GameRoom {
  roomId: string;
  hostId: string;
  hostName: string;
  gameMode: 2 | 3 | 4;
  status: "waiting" | "ready" | "starting" | "in_game" | "finished";
  roomStatus?: GameRoomStatus; // ACTIVE (default) | INACTIVE (expired by inactivity)
  players: Record<string, GameRoomPlayer>;
  playerIds: string[];        // flat array for array-contains queries
  memberIds: string[];        // permanent record of ALL who joined (never removed); used for Active Rooms visibility
  spectators?: Record<string, SpectatorSlot>; // live watchers — keyed by userId
  createdAt: number;
  startingAt?: number;
  matchStartedAt?: number;    // set when status transitions to in_game
  lastActivityAt?: number;    // updated on any write; used for inactivity expiry
  lastAction?: GameAction;    // last game action for sync relay
  currentTurnPlayerIndex?: number; // whose turn it is right now (Firebase source of truth)
  gameState?: SavedGameState; // continuously saved board state for match resume
  hackActivated?: Record<string, boolean>; // userId → true for players with secret key active
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
    shortCode: roomId.slice(-6).toUpperCase(),
    hostId,
    hostName: hostProfile.name,
    gameMode,
    status: "waiting",
    roomStatus: "ACTIVE" as GameRoomStatus,
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
    memberIds: [hostId],
    createdAt: now,
    lastActivityAt: now,
  });
}

/**
 * Resolve a 6-char short code to a full GameRoom.
 * First tries the `shortCode` field index (fast, works for rooms created after
 * this update).  Falls back to a client-side suffix scan of active/in-game rooms
 * so that rooms created before the shortCode field was added still work.
 */
export async function getGameRoomByShortCode(
  shortCode: string
): Promise<GameRoom | null> {
  const code = shortCode.trim().toUpperCase();

  // 1. Fast path — query by stored shortCode field
  const q = query(
    collection(db, "gameRooms"),
    where("shortCode", "==", code),
    where("status", "in", ["waiting", "starting", "in_game"])
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    const d = snap.docs[0];
    return { roomId: d.id, ...d.data() } as GameRoom;
  }

  // 2. Fallback — scan all non-inactive rooms and match suffix (covers old rooms)
  const fallbackQ = query(
    collection(db, "gameRooms"),
    where("roomStatus", "==", "ACTIVE"),
    where("status", "in", ["waiting", "starting", "in_game"])
  );
  const fallbackSnap = await getDocs(fallbackQ);
  for (const d of fallbackSnap.docs) {
    if (d.id.slice(-6).toUpperCase() === code) {
      return { roomId: d.id, ...d.data() } as GameRoom;
    }
  }

  return null;
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
    memberIds: arrayUnion(userId),
    lastActivityAt: Date.now(),
  });
}

export async function togglePlayerReady(
  roomId: string,
  userId: string,
  ready: boolean
): Promise<void> {
  const roomRef = doc(db, "gameRooms", roomId);
  await updateDoc(roomRef, {
    [`players.${userId}.isReady`]: ready,
    lastActivityAt: Date.now(),
  });
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
    lastActivityAt: Date.now(),
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
  action: GameAction,
  currentTurnPlayerIndex?: number
): Promise<void> {
  const update: Record<string, unknown> = {
    lastAction: action,
    lastActivityAt: Date.now(),
  };
  if (typeof currentTurnPlayerIndex === 'number') {
    update.currentTurnPlayerIndex = currentTurnPlayerIndex;
  }
  await updateDoc(doc(db, "gameRooms", roomId), update);
}

export async function writeCurrentTurn(
  roomId: string,
  currentTurnPlayerIndex: number
): Promise<void> {
  await updateDoc(doc(db, "gameRooms", roomId), {
    currentTurnPlayerIndex,
    lastActivityAt: Date.now(),
  });
}

export async function writeHackActivated(
  roomId: string,
  userId: string,
  active: boolean
): Promise<void> {
  await updateDoc(doc(db, "gameRooms", roomId), {
    [`hackActivated.${userId}`]: active ? true : deleteField(),
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
  const now = Date.now();
  const ref = doc(collection(db, "gameChats", roomId, "messages"));
  await Promise.all([
    setDoc(ref, {
      messageId: ref.id,
      senderId,
      senderName,
      senderPhoto: senderPhoto ?? null,
      text: text.trim(),
      timestamp: now,
    }),
    // Chat counts as activity — resets the inactivity timer on the room
    updateDoc(doc(db, "gameRooms", roomId), { lastActivityAt: now }).catch(() => {}),
  ]);
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
const ROOM_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const INACTIVITY_MS = 10 * 60 * 1000;        // 10 minutes

// ─── Inactivity expiry ────────────────────────────────────────────────────────

/** Mark a room INACTIVE immediately (permanent — not reversible). */
export async function markRoomInactive(roomId: string): Promise<void> {
  await updateDoc(doc(db, "gameRooms", roomId), {
    roomStatus: "INACTIVE" as GameRoomStatus,
    lastActivityAt: Date.now(),
  });
}

/**
 * Read the room once and, if `lastActivityAt` is older than INACTIVITY_MS,
 * mark it INACTIVE.  Safe to call from any client — the write is idempotent.
 * Returns true if the room was (or already was) inactive.
 */
export async function checkAndExpireRoomIfInactive(roomId: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, "gameRooms", roomId));
    if (!snap.exists()) return true; // treat missing as inactive
    const room = { roomId: snap.id, ...snap.data() } as GameRoom;
    if (room.roomStatus === "INACTIVE") return true;
    if (room.status === "finished") return true;
    const lastActivity = room.lastActivityAt ?? room.createdAt;
    if (Date.now() - lastActivity > INACTIVITY_MS) {
      await markRoomInactive(roomId);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function subscribeToUserActiveRooms(
  userId: string,
  callback: (rooms: GameRoom[]) => void
): () => void {
  // Primary query: rooms where user is in memberIds (permanent membership record).
  // memberIds is set at creation (hostId) and via arrayUnion on every joinGameRoom call.
  // Falls back gracefully for legacy rooms that only have playerIds by running a second
  // parallel query on playerIds and merging results client-side.
  const memberQuery = query(
    collection(db, "gameRooms"),
    where("memberIds", "array-contains", userId),
    limit(50)
  );
  const playerQuery = query(
    collection(db, "gameRooms"),
    where("playerIds", "array-contains", userId),
    limit(50)
  );

  let memberResults: GameRoom[] = [];
  let playerResults: GameRoom[] = [];
  let memberUnsub: (() => void) | null = null;
  let playerUnsub: (() => void) | null = null;
  let memberReady = false;
  let playerReady = false;

  function emit() {
    if (!memberReady || !playerReady) return;
    const now = Date.now();

    // Merge deduped by roomId — memberIds is authoritative, playerIds is fallback
    const byId = new Map<string, GameRoom>();
    [...playerResults, ...memberResults].forEach((r) => byId.set(r.roomId, r));
    const all = Array.from(byId.values());

    // Lazily expire rooms beyond inactivity threshold
    all.forEach((r) => {
      if (r.roomStatus === "INACTIVE" || r.status === "finished") return;
      const lastActivity = r.lastActivityAt ?? r.createdAt;
      if (now - lastActivity > INACTIVITY_MS) {
        markRoomInactive(r.roomId).catch(console.warn);
      }
    });

    // Show rooms that are:
    //   • not finished / not INACTIVE
    //   • had activity within the last ROOM_EXPIRY_MS (24h), using lastActivityAt not createdAt
    const rooms = all
      .filter((r) => {
        if (r.status === "finished" || r.roomStatus === "INACTIVE") return false;
        const lastActivity = r.lastActivityAt ?? r.createdAt;
        return now - lastActivity < ROOM_EXPIRY_MS;
      })
      .sort((a, b) => (b.lastActivityAt ?? b.createdAt) - (a.lastActivityAt ?? a.createdAt));

    callback(rooms);
  }

  memberUnsub = onSnapshot(
    memberQuery,
    (snap) => {
      memberResults = snap.docs.map((d) => ({ roomId: d.id, ...d.data() } as GameRoom));
      memberReady = true;
      emit();
    },
    () => { memberReady = true; emit(); }
  );

  playerUnsub = onSnapshot(
    playerQuery,
    (snap) => {
      playerResults = snap.docs.map((d) => ({ roomId: d.id, ...d.data() } as GameRoom));
      playerReady = true;
      emit();
    },
    () => { playerReady = true; emit(); }
  );

  return () => {
    memberUnsub?.();
    playerUnsub?.();
  };
}

/**
 * Fetch a room once.  Performs a lazy inactivity check before returning —
 * if the room hasn't had activity in INACTIVITY_MS it is marked INACTIVE and
 * the updated snapshot is returned so callers see the correct status.
 */
export async function getGameRoom(roomId: string): Promise<GameRoom | null> {
  const snap = await getDoc(doc(db, "gameRooms", roomId));
  if (!snap.exists()) return null;
  const room = { roomId: snap.id, ...snap.data() } as GameRoom;

  // Lazy expiry: if inactive, mark it and return the updated object
  if (room.roomStatus !== "INACTIVE" && room.status !== "finished") {
    const lastActivity = room.lastActivityAt ?? room.createdAt;
    if (Date.now() - lastActivity > INACTIVITY_MS) {
      await markRoomInactive(roomId).catch(console.warn);
      return { ...room, roomStatus: "INACTIVE" };
    }
  }

  return room;
}

export async function saveGameState(
  roomId: string,
  gameState: SavedGameState
): Promise<void> {
  // Firestore does not support nested arrays. Serialize tokenPositions as a
  // JSON string so the 2-D array (Array<Array<number>|null>) can be stored.
  const firestoreState = {
    ...gameState,
    tokenPositions: JSON.stringify(gameState.tokenPositions),
  };
  await updateDoc(doc(db, "gameRooms", roomId), {
    gameState: firestoreState,
    lastActivityAt: Date.now(),
  });
}

// ─── Player Exit / Voting ─────────────────────────────────────────────────────

export async function markPlayerExit(roomId: string, userId: string): Promise<void> {
  const snap = await getDoc(doc(db, "gameRooms", roomId));
  if (!snap.exists()) return;
  const room = snap.data() as GameRoom;
  if (room.players?.[userId]?.playerStatus === 'KICKED') return;
  await updateDoc(doc(db, "gameRooms", roomId), {
    [`players.${userId}.playerStatus`]: 'EXIT_PENDING' as PlayerStatus,
    lastActivityAt: Date.now(),
  });
}

export async function markPlayerRejoin(roomId: string, userId: string): Promise<void> {
  const snap = await getDoc(doc(db, "gameRooms", roomId));
  if (!snap.exists()) return;
  const room = snap.data() as GameRoom;
  const player = room.players?.[userId];
  if (!player || player.playerStatus === 'KICKED') return;
  await updateDoc(doc(db, "gameRooms", roomId), {
    [`players.${userId}.playerStatus`]: 'ACTIVE' as PlayerStatus,
    [`players.${userId}.exitVotes`]: [],
    lastActivityAt: Date.now(),
  });
}

export async function castExitVote(
  roomId: string,
  targetUserId: string,
  voterUserId: string
): Promise<{ kicked: boolean; isLastPlayer: boolean; winnerId?: string }> {
  let kicked = false;
  let isLastPlayer = false;
  let winnerId: string | undefined;

  await runTransaction(db, async (txn) => {
    const ref = doc(db, "gameRooms", roomId);
    const snap = await txn.get(ref);
    if (!snap.exists()) return;
    const room = snap.data() as GameRoom;

    const target = room.players?.[targetUserId];
    if (!target || target.playerStatus !== 'EXIT_PENDING') return;

    const currentVotes: string[] = target.exitVotes ?? [];
    if (currentVotes.includes(voterUserId)) return;

    const newVotes = [...currentVotes, voterUserId];

    const activeVoters = Object.values(room.players).filter(
      (p) =>
        p.userId !== targetUserId &&
        p.playerStatus !== 'KICKED' &&
        p.playerStatus !== 'EXIT_PENDING'
    );

    // Majority = floor(n/2)+1 so: 1→1, 2→2, 3→2
    const needed = Math.floor(activeVoters.length / 2) + 1;

    const update: Record<string, unknown> = {
      [`players.${targetUserId}.exitVotes`]: newVotes,
      lastActivityAt: Date.now(),
    };

    if (newVotes.length >= needed) {
      update[`players.${targetUserId}.playerStatus`] = 'KICKED';
      kicked = true;

      const remaining = Object.values(room.players).filter(
        (p) => p.userId !== targetUserId && p.playerStatus !== 'KICKED'
      );
      if (remaining.length === 1) {
        update['status'] = 'finished';
        update['winnerId'] = remaining[0].userId;
        isLastPlayer = true;
        winnerId = remaining[0].userId;
      }
    }

    txn.update(ref, update);
  });

  return { kicked, isLastPlayer, winnerId };
}

export async function cleanupExpiredRooms(userId: string): Promise<void> {
  const now = Date.now();

  // Query both memberIds and playerIds to catch legacy rooms
  const [memberSnap, playerSnap] = await Promise.all([
    getDocs(query(collection(db, "gameRooms"), where("memberIds", "array-contains", userId), limit(20))),
    getDocs(query(collection(db, "gameRooms"), where("playerIds", "array-contains", userId), limit(20))),
  ]);

  // Deduplicate by roomId
  const byId = new Map<string, { ref: ReturnType<typeof doc>; data: Record<string, unknown> }>();
  [...playerSnap.docs, ...memberSnap.docs].forEach((d) => {
    if (!byId.has(d.id)) byId.set(d.id, { ref: d.ref as ReturnType<typeof doc>, data: d.data() as Record<string, unknown> });
  });

  const expired = Array.from(byId.values()).filter(({ data }) => {
    const lastActivity = (data.lastActivityAt ?? data.createdAt) as number;
    return data.status !== "finished" && (now - lastActivity) > ROOM_EXPIRY_MS;
  });

  await Promise.all(
    expired.map(({ ref }) =>
      updateDoc(ref, { status: "finished", roomStatus: "INACTIVE", expiredAt: now })
    )
  );
}

// ─── Spectator ────────────────────────────────────────────────────────────────

export async function joinRoomAsSpectator(
  roomId: string,
  userId: string,
  userName: string,
  userPhoto?: string
): Promise<void> {
  await updateDoc(doc(db, "gameRooms", roomId), {
    [`spectators.${userId}`]: {
      userId,
      name: userName,
      photo: userPhoto || "",
      joinedAt: Date.now(),
    },
    lastActivityAt: Date.now(),
  });
}

export async function leaveRoomAsSpectator(
  roomId: string,
  userId: string
): Promise<void> {
  try {
    await updateDoc(doc(db, "gameRooms", roomId), {
      [`spectators.${userId}`]: deleteField(),
      lastActivityAt: Date.now(),
    });
  } catch {
    // Room may be gone — ignore silently
  }
}
