import { useReducer, useCallback } from 'react';
import {
  generateDiceRoll,
  getTokenNewPosition,
  findCapturedOpponents,
  isTripComplete,
  getMovableTokenIndexes,
} from './game-logic';
import {
  isPlayerFinished,
  getNextPlayerIndex,
  shouldEndGame,
  computeLeftoverRankOrder,
  PlayerType,
} from './turn-rules';
import { pickBestMove, randomPersonality, Personality } from './bot-ai';

export type GamePhase =
  | 'AWAITING_ROLL'
  | 'ROLLING'
  | 'AWAITING_SELECTION'
  | 'ANIMATING'
  | 'TURN_TRANSITION'
  | 'GAME_ENDED';

export type GameMode = 'offline' | 'ai' | 'online';

export interface PlayerConfig {
  name: string;
  type: PlayerType;
  personality?: Personality;
}

export interface GameState {
  playerTypes: PlayerType[];
  playerNames: string[];
  botPersonalities: (Personality | null)[];
  tokenPositions: (number[] | null)[];
  currentPlayerIndex: number;
  diceRoll: number;
  consecutiveSixes: number;
  movableTokenIndexes: number[];
  playerRanks: number[];
  playerCaptures: number[];
  lastRank: number;
  turnCount: number;
  phase: GamePhase;
  mode: GameMode;
  winnerIndex: number;
  passPhonePrompt: boolean;
}

type Action =
  | { type: 'ROLL_DICE' }
  | { type: 'SELECT_TOKEN'; tokenIndex: number }
  | { type: 'BOT_MOVE'; tokenIndex: number; diceRoll: number }
  | { type: 'DISMISS_PASS_PROMPT' }
  | { type: 'RESTART'; config: PlayerConfig[]; mode: GameMode };

function initTokenPositions(playerTypes: PlayerType[]): (number[] | null)[] {
  return playerTypes.map(t => t ? [-1, -1, -1, -1] : null);
}

function initialState(config: PlayerConfig[], mode: GameMode): GameState {
  const playerTypes = config.map(c => c.type);
  const startIdx = playerTypes.findIndex(t => t === 'PLAYER');
  return {
    playerTypes,
    playerNames: config.map(c => c.name),
    botPersonalities: config.map(c => c.personality ?? null),
    tokenPositions: initTokenPositions(playerTypes),
    currentPlayerIndex: startIdx >= 0 ? startIdx : 0,
    diceRoll: 1,
    consecutiveSixes: 0,
    movableTokenIndexes: [],
    playerRanks: [0, 0, 0, 0],
    playerCaptures: [0, 0, 0, 0],
    lastRank: 0,
    turnCount: 0,
    phase: 'AWAITING_ROLL',
    mode,
    winnerIndex: -1,
    passPhonePrompt: false,
  };
}

