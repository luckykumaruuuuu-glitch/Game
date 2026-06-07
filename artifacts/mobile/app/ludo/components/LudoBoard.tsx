import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { getMarkIndex } from '../../../lib/ludo/game-logic';
import { SAFE_SQUARES } from '../../../lib/ludo/game-logic';

export const PLAYER_COLORS = ['#22C55E', '#EAB308', '#EF4444', '#3B82F6'];
export const PLAYER_LIGHT = ['#DCFCE7', '#FEF9C3', '#FEE2E2', '#DBEAFE'];
export const PLAYER_DARK  = ['#15803D', '#A16207', '#B91C1C', '#1D4ED8'];
export const PLAYER_NAMES_DEFAULT = ['Green', 'Yellow', 'Red', 'Blue'];

// 52 main track cells: [row, col] on a 15×15 grid
const MARK_CELLS: [number, number][] = [
  [6,1],[6,2],[6,3],[6,4],[6,5],   // 0-4
  [5,6],[4,6],[3,6],[2,6],[1,6],[0,6], // 5-10
  [0,7],[0,8],                      // 11-12
  [1,8],[2,8],[3,8],[4,8],[5,8],    // 13-17
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14], // 18-23
  [7,14],[8,14],                    // 24-25
  [8,13],[8,12],[8,11],[8,10],[8,9],// 26-30
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8], // 31-36
  [14,7],[14,6],                    // 37-38
  [13,6],[12,6],[11,6],[10,6],[9,6],// 39-43
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0], // 44-49
  [7,0],[6,0],                      // 50-51
];

// Home stretch cells per player: positions 51-55 → index 0-4
const HOME_STRETCH: [number, number][][] = [
  [[7,1],[7,2],[7,3],[7,4],[7,5]],   // player 0 green
  [[1,7],[2,7],[3,7],[4,7],[5,7]],   // player 1 yellow
  [[7,13],[7,12],[7,11],[7,10],[7,9]],// player 2 red
  [[13,7],[12,7],[11,7],[10,7],[9,7]],// player 3 blue
];

// Home yard token slots per player (2×2 inside their 6×6 corner)
const HOME_SLOTS: [number, number][][] = [
  [[1,1],[1,4],[4,1],[4,4]],       // player 0 TL
  [[1,10],[1,13],[4,10],[4,13]],   // player 1 TR
  [[10,10],[10,13],[13,10],[13,13]],// player 2 BR
  [[10,1],[10,4],[13,1],[13,4]],   // player 3 BL
];

const SAFE_SET = new Set(SAFE_SQUARES);

function getTokenCell(pi: number, ti: number, pos: number): [number, number] {
  if (pos === -1) return HOME_SLOTS[pi][ti];
  if (pos >= 56) return [7, 7];
  if (pos >= 51) return HOME_STRETCH[pi][pos - 51];
  const mark = (pos + 13 * pi) % 52;
  return MARK_CELLS[mark];
}

interface TokenGroup {
  row: number;
  col: number;
  tokens: { pi: number; ti: number }[];
}

interface LudoBoardProps {
  tokenPositions: (number[] | null)[];
  activePlayerIndex: number;
  movableTokenIndexes: number[];
  onTokenPress: (tokenIndex: number) => void;
  boardSize: number;
  playerNames?: string[];
}

