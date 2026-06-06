export type LudoColor = 'red' | 'green' | 'blue' | 'yellow';

export const LUDO_COLORS: LudoColor[] = ['red', 'green', 'blue', 'yellow'];

export const COLOR_HEX: Record<LudoColor, string> = {
  red: '#EF4444',
  green: '#22C55E',
  blue: '#3B82F6',
  yellow: '#EAB308',
};

export const COLOR_LIGHT: Record<LudoColor, string> = {
  red: '#FEE2E2',
  green: '#DCFCE7',
  blue: '#DBEAFE',
  yellow: '#FEF9C3',
};

// Each color's starting absolute position on the 52-cell main track
export const COLOR_ENTRY: Record<LudoColor, number> = {
  red: 0,
  green: 13,
  blue: 26,
  yellow: 39,
};

// 52 main track positions [row, col] on a 15x15 grid
// Going CCW: UP on col 0, RIGHT on row 0, DOWN on col 14, LEFT on row 14
export const MAIN_PATH: [number, number][] = [
  // Left col going UP (Red enters at 0)
  [13,0],[12,0],[11,0],[10,0],[9,0],[8,0],[7,0],[6,0],[5,0],[4,0],[3,0],[2,0],[1,0],
  // Top row going RIGHT (Green enters at 13)
  [0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[0,11],[0,12],[0,13],
  // Right col going DOWN (Blue enters at 26)
  [1,14],[2,14],[3,14],[4,14],[5,14],[6,14],[7,14],[8,14],[9,14],[10,14],[11,14],[12,14],[13,14],
  // Bottom row going LEFT (Yellow enters at 39)
  [14,13],[14,12],[14,11],[14,10],[14,9],[14,8],[14,7],[14,6],[14,5],[14,4],[14,3],[14,2],[14,1],
];

// Home paths: 6 cells each, entered at relative position 52-57
export const HOME_PATHS: Record<LudoColor, [number, number][]> = {
  // Red: from pos 51=(14,1), goes UP on col 1
  red:    [[13,1],[12,1],[11,1],[10,1],[9,1],[8,1]],
  // Green: from pos 12=(1,0), goes RIGHT on row 1
  green:  [[1,1],[1,2],[1,3],[1,4],[1,5],[1,6]],
  // Blue: from pos 25=(0,13), goes DOWN on col 13
  blue:   [[1,13],[2,13],[3,13],[4,13],[5,13],[6,13]],
  // Yellow: from pos 38=(13,14), goes LEFT on row 13
  yellow: [[13,13],[13,12],[13,11],[13,10],[13,9],[13,8]],
};

// Absolute safe square positions on main track
export const SAFE_ABS = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// Token base positions (where pieces sit before entering board)
export const HOME_BASES: Record<LudoColor, [number, number][]> = {
  red:    [[10,2],[10,3],[11,2],[11,3]],
  green:  [[3,2],[3,3],[4,2],[4,3]],
  blue:   [[3,11],[3,12],[4,11],[4,12]],
  yellow: [[10,11],[10,12],[11,11],[11,12]],
};

// Colors used in 2/3/4 player games
export const COLORS_FOR_COUNT: Record<number, LudoColor[]> = {
  2: ['red', 'blue'],
  3: ['red', 'green', 'blue'],
  4: ['red', 'green', 'blue', 'yellow'],
};

export function getAbsolutePos(color: LudoColor, relativePos: number): number {
  return (relativePos + COLOR_ENTRY[color]) % 52;
}

// Convert relative position (-1=base, 0-51=main track, 52-57=home path, 57=done) → [row, col]
export function getTokenCell(
  color: LudoColor,
  relativePos: number,
  tokenIdx: number
): [number, number] | null {
  if (relativePos === -1) return HOME_BASES[color][tokenIdx];
  if (relativePos >= 57) return HOME_PATHS[color][5]; // finished = render at end
  if (relativePos >= 52) return HOME_PATHS[color][relativePos - 52];
  const absPos = getAbsolutePos(color, relativePos);
  return MAIN_PATH[absPos];
}

export function isSafeSquare(color: LudoColor, relativePos: number): boolean {
  if (relativePos < 0 || relativePos >= 52) return false;
  return SAFE_ABS.has(getAbsolutePos(color, relativePos));
}

// Returns indices of tokens that can move with this dice value
export function getMovableTokens(tokenPositions: number[], diceValue: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < 4; i++) {
    const pos = tokenPositions[i];
    if (pos >= 57) continue; // finished
    if (pos === -1) {
      if (diceValue === 6) result.push(i);
      continue;
    }
    const newPos = pos + diceValue;
    if (newPos > 57) continue; // would overshoot home
    result.push(i);
  }
  return result;
}

