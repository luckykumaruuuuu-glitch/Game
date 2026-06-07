import { SAFE_SQUARES } from './game-logic';

const SAFE_SET = new Set(SAFE_SQUARES);
const DICE_PROB = [0, 1 / 9, 2 / 9, 2 / 9, 1 / 9, 2 / 9, 2 / 9];
const DISCOUNT = 0.7;

export const PERSONALITIES = {
  balanced:   { home: 0, finished: 60, progress: 0.5, safe: 3, stack: 4, threat: 4, captureBonus: 10 },
  aggressive: { home: 0, finished: 50, progress: 0.7, safe: 1, stack: 2, threat: 1, captureBonus: 18 },
  defensive:  { home: 0, finished: 60, progress: 0.3, safe: 6, stack: 7, threat: 8, captureBonus: 5 },
  rusher:     { home: 0, finished: 80, progress: 1.0, safe: 1, stack: 1, threat: 2, captureBonus: 6 },
} as const;

export type Personality = keyof typeof PERSONALITIES;
type Weights = typeof PERSONALITIES[Personality];

const PERSONALITY_KEYS = Object.keys(PERSONALITIES) as Personality[];

export function randomPersonality(): Personality {
  return PERSONALITY_KEYS[Math.floor(Math.random() * PERSONALITY_KEYS.length)];
}

function countAt(arr: (number | undefined)[], pos: number): number {
  let n = 0;
  for (let i = 0; i < arr.length; i++) if (arr[i] === pos) n++;
  return n;
}

function markIndex(playerIndex: number, tokenPosition: number): number {
  return (tokenPosition + 13 * playerIndex) % 52;
}

function threatCount(myPi: number, myTi: number, positions: (number[] | null | undefined)[]): number {
  const p = positions[myPi]?.[myTi];
  if (p == null || p < 0 || p > 50 || SAFE_SET.has(p)) return 0;
  const myMark = markIndex(myPi, p);
  let n = 0;
  for (let pi = 0; pi < 4; pi++) {
    if (!positions[pi] || pi === myPi) continue;
    for (let ti = 0; ti < 4; ti++) {
      const op = positions[pi]![ti];
      if (op < 0 || op > 50) continue;
      const d = (myMark - markIndex(pi, op) + 52) % 52;
      if (d >= 1 && d <= 6) n++;
    }
  }
  return n;
}

function evalState(playerIndex: number, positions: (number[] | null | undefined)[], w: Weights): number {
  let score = 0;
  for (let pi = 0; pi < 4; pi++) {
    if (!positions[pi]) continue;
    const sign = pi === playerIndex ? 1 : -1;
    for (let ti = 0; ti < 4; ti++) {
      const p = positions[pi]![ti];
      if (p === -1) { score += sign * w.home; continue; }
      if (p === 56) { score += sign * w.finished; continue; }
      score += sign * w.progress * p;
      if (p > 50 || SAFE_SET.has(p)) score += sign * w.safe;
      if (pi === playerIndex && countAt(positions[pi]!, p) >= 2) score += w.stack;
      if (sign === 1) score -= w.threat * threatCount(pi, ti, positions);
    }
  }
  return score;
}

function applyMove(
  playerIndex: number,
  tokenIndex: number,
  dice: number,
  positions: (number[] | null | undefined)[]
): { next: (number[] | null)[]; caps: number } {
  const next: (number[] | null)[] = positions.map(p => p ? p.slice() : null);
  const cur = next[playerIndex]![tokenIndex];
  const np = cur === -1 ? 0 : cur + dice;
  next[playerIndex]![tokenIndex] = np;
  let caps = 0;
  if (np <= 50 && !SAFE_SET.has(np)) {
    const myMark = markIndex(playerIndex, np);
    for (let pi = 0; pi < 4; pi++) {
      if (!next[pi] || pi === playerIndex) continue;
      const hits: number[] = [];
      for (let ti = 0; ti < 4; ti++) {
        const op = next[pi]![ti];
        if (op < 0 || op > 50) continue;
        if (markIndex(pi, op) === myMark) hits.push(ti);
      }
      if (hits.length === 1) { next[pi]![hits[0]] = -1; caps++; }
    }
  }
  return { next, caps };
}

function legalMoves(playerIndex: number, dice: number, positions: (number[] | null | undefined)[]): number[] {
  const moves: number[] = [];
  const seen = new Set<number>();
  for (let ti = 0; ti < 4; ti++) {
    const p = positions[playerIndex]?.[ti];
    if (p === undefined) continue;
    if (dice === 6 && p === -1) {
      if (!seen.has(-1)) { seen.add(-1); moves.push(ti); }
      continue;
    }
    if (p >= 0 && p + dice <= 56 && !seen.has(p)) { seen.add(p); moves.push(ti); }
  }
  return moves;
}

function nextActive(pi: number, positions: (number[] | null | undefined)[]): number {
  for (let k = 1; k <= 4; k++) {
    const j = (pi + k) % 4;
    if (positions[j] && positions[j]!.some(p => p !== 56)) return j;
  }
  return -1;
}

function expectiOpponent(myIndex: number, positions: (number[] | null | undefined)[], w: Weights): number {
  const opp = nextActive(myIndex, positions);
  if (opp === -1) return evalState(myIndex, positions, w);
  let exp = 0;
  for (let d = 1; d <= 6; d++) {
    const moves = legalMoves(opp, d, positions);
    let worstForMe: number;
    if (moves.length === 0) {
      worstForMe = evalState(myIndex, positions, w);
    } else {
      worstForMe = Infinity;
      for (const ti of moves) {
        const { next, caps } = applyMove(opp, ti, d, positions);
        const s = evalState(myIndex, next, w) - (w.captureBonus || 0) * caps;
        if (s < worstForMe) worstForMe = s;
      }
    }
    exp += DICE_PROB[d] * worstForMe;
  }
  return exp;
}

export function pickBestMove(
  playerIndex: number,
  dice: number,
  positions: (number[] | null | undefined)[],
  personality: Personality,
  depth = 1
): number {
  const w = PERSONALITIES[personality];
  const moves = legalMoves(playerIndex, dice, positions);
  if (moves.length === 0) return -1;
  if (moves.length === 1) return moves[0];
  let bestScore = -Infinity;
  let best = moves[0];
  for (const ti of moves) {
    const { next, caps } = applyMove(playerIndex, ti, dice, positions);
    let s = depth > 0
      ? DISCOUNT * expectiOpponent(playerIndex, next, w)
      : evalState(playerIndex, next, w);
    s += (w.captureBonus || 0) * caps;
    if (s > bestScore) { bestScore = s; best = ti; }
  }
  return best;
}
