# Deploy to Vercel & Migrate to Supabase

## Goal Description
Since Vercel Serverless Functions do not support persistent WebSockets (which Socket.IO requires), we will migrate the real-time multiplayer functionality to **Supabase Realtime** and use **Supabase PostgreSQL** as our database. This will allow the frontend to be fully hosted on Vercel without a heavy Python backend. Any required server-side logic will be adapted to Vercel Serverless Functions.

## Proposed Changes

### 1. Database & Security Setup
- **Supabase Project:** Initialize a new project.
- **Tables:** Set up tables for persistent data if necessary (e.g., user profiles or match history). However, room state can be largely managed by Supabase Realtime Channels.
- **Environment:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the project's `.env`.

### 2. Frontend Real-Time Migration (Replacing Socket.IO)
- Remove `socket.io-client` from `package.json`.
- Install `@supabase/supabase-js`.
- Refactor `src/hooks/useSocket.js` to use Supabase Realtime (Presence and Broadcast):
  - **Presence:** Track who is currently in the room (handles `join_room`, `leave_room`, and unexpected disconnects).
  - **Broadcast:** Send low-latency messages for game actions (`start_game`, `update_score`, `game_action`, `update_game_state`).

#### [MODIFY] `package.json`
Remove `socket.io-client`, add `@supabase/supabase-js`.

#### [MODIFY] `src/hooks/useSocket.js`
Rewrite the entire hook to maintain the same API (`socket`, `isConnected`, `createRoom`, `joinRoom`, `startGame`, `on`, etc.) but backed by Supabase Channels instead of `io(...)`.

### 3. Backend Deprecation
- The current `backend/main.py` and `backend/multiplayer.py` will no longer be needed for Socket.IO.
- If there are specific server-side calculation endpoints, they will be migrated to Vercel Serverless Functions (`api/index.py` or Node.js functions in `api/`).

#### [DELETE] `backend/main.py`
#### [DELETE] `backend/multiplayer.py`

### 4. Vercel Configuration
- Add a `vercel.json` to handle any routing if needed (e.g., SPA rewrites).
- Update Vite build settings if necessary.

#### [NEW] `vercel.json`

## Verification Plan
### Automated Tests
- Run any existing CI/CD or unit tests.
- Ensure the build command `npm run build` works without errors.

### Manual Verification
- Join a room with two different browsers locally.
- Verify that Supabase Presence correctly syncs player lists.
- Verify game actions occur with low latency via Supabase Broadcast.
- Deploy to Vercel and verify the live URL works correctly.
