import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  LUDO_COLORS,
  COLOR_HEX,
  MAIN_PATH,
  HOME_PATHS,
  HOME_BASES,
  SAFE_ABS,
  getCellType,
  getTokenCell,
  type LudoColor,
  type CellType,
  type LudoGameState,
} from '@/lib/ludoEngine';

// Precompute board cells once
const BOARD_CELLS: { row: number; col: number; type: CellType }[] = [];
for (let r = 0; r < 15; r++) {
  for (let c = 0; c < 15; c++) {
    BOARD_CELLS.push({ row: r, col: c, type: getCellType(r, c) });
  }
}

function getCellBg(type: CellType): string {
  switch (type) {
    case 'track':      return '#FFFFFF';
    case 'safe':       return '#FFFBEB';
    case 'red_path':   return '#FCA5A5';
    case 'green_path': return '#86EFAC';
    case 'blue_path':  return '#93C5FD';
    case 'yellow_path':return '#FDE68A';
    case 'red_home':   return '#EF4444';
    case 'green_home': return '#22C55E';
    case 'blue_home':  return '#3B82F6';
    case 'yellow_home':return '#EAB308';
    case 'center':     return '#7C3AED';
    case 'corner':     return '#1E1B4B';
    default:           return '#E5E7EB';
  }
}

interface TokenInfo {
  color: LudoColor;
  tokenIdx: number;
  relPos: number;
}

interface Props {
  gameState: LudoGameState;
  activeColors: LudoColor[];
  myColor: LudoColor | null;
  movableTokens: number[];
  onTokenPress: (tokenIdx: number) => void;
  boardSize: number;
  disabled?: boolean;
}

export default function LudoBoard({
  gameState,
  activeColors,
  myColor,
  movableTokens,
  onTokenPress,
  boardSize,
  disabled = false,
}: Props) {
  const cellSize = boardSize / 15;

  // Group tokens by cell position
  const cellTokenMap = useMemo(() => {
    const map = new Map<string, TokenInfo[]>();
    for (const color of activeColors) {
      const positions = gameState.tokens[color];
      if (!positions) continue;
      for (let i = 0; i < 4; i++) {
        const cell = getTokenCell(color, positions[i], i);
        if (!cell) continue;
        const key = `${cell[0]}-${cell[1]}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({ color, tokenIdx: i, relPos: positions[i] });
      }
    }
    return map;
  }, [gameState, activeColors]);

  // Render background grid cells
  const cellViews = useMemo(() => {
    return BOARD_CELLS.map(({ row, col, type }) => {
      const bg = getCellBg(type);
      const isStar = type === 'safe';
      const isCenter = type === 'center';
      return (
        <View
          key={`c-${row}-${col}`}
          style={{
            position: 'absolute',
            left: col * cellSize,
            top: row * cellSize,
            width: cellSize,
            height: cellSize,
            backgroundColor: bg,
            borderWidth: 0.3,
            borderColor: '#00000015',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isStar && <Text style={{ fontSize: cellSize * 0.5 }}>⭐</Text>}
          {isCenter && <Text style={{ fontSize: cellSize * 0.55 }}>🏠</Text>}
        </View>
      );
    });
  }, [cellSize]);

  // Render home base circles inside home areas
  const homeBaseViews = useMemo(() => {
    const views: React.ReactNode[] = [];
    for (const color of activeColors) {
      for (let i = 0; i < 4; i++) {
        const [r, c] = HOME_BASES[color][i];
        views.push(
          <View
            key={`hb-${color}-${i}`}
            style={{
              position: 'absolute',
              left: c * cellSize + cellSize * 0.1,
              top: r * cellSize + cellSize * 0.1,
              width: cellSize * 0.8,
              height: cellSize * 0.8,
              borderRadius: cellSize * 0.4,
              backgroundColor: '#FFFFFF40',
              borderWidth: 1.5,
              borderColor: '#FFFFFF80',
            }}
          />
        );
      }
    }
    return views;
  }, [activeColors, cellSize]);

  // Render tokens
  const tokenViews = useMemo(() => {
    const views: React.ReactNode[] = [];

    for (const [key, group] of cellTokenMap.entries()) {
      const [row, col] = key.split('-').map(Number);
      const count = group.length;

      group.forEach((token, groupIdx) => {
        const isMovable = token.color === myColor && movableTokens.includes(token.tokenIdx) && !disabled;
        const isMyToken = token.color === myColor;

        let tx = col * cellSize + cellSize / 2;
        let ty = row * cellSize + cellSize / 2;
        let sz: number;

        if (count === 1) {
          sz = cellSize * 0.72;
        } else {
          sz = cellSize * 0.42;
          const offsets = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
          const [ox, oy] = offsets[groupIdx] || [0, 0];
          tx += (ox * cellSize * 0.24);
          ty += (oy * cellSize * 0.24);
        }

        const colorHex = COLOR_HEX[token.color];

        views.push(
          <TouchableOpacity
            key={`tok-${token.color}-${token.tokenIdx}`}
            onPress={() => isMovable ? onTokenPress(token.tokenIdx) : undefined}
            activeOpacity={isMovable ? 0.7 : 1}
            style={{
              position: 'absolute',
              left: tx - sz / 2,
              top: ty - sz / 2,
              width: sz,
              height: sz,
              zIndex: isMovable ? 20 : 10,
            }}
          >
            <View
              style={{
                width: sz,
                height: sz,
                borderRadius: sz / 2,
                backgroundColor: colorHex,
                borderWidth: isMovable ? 2.5 : 1.5,
                borderColor: isMovable ? '#FFFFFF' : '#FFFFFF80',
                shadowColor: isMovable ? '#FFF' : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isMovable ? 0.8 : 0.3,
                shadowRadius: isMovable ? 4 : 2,
                elevation: isMovable ? 8 : 3,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Inner dot for depth */}
              <View
                style={{
                  width: sz * 0.4,
                  height: sz * 0.4,
                  borderRadius: sz * 0.2,
                  backgroundColor: '#FFFFFF40',
                }}
              />
            </View>
            {/* Pulse ring for movable tokens */}
            {isMovable && (
              <View
                style={{
                  position: 'absolute',
                  left: -4,
                  top: -4,
                  width: sz + 8,
                  height: sz + 8,
                  borderRadius: (sz + 8) / 2,
                  borderWidth: 2,
                  borderColor: '#FFD700',
                  opacity: 0.8,
                }}
              />
            )}
          </TouchableOpacity>
        );
      });
    }

    return views;
  }, [cellTokenMap, myColor, movableTokens, disabled, onTokenPress, cellSize]);

  return (
    <View
      style={{
        width: boardSize,
        height: boardSize,
        backgroundColor: '#1E1B4B',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#312E81',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
      }}
    >
      {cellViews}
      {homeBaseViews}
      {tokenViews}
    </View>
  );
}