export interface ApplyMoveResult {
  newPositions: number[];
  captures: { color: LudoColor; tokenIdx: number }[];
  finished: boolean;
  extraTurn: boolean;
}

export function applyMove(
  movingColor: LudoColor,
  tokenIdx: number,
  currentPositions: number[],
  diceValue: number,
  allTokens: Record<string, number[]>
): ApplyMoveResult {
  const newPositions = [...currentPositions];
  const pos = newPositions[tokenIdx];
  const captures: { color: LudoColor; tokenIdx: number }[] = [];

  if (pos === -1) {
    newPositions[tokenIdx] = 0;
  } else {
    newPositions[tokenIdx] = pos + diceValue;
  }

  const newRelPos = newPositions[tokenIdx];

  // Check captures only on main track, non-safe squares
  if (newRelPos >= 0 && newRelPos < 52 && !isSafeSquare(movingColor, newRelPos)) {
    const newAbsPos = getAbsolutePos(movingColor, newRelPos);
    for (const [colorStr, positions] of Object.entries(allTokens)) {
      const color = colorStr as LudoColor;
      if (color === movingColor) continue;
      for (let i = 0; i < positions.length; i++) {
        const otherPos = positions[i];
        if (otherPos < 0 || otherPos >= 52) continue; // home base or home path = safe
        if (getAbsolutePos(color, otherPos) === newAbsPos) {
          captures.push({ color, tokenIdx: i });
        }
      }
    }
  }

  const finished = newPositions.every(p => p >= 57);
  const extraTurn = diceValue === 6 || captures.length > 0;

  return { newPositions, captures, finished, extraTurn };
}

export function getNextTurn(current: LudoColor, playerColors: LudoColor[]): LudoColor {
  const idx = playerColors.indexOf(current);
  return playerColors[(idx + 1) % playerColors.length];
}

export function checkWinner(tokens: Record<string, number[]>): LudoColor | null {
  for (const [color, positions] of Object.entries(tokens)) {
    if (positions.every(p => p >= 57)) return color as LudoColor;
  }
  return null;
}

// Board cell type for rendering
export type CellType =
  | 'track' | 'safe'
  | 'red_path' | 'green_path' | 'blue_path' | 'yellow_path'
  | 'red_home' | 'green_home' | 'blue_home' | 'yellow_home'
  | 'center' | 'corner' | 'empty';

// Shared game state type (used by both online and offline modes)
export interface LudoGameState {
  tokens: Record<LudoColor, number[]>;
  currentTurn: LudoColor;
  diceValue: number | null;
  diceRolled: boolean;
  winner: LudoColor | null;
  rankings: LudoColor[];
  lastActionAt?: number;
}

export function getCellType(row: number, col: number): CellType {
  // Main track + safe squares
  const isLeftCol   = col === 0  && row >= 1  && row <= 13;
  const isTopRow    = row === 0  && col >= 1  && col <= 13;
  const isRightCol  = col === 14 && row >= 1  && row <= 13;
  const isBottomRow = row === 14 && col >= 1  && col <= 13;
  if (isLeftCol || isTopRow || isRightCol || isBottomRow) {
    const mainIdx = MAIN_PATH.findIndex(([r,c]) => r === row && c === col);
    if (mainIdx !== -1 && SAFE_ABS.has(mainIdx)) return 'safe';
    return 'track';
  }

  // Home paths
  if (col === 1  && row >= 8  && row <= 13) return 'red_path';
  if (row === 1  && col >= 1  && col <= 6)  return 'green_path';
  if (col === 13 && row >= 1  && row <= 6)  return 'blue_path';
  if (row === 13 && col >= 8  && col <= 13) return 'yellow_path';

  // Center cell
  if (row === 7 && col === 7) return 'center';

  // Home base areas
  if (row >= 1 && row <= 6  && col >= 1  && col <= 6)  return 'green_home';
  if (row >= 1 && row <= 6  && col >= 8  && col <= 13) return 'blue_home';
  if (row >= 8 && row <= 13 && col >= 1  && col <= 6)  return 'red_home';
  if (row >= 8 && row <= 13 && col >= 8  && col <= 13) return 'yellow_home';

  // Corners of board
  if ((row === 0 || row === 14) && (col === 0 || col === 14)) return 'corner';

  return 'empty';
}
