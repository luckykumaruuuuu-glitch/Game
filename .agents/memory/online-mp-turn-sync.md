---
name: Online multiplayer turn sync & board effects fix
description: Root causes and fixes for turn flickering, missing board effects, and laggy transitions in online friend mode.
---

## Root Causes Found

### 1. `_setTurnPlayer` fired mid-animation (main cause)
- Firebase snapshot → `subscribeToGameRoom` injects `_applyRemoteAction` at T+50ms AND `_setTurnPlayer` at T+80ms
- `_setTurnPlayer` called `moveDice()` + `updateCornerWidgets()` DURING the running animation → visual jitter, cut-short effects

### 2. Double Firebase write → flicker loop
- Actor A: TURN_ADVANCED → `mpTurn` → `writeCurrentTurn` [write #1]
- Firebase snapshot on B → `_setTurnPlayer` → posted `mpTurn` (not `mpTurnSync`) → B also called `writeCurrentTurn` [write #2]
- 2nd snapshot → 2nd `_setTurnPlayer` → flickering A→B→A→B

### 3. ROLL_DICE + SELECT_TOKEN animation race
- Both actions injected within 50ms of each other (no sequencing)
- SELECT_TOKEN forced `state.phase = AWAITING_SELECTION` during dice animation → dice animation cut short

## Fixes Applied

### `ludo-html.ts` — `_setTurnPlayer`
- Added `if (_mp.applyingRemote) return;` guard — skip during running animation
- Changed postMessage from `mpTurn` → `mpTurnSync` — prevents Firebase double-write

### `ludo-html.ts` — `_applyRemoteAction`
- Both ROLL_DICE and SELECT_TOKEN now post `mpActionDone` when animation `.then()` resolves
- Also posts `mpActionDone` in the fallback (synchronous) path

### `LudoContext.tsx` — Action queue
- `remoteActionQueueRef`: sequential FIFO queue for remote actions
- `drainRemoteActionQueue()`: injects one action, sets 12s safety timer
- `enqueueRemoteAction()`: pushes to queue, starts drain if idle
- `mpActionDone` handler: clears safety timer, drains next action after 80ms gap
- `activateMpConfig`: resets queue on session start

### `LudoContext.tsx` — `subscribeToGameRoom`
- Computes `hasPendingAction` before turn sync check
- Skips `_setTurnPlayer` injection if a new action is about to be relayed (action's TURN_ADVANCED handles turn naturally)
- Always updates `lastKnownTurnRef` immediately to prevent re-injection for same value
- Uses `enqueueRemoteAction` instead of direct `setTimeout` injection

### `LudoContext.tsx` — `onMessage`
- `mpTurnSync`: updates `lastKnownTurnRef` + `setDebugTurn` only — NO Firebase write
- `mpActionDone`: drains next queued action
- `mpTurn`: unchanged — only actor fires this (subscriber blocked by `applyingRemote`), writes Firebase

**Why:** The non-actor device must never write `writeCurrentTurn` (causes double-write flicker). Only the actor's TURN_ADVANCED event (unblocked) writes it.
