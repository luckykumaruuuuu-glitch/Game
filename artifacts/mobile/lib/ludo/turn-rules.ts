export type PlayerType = 'PLAYER' | 'BOT' | undefined;

export function isPlayerFinished(tokenPositions: number[]): boolean {
  return tokenPositions.every(tp => tp === 56);
}

export function allTokensInHome(tokenPositions: number[]): boolean {
  return tokenPositions.every(p => p === -1);
}

export function getFinishedCount(tokenPositions: number[] | null | undefined): number {
  if (!tokenPositions) return 0;
  return tokenPositions.filter(p => p === 56).length;
}

export function selectStartingPlayer(playerTypes: PlayerType[]): number {
  return playerTypes.includes('PLAYER')
    ? playerTypes.indexOf('PLAYER')
    : playerTypes.findIndex(t => t !== undefined);
}

export function getNextPlayerIndex(
  currentIndex: number,
  playerTypes: PlayerType[],
  playerTokenPositions: (number[] | null | undefined)[]
): number {
  for (let k = 1; k <= 4; k++) {
    const j = (currentIndex + k) % 4;
    if (playerTypes[j] === undefined) continue;
    if (!playerTokenPositions[j]) continue;
    if (isPlayerFinished(playerTokenPositions[j]!)) continue;
    return j;
  }
  return -1;
}

export function shouldEndGame(
  playerTypes: PlayerType[],
  playerTokenPositions: (number[] | null | undefined)[]
): boolean {
  let remaining = 0;
  let remainingHumans = 0;
  let hasHuman = false;
  playerTypes.forEach((t, i) => {
    if (!t) return;
    if (t === 'PLAYER') hasHuman = true;
    if (!playerTokenPositions[i] || !isPlayerFinished(playerTokenPositions[i]!)) {
      remaining++;
      if (t === 'PLAYER') remainingHumans++;
    }
  });
  const allHumansDone = hasHuman && remainingHumans === 0 && remaining > 0;
  return remaining <= 1 || allHumansDone;
}

export function computeLeftoverRankOrder(
  playerTypes: PlayerType[],
  playerTokenPositions: (number[] | null | undefined)[],
  playerRanks: number[]
): number[] {
  const leftover: number[] = [];
  playerTypes.forEach((t, i) => {
    if (t && playerRanks[i] === 0) leftover.push(i);
  });
  leftover.sort((a, b) => {
    const fa = getFinishedCount(playerTokenPositions[a]);
    const fb = getFinishedCount(playerTokenPositions[b]);
    if (fb !== fa) return fb - fa;
    const sa = (playerTokenPositions[a] ?? []).reduce((s, p) => s + (p < 0 ? 0 : p), 0);
    const sb = (playerTokenPositions[b] ?? []).reduce((s, p) => s + (p < 0 ? 0 : p), 0);
    return sb - sa;
  });
  return leftover;
}