function applyTokenMove(state: GameState, playerIndex: number, tokenIndex: number, roll: number): GameState {
  const newPositions = state.tokenPositions.map(p => p ? [...p] : null);
  const oldPos = newPositions[playerIndex]![tokenIndex];
  const newPos = getTokenNewPosition(oldPos, roll);
  newPositions[playerIndex]![tokenIndex] = newPos;

  let captures = 0;
  const capturedList = findCapturedOpponents(playerIndex, newPos, newPositions);
  for (let pi = 0; pi < capturedList.length; pi++) {
    for (const ti of capturedList[pi]) {
      newPositions[pi]![ti] = -1;
      captures++;
    }
  }

  const newCaptures = [...state.playerCaptures];
  newCaptures[playerIndex] += captures;

  const tripComplete = isTripComplete(newPos);
  const gotExtraTurn = roll === 6 || captures > 0 || tripComplete;

  let newRanks = [...state.playerRanks];
  let newLastRank = state.lastRank;
  if (tripComplete && isPlayerFinished(newPositions[playerIndex]!)) {
    newLastRank++;
    newRanks[playerIndex] = newLastRank;
    if (state.winnerIndex === -1) {
      // first to finish = winner
    }
  }

  const gameOver = shouldEndGame(state.playerTypes, newPositions);
  if (gameOver) {
    const leftover = computeLeftoverRankOrder(state.playerTypes, newPositions, newRanks);
    let rank = newLastRank + 1;
    for (const pi of leftover) {
      newRanks[pi] = rank++;
    }
    return {
      ...state,
      tokenPositions: newPositions,
      playerCaptures: newCaptures,
      playerRanks: newRanks,
      lastRank: newLastRank,
      turnCount: state.turnCount + 1,
      phase: 'GAME_ENDED',
      winnerIndex: playerIndex,
      passPhonePrompt: false,
    };
  }

  let nextPlayerIndex = playerIndex;
  let newConsec = state.consecutiveSixes;

  if (gotExtraTurn) {
    if (roll === 6) newConsec++;
    if (newConsec >= 3) {
      newConsec = 0;
      nextPlayerIndex = getNextPlayerIndex(playerIndex, state.playerTypes, newPositions);
    }
  } else {
    newConsec = 0;
    nextPlayerIndex = getNextPlayerIndex(playerIndex, state.playerTypes, newPositions);
  }

  const isOffline = state.mode === 'offline';
  const nextIsHuman = state.playerTypes[nextPlayerIndex] === 'PLAYER';
  const showPassPrompt = isOffline && nextIsHuman && nextPlayerIndex !== playerIndex;

  return {
    ...state,
    tokenPositions: newPositions,
    playerCaptures: newCaptures,
    playerRanks: newRanks,
    lastRank: newLastRank,
    currentPlayerIndex: nextPlayerIndex,
    consecutiveSixes: newConsec,
    movableTokenIndexes: [],
    turnCount: state.turnCount + 1,
    phase: showPassPrompt ? 'TURN_TRANSITION' : 'AWAITING_ROLL',
    passPhonePrompt: showPassPrompt,
  };
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'RESTART':
      return initialState(action.config, action.mode);

    case 'ROLL_DICE': {
      if (state.phase !== 'AWAITING_ROLL') return state;
      const roll = generateDiceRoll();

      if (state.consecutiveSixes >= 2 && roll === 6) {
        const next = getNextPlayerIndex(state.currentPlayerIndex, state.playerTypes, state.tokenPositions);
        const isOffline = state.mode === 'offline';
        const nextIsHuman = state.playerTypes[next] === 'PLAYER';
        const showPass = isOffline && nextIsHuman && next !== state.currentPlayerIndex;
        return {
          ...state,
          diceRoll: roll,
          consecutiveSixes: 0,
          currentPlayerIndex: next,
          movableTokenIndexes: [],
          phase: showPass ? 'TURN_TRANSITION' : 'AWAITING_ROLL',
          passPhonePrompt: showPass,
        };
      }

      const movable = getMovableTokenIndexes(
        state.currentPlayerIndex,
        state.tokenPositions[state.currentPlayerIndex] ?? [],
        roll
      );

      if (movable.length === 0) {
        const next = getNextPlayerIndex(state.currentPlayerIndex, state.playerTypes, state.tokenPositions);
        const isOffline = state.mode === 'offline';
        const nextIsHuman = state.playerTypes[next] === 'PLAYER';
        const showPass = isOffline && nextIsHuman && next !== state.currentPlayerIndex;
        return {
          ...state,
          diceRoll: roll,
          consecutiveSixes: roll === 6 ? state.consecutiveSixes + 1 : 0,
          currentPlayerIndex: next,
          movableTokenIndexes: [],
          phase: showPass ? 'TURN_TRANSITION' : 'AWAITING_ROLL',
          passPhonePrompt: showPass,
        };
      }

      if (movable.length === 1) {
        return applyTokenMove({ ...state, diceRoll: roll }, state.currentPlayerIndex, movable[0], roll);
      }

      return {
        ...state,
        diceRoll: roll,
        consecutiveSixes: roll === 6 ? state.consecutiveSixes + 1 : 0,
        movableTokenIndexes: movable,
        phase: 'AWAITING_SELECTION',
      };
    }

    case 'SELECT_TOKEN': {
      if (state.phase !== 'AWAITING_SELECTION') return state;
      if (!state.movableTokenIndexes.includes(action.tokenIndex)) return state;
      return applyTokenMove(state, state.currentPlayerIndex, action.tokenIndex, state.diceRoll);
    }

    case 'BOT_MOVE': {
      return applyTokenMove(state, state.currentPlayerIndex, action.tokenIndex, action.diceRoll);
    }

    case 'DISMISS_PASS_PROMPT':
      return { ...state, passPhonePrompt: false, phase: 'AWAITING_ROLL' };

    default:
      return state;
  }
}

export function useGameEngine(config: PlayerConfig[], mode: GameMode) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    initialState(config, mode)
  );

  const rollDice = useCallback(() => dispatch({ type: 'ROLL_DICE' }), []);
  const selectToken = useCallback((ti: number) => dispatch({ type: 'SELECT_TOKEN', tokenIndex: ti }), []);
  const dismissPassPrompt = useCallback(() => dispatch({ type: 'DISMISS_PASS_PROMPT' }), []);
  const restart = useCallback((cfg: PlayerConfig[], m: GameMode) =>
    dispatch({ type: 'RESTART', config: cfg, mode: m }), []);

  const triggerBotMove = useCallback(() => {
    if (state.phase !== 'AWAITING_ROLL') return;
    if (state.playerTypes[state.currentPlayerIndex] !== 'BOT') return;
    const roll = generateDiceRoll();
    const personality = state.botPersonalities[state.currentPlayerIndex] ?? 'balanced';
    const tokenIndex = pickBestMove(
      state.currentPlayerIndex,
      roll,
      state.tokenPositions,
      personality
    );
    if (tokenIndex === -1) {
      const next = getNextPlayerIndex(state.currentPlayerIndex, state.playerTypes, state.tokenPositions);
      dispatch({ type: 'DISMISS_PASS_PROMPT' });
      return;
    }
    dispatch({ type: 'BOT_MOVE', tokenIndex, diceRoll: roll });
  }, [state]);

  return { state, rollDice, selectToken, dismissPassPrompt, restart, triggerBotMove };
}
