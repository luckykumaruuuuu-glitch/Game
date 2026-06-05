import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { LudoColor, COLORS_FOR_COUNT, getMovableTokens, applyMove, getNextTurn, checkWinner, isSafeSquare } from './ludoEngine';
import type { UserProfile } from './firestore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LudoPlayer {
  userId: string;
  username: string;
  photo: string;
  color: LudoColor;
  accepted: boolean;
  online: boolean;
  isAI?: boolean;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  rank?: number;
}

export interface LudoGameState {
  tokens: Record<LudoColor, number[]>;
  currentTurn: LudoColor;
  diceValue: number | null;
  diceRolled: boolean;
  winner: LudoColor | null;
  rankings: LudoColor[];
  lastActionAt: number;
}

export interface LudoRoom {
  roomId: string;
  hostId: string;
  playerCount: 2 | 3 | 4;
  players: LudoPlayer[];
  playerIds: string[];
  status: 'waiting' | 'ready' | 'started' | 'finished' | 'cancelled';
  gameState: LudoGameState | null;
  countdownStartedAt: number | null;
  isAIGame?: boolean;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  createdAt: number;
  updatedAt: number;
}

export interface LudoInvitation {
  inviteId: string;
  roomId: string;
  fromUserId: string;
  fromUsername: string;
  fromPhoto: string;
  toUserId: string;
  playerCount: 2 | 3 | 4;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface UserPresence {
  online: boolean;
  lastSeen: number;
}

// ─── AI Logic ────────────────────────────────────────────────────────────────

export function pickAIMove(
  color: LudoColor,
  tokens: number[],
  dice: number,
  allTokens: Record<LudoColor, number[]>,
  difficulty: 'easy' | 'medium' | 'hard'
): number {
  const movable = getMovableTokens(tokens, dice);
  if (movable.length === 0) return -1;
  if (movable.length === 1) return movable[0];

  if (difficulty === 'easy') {
    return movable[Math.floor(Math.random() * movable.length)];
  }

  let bestScore = -Infinity;
  let bestIdx = movable[0];

  for (const idx of movable) {
    const pos = tokens[idx];
    const result = applyMove(color, idx, tokens, dice, allTokens);
    const newPos = result.newPositions[idx];
    let score = 0;

    score += result.captures.length * (difficulty === 'hard' ? 200 : 100);
    if (result.extraTurn) score += 50;
    if (pos === -1) score += difficulty === 'hard' ? 60 : 40;
    if (result.finished) score += 500;
    if (newPos >= 52) score += (newPos - 52) * 30;
    else if (newPos >= 0) score += newPos * 2;
    if (difficulty === 'hard' && newPos >= 0 && newPos < 52 && isSafeSquare(color, newPos)) score += 40;

    if (score > bestScore) {
      bestScore = score;
      bestIdx = idx;
    }
  }

  return bestIdx;
}

// ─── Presence ────────────────────────────────────────────────────────────────

export async function setUserOnline(userId: string, online: boolean): Promise<void> {
  await setDoc(doc(db, 'userPresence', userId), { online, lastSeen: Date.now() }, { merge: true });
}

export function subscribeToFriendsPresence(
  friendIds: string[],
  callback: (presence: Record<string, UserPresence>) => void
): () => void {
  if (friendIds.length === 0) { callback({}); return () => {}; }
  const unsubs: (() => void)[] = [];
  const presenceMap: Record<string, UserPresence> = {};
  for (const uid of friendIds) {
    const unsub = onSnapshot(doc(db, 'userPresence', uid), (snap) => {
      presenceMap[uid] = snap.exists() ? snap.data() as UserPresence : { online: false, lastSeen: 0 };
      callback({ ...presenceMap });
    });
    unsubs.push(unsub);
  }
  return () => unsubs.forEach(u => u());
}

// ─── Room ─────────────────────────────────────────────────────────────────────

export async function createLudoRoom(
  hostProfile: UserProfile,
  playerCount: 2 | 3 | 4,
  invitedProfiles: UserProfile[]
): Promise<string> {
  const colors = COLORS_FOR_COUNT[playerCount];
  const players: LudoPlayer[] = [
    {
      userId: hostProfile.userId,
      username: hostProfile.username,
      photo: hostProfile.photo,
      color: colors[0],
      accepted: true,
      online: true,
    },
    ...invitedProfiles.map((p, i) => ({
      userId: p.userId,
      username: p.username,
      photo: p.photo,
      color: colors[i + 1],
      accepted: false,
      online: false,
    })),
  ];

  const playerIds = [hostProfile.userId, ...invitedProfiles.map(p => p.userId)];

  const ref = await addDoc(collection(db, 'ludoRooms'), {
    hostId: hostProfile.userId,
    playerCount,
    players,
    playerIds,
    status: 'waiting',
    gameState: null,
    countdownStartedAt: null,
    isAIGame: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  await updateDoc(ref, { roomId: ref.id });
  return ref.id;
}

export async function createAIGame(
  hostProfile: UserProfile,
  difficulty: 'easy' | 'medium' | 'hard',
  robotCount: 1 | 2 | 3 = 3
): Promise<string> {
  const playerCount = (robotCount + 1) as 2 | 3 | 4;
  const gameColors = COLORS_FOR_COUNT[playerCount];
  const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  const aiColors = gameColors.slice(1) as LudoColor[];
  const players: LudoPlayer[] = [
    {
      userId: hostProfile.userId,
      username: hostProfile.username,
      photo: hostProfile.photo,
      color: 'red',
      accepted: true,
      online: true,
      isAI: false,
    },
    ...aiColors.map((color, i) => ({
      userId: `ai_${difficulty}_${i + 1}`,
      username: `CPU (${diffLabel})`,
      photo: '',
      color,
      accepted: true,
      online: true,
      isAI: true,
      aiDifficulty: difficulty,
    })),
  ];

  const tokenInit: Partial<Record<LudoColor, number[]>> = {};
  gameColors.forEach(c => { tokenInit[c] = [-1, -1, -1, -1]; });

  const gameState: LudoGameState = {
    tokens: tokenInit as Record<LudoColor, number[]>,
    currentTurn: 'red',
    diceValue: null,
    diceRolled: false,
    winner: null,
    rankings: [],
    lastActionAt: Date.now(),
  };

  const playerIds = [hostProfile.userId, ...aiColors.map((_, i) => `ai_${difficulty}_${i + 1}`)];

  const ref = await addDoc(collection(db, 'ludoRooms'), {
    hostId: hostProfile.userId,
    playerCount,
    players,
    playerIds,
    status: 'started',
    gameState,
    countdownStartedAt: null,
    isAIGame: true,
    aiDifficulty: difficulty,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  await updateDoc(ref, { roomId: ref.id });
  return ref.id;
}

export async function respondToLudoInvite(
  inviteId: string,
  roomId: string,
  userId: string,
  accept: boolean
): Promise<void> {
  await updateDoc(doc(db, 'ludoInvitations', inviteId), {
    status: accept ? 'accepted' : 'rejected',
  });

  if (!accept) {
    await updateDoc(doc(db, 'ludoRooms', roomId), {
      status: 'cancelled',
      updatedAt: Date.now(),
    });
    return;
  }

  const roomSnap = await getDoc(doc(db, 'ludoRooms', roomId));
  if (!roomSnap.exists()) return;
  const room = roomSnap.data() as LudoRoom;

  const players = room.players.map(p =>
    p.userId === userId ? { ...p, accepted: true, online: true } : p
  );

  const allAccepted = players.every(p => p.accepted);

  if (allAccepted) {
    await updateDoc(doc(db, 'ludoRooms', roomId), {
      players,
      status: 'ready',
      countdownStartedAt: Date.now(),
      updatedAt: Date.now(),
    });
  } else {
    await updateDoc(doc(db, 'ludoRooms', roomId), {
      players,
      updatedAt: Date.now(),
    });
  }
}

export async function startLudoGame(
  roomId: string,
  playerCount: 2 | 3 | 4,
  players: LudoPlayer[]
): Promise<void> {
  const roomSnap = await getDoc(doc(db, 'ludoRooms', roomId));
  if (!roomSnap.exists()) return;
  const room = roomSnap.data() as LudoRoom;
  if (room.status !== 'ready') return;

  const colors = COLORS_FOR_COUNT[playerCount];
  const tokens: Record<string, number[]> = {};
  for (const c of colors) tokens[c] = [-1, -1, -1, -1];

  const gameState: LudoGameState = {
    tokens: tokens as Record<LudoColor, number[]>,
    currentTurn: colors[0],
    diceValue: null,
    diceRolled: false,
    winner: null,
    rankings: [],
    lastActionAt: Date.now(),
  };

  await updateDoc(doc(db, 'ludoRooms', roomId), {
    status: 'started',
    gameState,
    updatedAt: Date.now(),
  });
}

export async function cancelLudoRoom(roomId: string): Promise<void> {
  await updateDoc(doc(db, 'ludoRooms', roomId), {
    status: 'cancelled',
    updatedAt: Date.now(),
  });
}

export function subscribeToRoom(
  roomId: string,
  callback: (room: LudoRoom | null) => void
): () => void {
  return onSnapshot(doc(db, 'ludoRooms', roomId), (snap) => {
    if (!snap.exists()) { callback(null); return; }
    callback({ roomId: snap.id, ...snap.data() } as LudoRoom);
  });
}

export function subscribeToActiveGames(
  userId: string,
  callback: (games: LudoRoom[]) => void
): () => void {
  const q = query(
    collection(db, 'ludoRooms'),
    where('playerIds', 'array-contains', userId)
  );
  return onSnapshot(q, (snap) => {
    const games = snap.docs
      .map(d => ({ roomId: d.id, ...d.data() } as LudoRoom))
      .filter(g => g.status === 'started');
    callback(games);
  });
}

// ─── Game Actions ─────────────────────────────────────────────────────────────

export async function updateGameState(
  roomId: string,
  gameState: LudoGameState,
  status?: 'started' | 'finished'
): Promise<void> {
  const update: Record<string, unknown> = { gameState, updatedAt: Date.now() };
  if (status) update.status = status;
  await updateDoc(doc(db, 'ludoRooms', roomId), update);
}

export async function updatePlayerOnlineStatus(
  roomId: string,
  userId: string,
  online: boolean
): Promise<void> {
  const roomSnap = await getDoc(doc(db, 'ludoRooms', roomId));
  if (!roomSnap.exists()) return;
  const room = roomSnap.data() as LudoRoom;
  const players = room.players.map(p =>
    p.userId === userId ? { ...p, online } : p
  );
  await updateDoc(doc(db, 'ludoRooms', roomId), { players, updatedAt: Date.now() });
}

// ─── Invitations ──────────────────────────────────────────────────────────────

export async function sendLudoInvitations(
  roomId: string,
  fromProfile: UserProfile,
  toProfiles: UserProfile[],
  playerCount: 2 | 3 | 4
): Promise<void> {
  for (const profile of toProfiles) {
    const ref = await addDoc(collection(db, 'ludoInvitations'), {
      roomId,
      fromUserId: fromProfile.userId,
      fromUsername: fromProfile.username,
      fromPhoto: fromProfile.photo,
      toUserId: profile.userId,
      playerCount,
      status: 'pending',
      createdAt: Date.now(),
    });
    await updateDoc(ref, { inviteId: ref.id });
  }
}

export function subscribeToPendingInvites(
  userId: string,
  callback: (invites: LudoInvitation[]) => void
): () => void {
  const q = query(
    collection(db, 'ludoInvitations'),
    where('toUserId', '==', userId),
    where('status', '==', 'pending')
  );
  return onSnapshot(q, (snap) => {
    const invites = snap.docs.map(d => ({ inviteId: d.id, ...d.data() } as LudoInvitation));
    callback(invites);
  });
}

export async function getOnlineFriends(
  myUserId: string
): Promise<{ profile: UserProfile; online: boolean; lastSeen: number }[]> {
  const friendsSnap = await getDocs(
    query(collection(db, 'friends'), where('userId', '==', myUserId))
  );
  const friendIds = friendsSnap.docs.map(d => d.data().friendId as string);
  if (friendIds.length === 0) return [];

  const results: { profile: UserProfile; online: boolean; lastSeen: number }[] = [];
  for (const fid of friendIds) {
    const [profileSnap, presenceSnap] = await Promise.all([
      getDoc(doc(db, 'users', fid)),
      getDoc(doc(db, 'userPresence', fid)),
    ]);
    if (!profileSnap.exists()) continue;
    const profile = profileSnap.data() as UserProfile;
    const presence = presenceSnap.exists()
      ? (presenceSnap.data() as UserPresence)
      : { online: false, lastSeen: 0 };
    results.push({ profile, online: presence.online, lastSeen: presence.lastSeen });
  }
  return results.sort((a, b) => (b.online ? 1 : 0) - (a.online ? 1 : 0));
}
