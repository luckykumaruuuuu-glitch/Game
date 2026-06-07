export const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

export function isTokenMovable(tokenPosition: number, diceRoll: number): boolean {
  if (diceRoll === 6 && tokenPosition === -1) return true;
  return tokenPosition >= 0 && tokenPosition + diceRoll <= 56;
}

export function getMarkIndex(playerIndex: number, tokenPosition: number): number | undefined {
  if (tokenPosition === -1 || tokenPosition > 50) return undefined;
  return (tokenPosition + 13 * playerIndex) % 52;
}

export function isSafePosition(tokenPosition: number): boolean {
  return SAFE_SQUARES.includes(tokenPosition) || tokenPosition > 50;
}

export function generateDiceRoll(randomFn: () => number = Math.random): number {
  const weights = [1, 2, 2, 1, 2, 2];
  let sum = 0;
  const cumulativeWeights = weights.map(v => (sum += v));
  const maxWeight = cumulativeWeights[cumulativeWeights.length - 1];
  const randomValue = randomFn() * maxWeight;
  return cumulativeWeights.findIndex(cw => randomValue < cw) + 1;
}

export function getTokenNewPosition(currentPosition: number, diceRoll: number): number {
  if (currentPosition === -1) return 0;
  return currentPosition + diceRoll;
}

export function findCapturedOpponents(
  playerIndex: number,
  tokenPosition: number,
  tokenPositions: (number[] | null | undefined)[]
): number[][] {
  if (isSafePosition(tokenPosition)) return new Array(4).fill([]);
  const tokenMarkIndex = getMarkIndex(playerIndex, tokenPosition);
  const result: number[][] = new Array(4).fill(null).map(() => []);
  for (let pi = 0; pi < tokenPositions.length; pi++) {
    const ptp = tokenPositions[pi];
    if (ptp && pi !== playerIndex) {
      for (let ti = 0; ti < ptp.length; ti++) {
        const tMarkIndex = getMarkIndex(pi, ptp[ti]);
        if (tokenMarkIndex === tMarkIndex) result[pi].push(ti);
      }
    }
  }
  for (let pi = 0; pi < result.length; pi++) {
    if (result[pi].length === 2) result[pi] = [];
  }
  return result;
}

export function isTripComplete(tokenPosition: number): boolean {
  return tokenPosition === 56;
}

export function getMovableTokenIndexes(
  playerIndex: number,
  tokenPositions: number[],
  diceRoll: number
): number[] {
  const movable: number[] = [];
  const seen = new Set<number>();
  for (let ti = 0; ti < tokenPositions.length; ti++) {
    const p = tokenPositions[ti];
    if (!isTokenMovable(p, diceRoll)) continue;
    const key = p === -1 ? -1 : p;
    if (!seen.has(key)) {
      seen.add(key);
      movable.push(ti);
    }
  }
  return movable;
}
