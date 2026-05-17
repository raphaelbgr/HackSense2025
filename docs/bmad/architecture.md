# HackSense — Architecture Document (BMAD v6)

**Version:** 1.1
**Date:** 2026-05-17
**Status:** Active
**Author:** Raphael Bernardo Gonzalez Nunes da Rocha

---

## 1. System Overview

HackSense follows a **serverless-first** architecture deployed on Vercel. The frontend is a React 18 SPA bundled by Vite; the backend consists of individual Node.js ES module functions under `api/`. All state is external: Supabase Postgres (metadata + rankings) and Supabase Storage (image files).

```
Browser (React SPA)
     │
     ├─ GET /dist/index.html ──────────────────── Vercel CDN
     │
     ├─ GET /api/game-data ───────────────────── Vercel Serverless (api/game-data.js)
     │        └─ Supabase REST (images table)
     │
     ├─ POST /api/score ──────────────────────── Vercel Serverless (api/score.js)
     │        └─ Supabase REST (rankings table)
     │
     ├─ GET  /api/rankings ───────────────────── Vercel Serverless (api/rankings.js)
     │        └─ Supabase REST (rankings table)
     │
     └─ /api/admin/* (Basic Auth) ────────────── Vercel Serverless
              ├─ pairs.js → Supabase REST (images)
              └─ upload/pair.js → Sharp → Supabase Storage + images table
```

---

## 2. Component Inventory

### Frontend (`src/`)

| Component | File | Responsibility |
|-----------|------|----------------|
| App | `src/App.jsx` | View-state machine: `home` → `game` → `registration`. Owns rankings state and reloads after score submission. |
| Home | `src/components/Home.jsx` | Landing screen: logo, "Começar Jogo" button, leaderboard. Receives `rankings` prop from App. |
| Game | `src/components/Game-optimized.jsx` | Fetches all pairs at start. Renders current pair. Evaluates answer client-side. Triggers confetti. Calls `onGameEnd(score)` on last round. |
| RegistrationModal | `src/components/RegistrationModal.jsx` | Name + email form. Validates locally. Calls `onSubmit(name, email)` which routes to `scoreQueue.addScore()`. |
| scoreQueue | `src/utils/scoreQueue.js` | Singleton. Persists pending scores in `localStorage`. Background `setInterval` flushes via `POST /api/score`. Also flushes on `window.online`. |

### Backend (`api/`)

| File | Method | Path | Purpose |
|------|--------|------|---------|
| `game-data.js` | GET | `/api/game-data` | Returns all image pairs from Supabase, grouped by `pair_id`, with positions randomised and `isAI` flags set. Truncates to `maxRounds`. |
| `rankings.js` | GET | `/api/rankings` | Returns top-10 scores (name, score, date) publicly. With `?all=true` returns all rows including email (admin use). |
| `score.js` | POST | `/api/score` | Validates name (required), score (number), email (optional, regex). Inserts into Supabase `rankings` table. |
| `admin/_middleware.js` | — | — | HTTP Basic Auth guard. Reads `ADMIN_USERNAME`/`ADMIN_PASSWORD` from env. |
| `admin/pairs.js` | GET | `/api/admin/pairs` | Lists all AI+human image pairs from Supabase. |
| `admin/upload/pair.js` | POST | `/api/admin/upload/pair` | Receives `aiImage` + `humanImage` via multipart. Runs Sharp compression. Uploads to Supabase Storage. Inserts metadata. |

### Shared Library

| File | Exports | Notes |
|------|---------|-------|
| `supabase-direct.js` | `getImages`, `addImage`, `deleteImage`, `getRankings`, `addRanking`, `uploadImageToStorage`, `deleteStorageImage` | Direct REST calls to Supabase (no SDK). Reads `SUPABASE_URL` and `SUPABASE_ANON_KEY` from env. 5-second AbortController timeout on reads. |

---

## 3. Data Models

### `images` table (Supabase Postgres)

