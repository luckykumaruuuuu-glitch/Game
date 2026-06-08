# LeLudo — Ludo Social Gaming Platform

A mobile social networking and gaming app centered around Ludo. Users can sign up, add friends via QR codes, chat in real-time, and play Ludo online or against AI opponents.

## Run & Operate

- **Mobile App** (port 5000) — `bash artifacts/mobile/scripts/start-dev.sh`
- **API Server** (port 8000) — `pnpm --filter @workspace/api-server run dev`
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned by Replit)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **Mobile**: Expo SDK 54 / React Native 0.81, expo-router
- **API**: Express 5, pnpm workspace package `@workspace/api-server`
- **DB**: PostgreSQL + Drizzle ORM (`@workspace/db`)
- **Auth & Realtime**: Firebase (Auth, Firestore, Storage) — appropriate for React Native mobile
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- **Build**: esbuild (ESM bundle for API server)

## Where things live

- `artifacts/mobile/` — Expo/React Native app
- `artifacts/mobile/lib/firebase.ts` — Firebase app init
- `artifacts/mobile/lib/firestore.ts` — all Firestore data access (users, friends, chat, notifications)
- `artifacts/mobile/context/AuthContext.tsx` — Firebase Auth context
- `artifacts/api-server/src/` — Express API server
- `lib/db/src/schema/` — Drizzle schema (source of truth for PostgreSQL tables)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `scripts/setup.sh` — auto-run before every workflow; installs deps + fixes Metro symlink
- `scripts/post-merge.sh` — runs after task merges; installs deps + pushes DB schema

## Architecture decisions

- Firebase is intentionally used for the mobile app's auth and realtime data (Firestore). Replit Auth is web-only and cannot be used in React Native. Firebase client keys are public by design.
- The Express API server handles server-side logic that requires PostgreSQL (Drizzle ORM). Firebase handles the social/realtime layer (presence, chat, friend requests).
- pnpm workspaces monorepo: shared types/schemas live in `lib/`, apps in `artifacts/`.
- API types are generated from OpenAPI spec via Orval — never edit `lib/api-zod` or `lib/api-client-react` directly.
- Metro needs a `.pnpm` symlink inside `artifacts/mobile/node_modules/` — the setup script recreates it after every `pnpm install`.

## Product

- **Ludo Game**: offline play vs AI opponents (balanced, aggressive, defensive, rusher) and online play with friends
- **Social**: QR code-based friend discovery and requests, friend management
- **Chat**: real-time 1:1 messaging with typing indicators, read receipts, and message deletion
- **Presence**: real-time online/offline status for friends
- **Notifications**: in-app notifications for friend requests, messages, game invites

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/db run push` after schema changes.
- Run `pnpm --filter @workspace/api-spec run codegen` after editing `openapi.yaml`.
- The Metro `.pnpm` symlink in `artifacts/mobile/node_modules/` is wiped by `pnpm install` and must be recreated — `scripts/setup.sh` handles this automatically.
- API server health endpoint is at `GET /api/healthz` (not `/api/health`).
- API server runs on port 8000, mobile Expo dev server on port 5000.
