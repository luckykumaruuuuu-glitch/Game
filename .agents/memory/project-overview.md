---
name: Project overview
description: What this project is and key architectural decisions made during migration.
---

# Ludo Gaming App

A multiplayer Ludo board game with social features (chat, friends, online presence).

## Stack
- **Mobile**: React Native / Expo (SDK 54), TypeScript, NativeWind, Expo Router
- **API**: Node.js 24 / Express 5, TypeScript, esbuild, port 8000
- **DB**: Replit PostgreSQL via Drizzle ORM (schema is currently empty — all game/social data lives in Firebase Firestore)
- **Auth & Real-time**: Firebase Auth + Firestore (chat, friends, presence)
- **Game engine**: Vanilla JS bundled into a single HTML file, loaded via WebView in the mobile app

## Key decision: keep Firebase
Firebase Auth and Firestore are load-bearing — they power real-time chat, friend requests, and presence tracking. Replacing them with Replit Auth would break core functionality. The Firebase client config keys in `artifacts/mobile/lib/firebase.ts` are public-facing by design (standard Firebase pattern).

## Workflows
- `Mobile App`: starts Expo web on port 5000 (preview pane shows web build)
- `API Server`: starts Express on port 8000

## How it runs
```
pnpm --filter @workspace/api-server run dev   # API
pnpm --filter @workspace/mobile run dev        # Mobile/Expo
pnpm --filter @workspace/db run push           # DB schema sync
pnpm --filter @workspace/api-spec run codegen  # Regenerate API hooks
```