| Column | Type | Notes |
|--------|------|-------|
| `id` | text PK | `Date.now() + random string` |
| `file` | text | Storage path (`ai/timestamp-random.jpg`) |
| `url` | text | Public Supabase Storage URL |
| `type` | text | `'ai'` or `'human'` |
| `pair_id` | bigint | Unix timestamp at upload; pairs AI+human images |
| `cache_version` | int | Appended to URL as `?v=N` to bust CDN cache |
| `created_at` | timestamptz | Auto-set by Supabase |

### `rankings` table (Supabase Postgres)

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigserial PK | Auto-increment |
| `name` | text | Trimmed, max 50 chars |
| `email` | text nullable | Trimmed, max 100 chars |
| `score` | integer | Total points (multiples of 10) |
| `date` | text | ISO date string (`YYYY-MM-DD`) |

---

## 4. Key Design Decisions

### 4.1 Client-side answer evaluation

All image pairs (with `isAI` flags) are downloaded once at game start via `/api/game-data`. Answers are evaluated locally — no API call per round. This eliminates latency and avoids rate limiting under festival Wi-Fi load. Trade-off: a determined player could inspect the JS bundle to see which image is AI. Acceptable for a casual festival game.

### 4.2 Score queue with localStorage persistence

The `ScoreQueue` class persists pending POSTs to `/api/score` in `localStorage` and retries every 5 seconds. This means a player's score is not lost if the network blips at the exact moment they submit. The queue also flushes on `window.online` event.

### 4.3 Supabase direct REST instead of SDK

`supabase-direct.js` uses raw `fetch` calls against the Supabase REST API rather than `@supabase/supabase-js`. This avoids the SDK's dependency weight and keeps the serverless function cold-start time minimal. The SDK is listed in `package.json` but is not used in the current codebase.

### 4.4 Sharp compression on upload

Uploaded images are resized to max 1200×1200 px and re-encoded as JPEG q80 progressive before being stored. This keeps Supabase Storage usage low and ensures consistent image sizes across the game.

### 4.5 Vercel Hobby plan constraint

The Hobby plan limits the number of serverless functions. The project uses rewrites (not serverless) for `/admin` and `/admin-login` HTML pages, keeping function count within the plan limit.

---

## 5. Security Considerations

| Area | Current approach | Risk |
|------|-----------------|------|
| Admin auth | HTTP Basic Auth over HTTPS (Vercel handles TLS) | Credentials travel in Base64 on every request; acceptable for an event-day tool |
| Supabase key | Anon key in env vars (was previously hardcoded) | Anon key is public by design (RLS should restrict writes) |
| Admin credentials | Env vars `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Default fallback values remain in code for local dev |
| Email storage | Optional, stored in Supabase | LGPD applicability should be reviewed for Brazilian data |
| CORS | Wildcard `*` on `/api/` routes in `vercel.json` | Acceptable for a public read API; admin routes are protected by Basic Auth |

---

## 6. Deployment

```
Local dev:   npm run dev
             → node server-dev.js (Vite dev middleware + Express API proxy)
             → http://localhost:4111

Production:  npm run build (Vite → dist/)
             → Vercel deploys dist/ as static, api/ as serverless functions
             → Rewrites: /admin → /admin.html, /admin-login → /admin-login.html
```

**Required Vercel environment variables:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `ADMIN_USERNAME` (optional — defaults to `hacksense2025`)
- `ADMIN_PASSWORD` (optional — defaults to `HackSense2025!`)

---

## 7. Testing

No automated test suite is present. Manual tests were written as standalone scripts:
- `test-feedback.mjs` — exercises feedback rendering
- `test-game.mjs` — exercises game data loading

Recommended additions:
1. Unit test for `scoreQueue.js` (add/flush/retry logic)
2. Unit test for `supabase-direct.js` (mock fetch, verify headers and URL construction)
3. Integration test for `/api/game-data` (mock Supabase response, assert pair structure)
