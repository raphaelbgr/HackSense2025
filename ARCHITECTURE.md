# HackSense — Architecture Overview

## Summary

HackSense is a full-stack web application deployed to Vercel. The frontend is a React SPA built with Vite. The backend is a set of Vercel serverless functions under `api/`. Persistent data (image metadata, rankings) lives in Supabase Postgres; images are stored in Supabase Storage as compressed JPEGs.

---

## Module Map

```
HackSense/
├── src/                        # React frontend (Vite build target)
│   ├── App.jsx                 # Root component, view state machine (home / game / registration)
│   ├── App.css                 # Global styles, glassmorphism variables
│   ├── main.jsx                # Vite entry point — mounts <App /> + Vercel Analytics
│   └── components/
│       ├── Home.jsx            # Landing page: logo, start button, leaderboard
│       ├── Home.css
│       ├── Game-optimized.jsx  # Game screen: loads all pairs at start, evaluates answers client-side
│       ├── Game.css
│       ├── RegistrationModal.jsx  # End-of-game name/email form, queues score submission
│       └── RegistrationModal.css
│   └── utils/
│       └── scoreQueue.js       # localStorage-backed retry queue for /api/score POSTs
│
├── api/                        # Vercel serverless functions (Node.js ESM)
│   ├── game-data.js            # GET /api/game-data — returns all shuffled pairs with isAI flags
│   ├── rankings.js             # GET /api/rankings[?all=true] — top-10 public / all+email for admin
│   ├── score.js                # POST /api/score — validates and persists a score entry
│   └── admin/
│       ├── _middleware.js      # HTTP Basic Auth guard (env ADMIN_USERNAME/ADMIN_PASSWORD)
│       ├── pairs.js            # GET /api/admin/pairs — lists all image pairs
│       └── upload/
│           └── pair.js         # POST /api/admin/upload/pair — multer + sharp compress + Supabase upload
│
├── supabase-direct.js          # Supabase REST client (no SDK) — getImages, addImage, deleteImage,
│                               #   getRankings, addRanking, uploadImageToStorage, deleteStorageImage
│
├── server.js                   # Express server used for local development (mirrors serverless API)
├── server-dev.js               # Dev-only server (Vite dev middleware + Express API)
│
├── public/                     # Static assets served by Vercel
│   ├── admin.html              # Admin panel SPA (vanilla JS)
│   ├── admin-login.html        # HTTP Basic Auth challenge page
│   └── hacktudo-logo.svg
│
├── vite.config.js              # Vite build config: React plugin, /api proxy to local Express
└── vercel.json                 # Vercel routing: rewrites /admin → /admin.html, function memory config
```

---

## Data Flow

### Game Start
1. Browser loads React SPA from Vercel CDN (`/dist/index.html`).
2. User clicks "Começar Jogo" → `App.jsx` sets view to `game`.
3. `Game-optimized.jsx` fetches `GET /api/game-data` once.
4. `api/game-data.js` queries Supabase Postgres for all rows in `images`, groups by `pair_id`, randomly assigns A/B positions and `isAI` flag, shuffles, returns up to `maxRounds` pairs.
5. Game renders pairs from local state — no further API calls per round.

### Answer Evaluation
- Client-side: `selectedImage.isAI === true` → correct (+10 points).
- No round-trip to server for answer checking (latency-free).

### Score Submission
1. Game ends → `RegistrationModal` shown.
2. On submit: `scoreQueue.addScore(name, email, score)` pushes to `localStorage` queue.
3. Background worker flushes `POST /api/score` every 5s with retry on failure/network error.
4. `api/score.js` validates input, calls `addRanking()` → inserts into Supabase `rankings` table.

### Admin Image Upload
1. Admin logs in via HTTP Basic Auth (`api/admin/_middleware.js`).
2. `POST /api/admin/upload/pair` receives `aiImage` + `humanImage` via multipart (Multer).
3. Sharp resizes both to max 1200×1200 px, re-encodes as JPEG q80 progressive.
4. Compressed buffers uploaded to Supabase Storage under `HackSense2025/ai/` and `HackSense2025/human/`.
5. Metadata (id, file path, public URL, type, pair_id) inserted into Supabase `images` table.

---

## External Services

| Service | Role | SDK |
|---------|------|-----|
| Supabase Postgres | Image metadata, rankings | Direct REST (`supabase-direct.js`) |
| Supabase Storage | Compressed JPEG images | Direct REST (fetch) |
| Vercel | Hosting, CDN, serverless runtime | `vercel.json` |
| Vercel Analytics | Page-view tracking | `@vercel/analytics/react` |

---

## Design System

- **Theme:** Glassmorphism (backdrop-filter blur, semi-transparent panels)
- **Palette:** Dark purple `#17112d` bg, orange `#ed752f` primary, yellow `#f9bb37`, green `#5dbf4a`, red `#d94141`
- **Typography:** Rubik (Google Fonts)
- **Animations:** Canvas Confetti on correct answers, CSS transitions for feedback overlays

---

## Deployment

- **Platform:** Vercel Hobby (limited serverless function count)
- **Build:** `npm run build` → Vite outputs to `dist/`
- **Rewrites:** `/admin` → `/admin.html`, `/admin-login` → `/admin-login.html`
- **Function config:** 1024 MB memory, 10s max duration for all `api/**/*.js`