export default function LudoBoard({
  tokenPositions,
  activePlayerIndex,
  movableTokenIndexes,
  onTokenPress,
  boardSize,
  playerNames = PLAYER_NAMES_DEFAULT,
}: LudoBoardProps) {
  const cell = boardSize / 15;

  // Group tokens by cell position (for stacking)
  const tokenGroups = useMemo((): TokenGroup[] => {
    const map = new Map<string, TokenGroup>();
    for (let pi = 0; pi < 4; pi++) {
      const pts = tokenPositions[pi];
      if (!pts) continue;
      for (let ti = 0; ti < 4; ti++) {
        const [row, col] = getTokenCell(pi, ti, pts[ti]);
        const key = `${row},${col}`;
        if (!map.has(key)) map.set(key, { row, col, tokens: [] });
        map.get(key)!.tokens.push({ pi, ti });
      }
    }
    return Array.from(map.values());
  }, [tokenPositions]);

  // Check if a token is movable (belongs to active player)
  function isMovable(pi: number, ti: number) {
    return pi === activePlayerIndex && movableTokenIndexes.includes(ti);
  }

  return (
    <View style={[styles.board, { width: boardSize, height: boardSize }]}>
      {/* ── HOME QUADRANTS ── */}
      {/* Player 0 (Green) TL */}
      <View style={[styles.homeQuad, {
        top: 0, left: 0, width: cell * 6, height: cell * 6,
        backgroundColor: PLAYER_COLORS[0],
      }]}>
        <View style={[styles.homeInner, {
          width: cell * 4, height: cell * 4,
          backgroundColor: PLAYER_LIGHT[0],
          borderRadius: cell * 0.4,
        }]}>
          <Text style={[styles.homeLabel, { color: PLAYER_DARK[0] }]}>{playerNames[0]}</Text>
        </View>
      </View>

      {/* Player 1 (Yellow) TR */}
      <View style={[styles.homeQuad, {
        top: 0, right: 0, width: cell * 6, height: cell * 6,
        backgroundColor: PLAYER_COLORS[1],
      }]}>
        <View style={[styles.homeInner, {
          width: cell * 4, height: cell * 4,
          backgroundColor: PLAYER_LIGHT[1],
          borderRadius: cell * 0.4,
        }]}>
          <Text style={[styles.homeLabel, { color: PLAYER_DARK[1] }]}>{playerNames[1]}</Text>
        </View>
      </View>

      {/* Player 2 (Red) BR */}
      <View style={[styles.homeQuad, {
        bottom: 0, right: 0, width: cell * 6, height: cell * 6,
        backgroundColor: PLAYER_COLORS[2],
      }]}>
        <View style={[styles.homeInner, {
          width: cell * 4, height: cell * 4,
          backgroundColor: PLAYER_LIGHT[2],
          borderRadius: cell * 0.4,
        }]}>
          <Text style={[styles.homeLabel, { color: PLAYER_DARK[2] }]}>{playerNames[2]}</Text>
        </View>
      </View>

      {/* Player 3 (Blue) BL */}
      <View style={[styles.homeQuad, {
        bottom: 0, left: 0, width: cell * 6, height: cell * 6,
        backgroundColor: PLAYER_COLORS[3],
      }]}>
        <View style={[styles.homeInner, {
          width: cell * 4, height: cell * 4,
          backgroundColor: PLAYER_LIGHT[3],
          borderRadius: cell * 0.4,
        }]}>
          <Text style={[styles.homeLabel, { color: PLAYER_DARK[3] }]}>{playerNames[3]}</Text>
        </View>
      </View>

      {/* ── CROSS PATH ── white arms */}
      {/* Vertical arm (cols 6-8, rows 0-14) */}
      <View style={{
        position: 'absolute', top: 0, left: cell * 6,
        width: cell * 3, height: boardSize,
        backgroundColor: '#FFFFFF', borderLeftWidth: 1, borderRightWidth: 1,
        borderColor: '#D1D5DB',
      }} />
      {/* Horizontal arm (rows 6-8, cols 0-14) */}
      <View style={{
        position: 'absolute', left: 0, top: cell * 6,
        width: boardSize, height: cell * 3,
        backgroundColor: '#FFFFFF', borderTopWidth: 1, borderBottomWidth: 1,
        borderColor: '#D1D5DB',
      }} />

      {/* ── HOME STRETCH LANES (colored center strips) ── */}
      {/* Green (player 0): row=7, cols 1-5 */}
      {[1,2,3,4,5].map(col => (
        <View key={`g${col}`} style={[styles.stretchCell, {
          top: cell * 7, left: cell * col,
          width: cell, height: cell,
          backgroundColor: PLAYER_LIGHT[0],
          borderWidth: 0.5, borderColor: PLAYER_COLORS[0],
        }]} />
      ))}
      {/* Yellow (player 1): col=7, rows 1-5 */}
      {[1,2,3,4,5].map(row => (
        <View key={`y${row}`} style={[styles.stretchCell, {
          top: cell * row, left: cell * 7,
          width: cell, height: cell,
          backgroundColor: PLAYER_LIGHT[1],
          borderWidth: 0.5, borderColor: PLAYER_COLORS[1],
        }]} />
      ))}
      {/* Red (player 2): row=7, cols 9-13 */}
      {[9,10,11,12,13].map(col => (
        <View key={`r${col}`} style={[styles.stretchCell, {
          top: cell * 7, left: cell * col,
          width: cell, height: cell,
          backgroundColor: PLAYER_LIGHT[2],
          borderWidth: 0.5, borderColor: PLAYER_COLORS[2],
        }]} />
      ))}
      {/* Blue (player 3): col=7, rows 9-13 */}
      {[9,10,11,12,13].map(row => (
        <View key={`b${row}`} style={[styles.stretchCell, {
          top: cell * row, left: cell * 7,
          width: cell, height: cell,
          backgroundColor: PLAYER_LIGHT[3],
          borderWidth: 0.5, borderColor: PLAYER_COLORS[3],
        }]} />
      ))}

      {/* ── SAFE SQUARES ── star indicator */}
      {SAFE_SQUARES.map(mark => {
        const [row, col] = MARK_CELLS[mark];
        let starColor = '#9CA3AF';
        if (mark === 0) starColor = PLAYER_COLORS[0];
        else if (mark === 13) starColor = PLAYER_COLORS[1];
        else if (mark === 26) starColor = PLAYER_COLORS[2];
        else if (mark === 39) starColor = PLAYER_COLORS[3];
        return (
          <View key={`safe${mark}`} style={[styles.safeCell, {
            top: cell * row, left: cell * col,
            width: cell, height: cell,
          }]}>
            <Text style={{ fontSize: cell * 0.6, color: starColor }}>★</Text>
          </View>
        );
      })}

      {/* ── CENTER FINISH ── */}
      <View style={{
        position: 'absolute',
        top: cell * 6, left: cell * 6,
        width: cell * 3, height: cell * 3,
        overflow: 'hidden',
      }}>
        {/* Four triangles meeting at center */}
        {/* Green (TL) */}
        <View style={{ position: 'absolute', width: 0, height: 0,
          borderRightWidth: cell * 1.5, borderBottomWidth: cell * 1.5,
          borderRightColor: 'transparent', borderBottomColor: 'transparent',
          borderTopWidth: cell * 1.5, borderTopColor: PLAYER_COLORS[0],
          borderLeftWidth: cell * 1.5, borderLeftColor: PLAYER_COLORS[0],
          top: 0, left: 0 }} />
        {/* Yellow (TR) */}
        <View style={{ position: 'absolute', width: 0, height: 0,
          borderLeftWidth: cell * 1.5, borderBottomWidth: cell * 1.5,
          borderLeftColor: 'transparent', borderBottomColor: 'transparent',
          borderTopWidth: cell * 1.5, borderTopColor: PLAYER_COLORS[1],
          borderRightWidth: cell * 1.5, borderRightColor: PLAYER_COLORS[1],
          top: 0, right: 0 }} />
        {/* Red (BR) */}
        <View style={{ position: 'absolute', width: 0, height: 0,
          borderLeftWidth: cell * 1.5, borderTopWidth: cell * 1.5,
          borderLeftColor: 'transparent', borderTopColor: 'transparent',
          borderBottomWidth: cell * 1.5, borderBottomColor: PLAYER_COLORS[2],
          borderRightWidth: cell * 1.5, borderRightColor: PLAYER_COLORS[2],
          bottom: 0, right: 0 }} />
        {/* Blue (BL) */}
        <View style={{ position: 'absolute', width: 0, height: 0,
          borderRightWidth: cell * 1.5, borderTopWidth: cell * 1.5,
          borderRightColor: 'transparent', borderTopColor: 'transparent',
          borderBottomWidth: cell * 1.5, borderBottomColor: PLAYER_COLORS[3],
          borderLeftWidth: cell * 1.5, borderLeftColor: PLAYER_COLORS[3],
          bottom: 0, left: 0 }} />
        {/* Center dot */}
        <View style={{
          position: 'absolute',
          width: cell * 0.7, height: cell * 0.7,
          borderRadius: cell * 0.35,
          backgroundColor: '#FFFFFF',
          top: cell * 1.15, left: cell * 1.15,
        }} />
      </View>

      {/* ── GRID LINES on path ── */}
      {MARK_CELLS.map(([row, col], idx) => (
        <View key={`cell${idx}`} style={{
          position: 'absolute',
          top: cell * row, left: cell * col,
          width: cell, height: cell,
          borderWidth: 0.5, borderColor: '#E5E7EB',
        }} />
      ))}

      {/* ── TOKENS ── */}
      {tokenGroups.map(group => {
        const { row, col, tokens } = group;
        const count = tokens.length;
        const tokenR = count > 1 ? cell * 0.27 : cell * 0.33;
        const offsets: [number, number][] = count === 1
          ? [[0, 0]]
          : count === 2
          ? [[-cell * 0.13, -cell * 0.13], [cell * 0.13, cell * 0.13]]
          : count === 3
          ? [[-cell * 0.14, -cell * 0.14], [cell * 0.14, -cell * 0.14], [0, cell * 0.14]]
          : [[-cell * 0.14, -cell * 0.14], [cell * 0.14, -cell * 0.14],
             [-cell * 0.14, cell * 0.14], [cell * 0.14, cell * 0.14]];

        return tokens.map(({ pi, ti }, i) => {
          const movable = isMovable(pi, ti);
          const [dy, dx] = offsets[i] ?? [0, 0];
          const cx = cell * col + cell / 2 + dx;
          const cy = cell * row + cell / 2 + dy;
          return (
            <Pressable
              key={`token-${pi}-${ti}`}
              onPress={() => movable && onTokenPress(ti)}
              style={[{
                position: 'absolute',
                width: tokenR * 2,
                height: tokenR * 2,
                borderRadius: tokenR,
                backgroundColor: PLAYER_COLORS[pi],
                left: cx - tokenR,
                top: cy - tokenR,
                borderWidth: movable ? 2.5 : 1.5,
                borderColor: movable ? '#FFFFFF' : PLAYER_DARK[pi],
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: movable ? 20 : 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
                elevation: movable ? 5 : 3,
              }]}
            >
              <Text style={{ fontSize: tokenR * 0.8, color: '#FFF', fontWeight: '700' }}>
                {ti + 1}
              </Text>
              {movable && (
                <View style={{
                  position: 'absolute', width: tokenR * 2.6, height: tokenR * 2.6,
                  borderRadius: tokenR * 1.3, borderWidth: 2,
                  borderColor: '#FFFFFF80', top: -tokenR * 0.3, left: -tokenR * 0.3,
                }} />
              )}
            </Pressable>
          );
        });
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: { position: 'relative', backgroundColor: '#F3F4F6', overflow: 'hidden' },
  homeQuad: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  homeInner: { alignItems: 'center', justifyContent: 'center' },
  homeLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  stretchCell: { position: 'absolute' },
  safeCell: { position: 'absolute', alignItems: 'center', justifyContent: 'center', zIndex: 5 },
});
