# Changelog

All notable changes to HackSense are documented here.

## [Unreleased] — 2026-05-17

### Changed
- Supabase URL and anon key now read from `SUPABASE_URL` / `SUPABASE_ANON_KEY` environment variables; hardcoded fallbacks remain for backward compatibility but `.env.example` documents the expected vars
- Admin HTTP Basic Auth credentials now read from `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars; hardcoded defaults kept as fallback
- Email validation in `/api/score` uses a proper format regex instead of a bare `includes('@')` check

### Added
- `.env.example` listing all environment variables required to run the project locally or on Vercel
- `PENDING.md` — prioritized list of known technical debt and upcoming work
- `CHANGELOG.md` — this file

### Removed
- External tool attribution link from README.md footer

---

## [1.0.0] — 2025-09-30 → 2025-10-01

### Added
- React 18.3 + Vite 5.4 frontend with HackTudo glassmorphism visual identity
- Express.js backend with Multer image upload and Sharp compression
- Supabase backend: Postgres for image metadata and rankings, Supabase Storage for compressed JPEG images
- Admin panel (`/admin`) protected by HTTP Basic Auth for pair upload and deletion
- Game loop: loads all pairs at start via `/api/game-data`, evaluates answers client-side (no round-trip per answer)
- Score queue with `localStorage` persistence and background retry on reconnect
- Leaderboard (top 10 public, all results for admin with email)
- Canvas Confetti on correct answers
- Fullscreen image viewer modal with close button
- Vercel serverless deployment with rewrites for `/admin` and `/admin-login`
- Vercel Analytics integration
