# HackSense — Product Requirements Document (BMAD v6)

**Version:** 1.1
**Date:** 2026-05-17
**Status:** Active
**Author:** Raphael Bernardo Gonzalez Nunes da Rocha

---

## 1. Executive Summary

HackSense is an interactive web game created for the HackTudo 2025 Festival de Cultura Digital (Rio de Janeiro). Players are shown two images side-by-side — one AI-generated, one human-made — and must identify the AI-generated one. The game tests AI literacy in a gamified format with a public leaderboard and confetti rewards.

---

## 2. Problem Statement

As generative AI image tools become accessible to everyone, distinguishing machine-made images from human artwork is a growing challenge. Most people lack practical exposure to the visual patterns that differentiate the two. HackSense turns this gap into an engaging educational experience at a live cultural festival, with no installation required (runs entirely in the browser).

---

## 3. Goals and Success Metrics

| Goal | Metric |
|------|--------|
| Engage festival attendees | ≥ 100 unique score entries during the festival day |
| Educate on AI image recognition | Players completing ≥ 5 rounds each |
| Run without friction | Zero crashes during the event; game loads in < 3 seconds |
| Simple administration | Organizer can upload a new pair via the admin panel in < 2 minutes |

---

## 4. Scope

### In Scope (v1.0 — shipped)

- Image pair display: two images side-by-side, one AI and one human, randomly positioned each round
- Answer evaluation: client-side (no network round-trip per answer)
- Scoring: +10 points per correct identification of the AI-generated image
- Feedback: "ACERTOU" (green overlay + confetti) / "ERROU" (red overlay)
- Fullscreen image viewer modal triggered by a magnifier button on each image
- Score queue: localStorage-backed retry system so scores are not lost on transient network errors
- End-of-game registration modal: name (required) and email (optional)
- Public leaderboard: top 10 displayed on home page, sorted by score descending
- Admin panel: HTTP Basic Auth protected, allows upload of paired images (AI + human), view all pairs, delete individual images
- Image compression: uploaded images resized to max 1200×1200 px and re-encoded as JPEG q80 via Sharp
- Supabase backend: Postgres for metadata and rankings, Supabase Storage for image files
- Vercel deployment with serverless API functions

### Out of Scope (v1.0)

- Image categories or tagging beyond `ai` / `human`
- Time limits per round
- Social sharing of score
- Multi-language support (Brazilian Portuguese only)
- User accounts or persistent history across sessions

---

## 5. User Stories

### Player

- **US-01:** As a player, I want to see two images side-by-side so I can compare them visually.
- **US-02:** As a player, I want to click the image I think is AI-generated and get immediate feedback.
- **US-03:** As a player, I want confetti and a "ACERTOU" message when I'm right, so the win feels rewarding.
- **US-04:** As a player, I want to see a full-screen version of an image before deciding, so I can analyse small details.
- **US-05:** As a player, I want to enter my name on a leaderboard after the game ends, so I can compare with others.
- **US-06:** As a player, I want to skip the leaderboard entry if I choose, without losing my score flow.

### Administrator (Event Organiser)

- **US-07:** As an admin, I want to upload a pair of images (one AI, one human) via a web form, so I can add new rounds without editing code.
- **US-08:** As an admin, I want to see all uploaded pairs in a grid view, so I can review what is loaded into the game.
- **US-09:** As an admin, I want to delete a specific pair, so I can remove inappropriate or duplicate images.
- **US-10:** As an admin, I want the admin panel to be password-protected, so random festival attendees cannot tamper with content.

---

## 6. Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Display exactly 2 images per round in a side-by-side layout | Must |
| FR-02 | Randomly assign AI/human image to left (A) or right (B) position each round | Must |
| FR-03 | Evaluate the player's click client-side using `isAI` flag loaded at game start | Must |
| FR-04 | Award +10 points on correct answer; 0 on incorrect (no penalty) | Must |
| FR-05 | Display "ACERTOU" green overlay + canvas-confetti on correct; "ERROU" red overlay on incorrect | Must |
| FR-06 | Auto-advance to next pair after 2.5-second feedback window | Must |
| FR-07 | Display round counter (current / total) and score in game header | Must |
| FR-08 | Show registration modal at game end; require name, accept optional email | Must |
| FR-09 | Queue score submission in localStorage, retry every 5 s on failure | Must |
| FR-10 | Display top-10 leaderboard on home page, sorted by score descending | Must |
| FR-11 | Fullscreen image modal on magnifier button click | Should |
| FR-12 | Admin endpoint authenticates via HTTP Basic Auth (env-configurable credentials) | Must |
| FR-13 | Admin upload compresses images to max 1200×1200 px, JPEG q80 | Should |
| FR-14 | Admin panel lists all pairs; allows deletion of individual images | Must |

---

## 7. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | Game loads in < 3 seconds on a typical festival Wi-Fi connection |
| NFR-02 | Works on mobile (responsive layout) and desktop |
| NFR-03 | Supabase anon key and admin credentials must be configurable via environment variables |
| NFR-04 | Vercel Hobby plan compatible (≤ 12 serverless functions) |
| NFR-05 | No data is stored in files on the server (all persistence via Supabase) |

---

## 8. Constraints

- Platform: Vercel Hobby (function count ceiling)
- Language: Brazilian Portuguese for all player-facing copy
- Storage: Supabase free tier limits (500 MB storage, 50 MB DB)
- Event context: one-day game; data retention after the event is a bonus, not a requirement

---

## 9. Open Questions / Future Work

1. Should incorrect answers deduct points? (currently 0 penalty)
2. Admin config panel exists (`api/admin/config/`) but `cachedConfig.maxRounds` is not persisted — should maxRounds be stored in Supabase?
3. Could a post-event analytics view (by-pair accuracy rate) help organisers evaluate which image pairs were hardest?
4. Email collected at registration — what is the data-retention and privacy policy?
