# Epic 4: Leaderboard System & Persistence

**Status:** Not Started
**Priority:** P1
**Epic Owner:** Development Team
**Target Sprint:** Sprint 4

---

## Epic Goal

Build persistent leaderboard with JSON file storage, name/email entry form, and ranking display on homepage showing top performers.

## Expanded Goal

Build a persistent leaderboard system that stores player scores in JSON file, displays top 10 players on the homepage, and prompts users to enter their name (and optional email) when they complete a game with a non-zero score. The leaderboard ranks players by total score and highlights the current user's entry if they qualify for top 10.

## Epic Value

The leaderboard system adds competitive motivation and social proof by:
- Creating incentive for users to improve their scores
- Recognizing top performers publicly
- Encouraging repeat gameplay to climb rankings
- Building community through shared competition
- Providing persistence so progress is never lost

This feature significantly increases user engagement and retention.

## Success Criteria

- [ ] Leaderboard displays top 10 players on homepage
- [ ] Players can submit name (required) and email (optional) after game
- [ ] Rankings persist across browser sessions (JSON file storage)
- [ ] Leaderboard sorted by score (highest first)
- [ ] User's entry highlighted if they qualify for top 10
- [ ] Empty state displays when no rankings exist yet
- [ ] Leaderboard refreshes after new score submitted

## Dependencies

**Prerequisites:**
- Epic 1 completed (file storage utilities, routing)
- Epic 2 completed (score tracking, reset button)

**Blocks:**
- None (Epic 5 is independent)

---

## User Stories

### Story 4.1: Create Leaderboard API Endpoints

**Story ID:** AIVH-4.1
**Story Points:** 5
**Priority:** P1

**As a** backend developer,
**I want** API endpoints for reading and writing leaderboard data,
**so that** the frontend can fetch and submit scores persistently.

#### Acceptance Criteria

1. API endpoint GET /api/leaderboard returns JSON array of top 10 players:
   - Each entry: { rank, name, score, roundsPlayed, timestamp }
   - Sorted by score descending (highest first)
2. Endpoint reads from /data/rankings.json
3. Returns empty array if no rankings exist yet
4. API endpoint POST /api/leaderboard accepts JSON body:
   - { name, email (optional), score, roundsPlayed }
5. POST endpoint validates required fields: name (non-empty string, max 50 chars), score (positive integer)
6. POST endpoint appends new entry to rankings.json with timestamp
7. POST endpoint re-sorts rankings after insertion
8. POST endpoint returns updated top 10 leaderboard
9. Unit tests cover: fetch leaderboard, submit score, validation errors, sorting logic
10. Integration test verifies full read/write cycle with file system

#### Technical Notes

- Use fileStorage utilities from Epic 1
- Validation: express-validator or joi
- Sorting: JavaScript .sort() by score descending
- Timestamp: new Date().toISOString()
- Rank calculation: index + 1 after sorting

#### Definition of Done

- Both endpoints implemented and tested
- Validation errors return 400 with clear messages
- Unit and integration tests passing
- API documented (OpenAPI or README)

---

### Story 4.2: Display Leaderboard Widget on Homepage

**Story ID:** AIVH-4.2
**Story Points:** 5
**Priority:** P1

**As a** user,
**I want** to see the top 10 players on the homepage,
**so that** I can compare my performance with others and feel motivated to improve.

#### Acceptance Criteria

1. Leaderboard widget component created and positioned on homepage (top-right or right sidebar)
2. Widget displays header: "Ranking" or "Melhores Jogadores"
3. Widget fetches leaderboard data from GET /api/leaderboard on mount
4. Widget displays top 10 entries in table or list format:
   - Rank (1-10 with medal icons for top 3)
   - Player name
   - Score
5. Widget styled with HackTudo design system (card with border, shadow, clean typography)
6. Loading state shows skeleton or spinner while fetching data
7. Empty state shows message: "Nenhum jogador ainda. Seja o primeiro!"
8. Widget auto-refreshes when user submits new score (or on interval, e.g., every 30s)
9. Widget responsive: full widget on desktop, collapsible or bottom sheet on mobile
10. Widget highlights current user's entry if they qualify for top 10 (different background color)

#### Technical Notes

- Glassmorphic card component for widget
- Medal emojis: 🥇🥈🥉 or SVG icons
- Auto-refresh: Event-driven (after score submit) or polling (30s interval)
- Highlighting: Pass current user's name to component, match and style
- Loading skeleton: Shimmer effect or spinner

#### Definition of Done

- Leaderboard renders on homepage
- Top 3 display medal icons
- Loading and empty states work
- Auto-refresh after score submission
- Responsive on all breakpoints

---

### Story 4.3: Implement Game End and Name Entry Modal

**Story ID:** AIVH-4.3
**Story Points:** 5
**Priority:** P1

**As a** user,
**I want** to enter my name after completing a game with points,
**so that** my score appears on the leaderboard.

#### Acceptance Criteria

1. Modal/dialog component created for name entry
2. Modal triggers when user clicks reset button AND score > 0
3. Modal displays:
   - Congratulatory message: "Parabéns! Você fez X pontos!"
   - Current leaderboard position if qualifying for top 10
   - Form with fields: name (required text input), email (optional email input)
   - "Enviar" button to submit
   - "Jogar Novamente" button to skip leaderboard entry
4. Name field validation: non-empty, max 50 characters
5. Email field validation: valid email format if provided, optional
6. On "Enviar" click:
   - Submit POST /api/leaderboard with { name, email, score, roundsPlayed }
   - Show success message: "Obrigado! Seu score foi registrado."
   - Auto-close modal after 2 seconds and reset game
7. On "Jogar Novamente" click:
   - Skip leaderboard submission
   - Reset game immediately
8. Modal styled with HackTudo design system (overlay, centered card, smooth animation)
9. Modal accessible: keyboard navigation, Escape key closes, focus trap
10. Modal prevents interaction with game interface while open

#### Technical Notes

- Glassmorphic modal component
- Focus trap: focus-trap-react or custom implementation
- Form validation: react-hook-form or custom hooks
- Modal animation: framer-motion fade + scale
- Escape key handler: useEffect with keydown listener

#### Definition of Done

- Modal renders when reset clicked with score > 0
- Form validation working
- Submit and skip flows both functional
- Modal accessible (keyboard, focus trap, Escape)
- Success message displays before auto-close

---

### Story 4.4: Integrate Leaderboard Submission with Game State

**Story ID:** AIVH-4.4
**Story Points:** 3
**Priority:** P1

**As a** developer,
**I want** leaderboard submission integrated into game flow,
**so that** user scores persist correctly and leaderboard updates in real-time.

#### Acceptance Criteria

1. Game state tracks: finalScore, roundsPlayed for leaderboard submission
2. On reset button click (score > 0):
   - Game flow pauses
   - Name entry modal opens with score and rounds data
3. On successful leaderboard submission:
   - Leaderboard widget refreshes with new data
   - User's entry highlighted if in top 10
   - Game state resets (score, rounds, history)
4. On skip leaderboard submission:
   - Game state resets immediately
   - No API call made
5. Leaderboard API errors handled gracefully:
   - Display error message in modal: "Erro ao salvar pontuação. Tente novamente."
   - Allow user to retry submission or skip
6. Optimistic UI update: Leaderboard widget updates immediately with user's score before API confirms
7. Unit tests verify: modal trigger logic, submission flow, skip flow, error handling
8. Integration test verifies: full game → score → submit → leaderboard update cycle
9. State management clean: no memory leaks, proper cleanup on reset
10. User experience smooth: no jarring transitions, clear feedback at each step

#### Technical Notes

- Modal trigger: Check score > 0 in reset handler
- Optimistic update: Add entry to leaderboard state immediately, remove if API fails
- Error handling: Try-catch with user-friendly messages
- State cleanup: Reset all game state after submission/skip
- Event emitter pattern or state update to trigger leaderboard refresh

#### Definition of Done

- Leaderboard submission integrated with game flow
- Optimistic UI updates working
- Error handling graceful
- Integration test passing
- No memory leaks verified

---

## Epic Acceptance Criteria

- [ ] All 4 stories completed and accepted
- [ ] Leaderboard displays and updates on homepage
- [ ] Users can submit scores with name/email
- [ ] Rankings persist in JSON file
- [ ] Top 10 players displayed with medals
- [ ] Empty and populated states both work
- [ ] Error handling graceful and user-friendly

## Technical Architecture Notes

**Data Models:**
```typescript
interface LeaderboardEntry {
  id: string; // UUID
  name: string;
  email?: string;
  score: number;
  roundsPlayed: number;
  timestamp: string; // ISO 8601
  rank?: number; // Calculated on GET
}

interface LeaderboardSubmission {
  name: string;
  email?: string;
  score: number;
  roundsPlayed: number;
}
```

**JSON File Structure (rankings.json):**
```json
[
  {
    "id": "uuid-1",
    "name": "Ana Silva",
    "email": "ana@example.com",
    "score": 180,
    "roundsPlayed": 18,
    "timestamp": "2025-09-30T12:00:00Z"
  },
  ...
]
```

**API Endpoints:**
- GET /api/leaderboard → Returns top 10 with ranks
- POST /api/leaderboard → Submits new score, returns updated top 10

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Concurrent writes corrupting rankings.json | High | Low | Use atomic writes from fileStorage utilities |
| Duplicate names on leaderboard | Low | Medium | Allow duplicates (users can differentiate by score/timestamp) |
| Leaderboard spam/abuse | Medium | Low | Rate limiting (future), CAPTCHA (future), moderation tools |
| Email validation bypassed | Low | Low | Server-side validation with regex, optional field so low impact |

## Related Documents

- [PRD - Epic 4 Section](../prd.md#epic-4-leaderboard-system--persistence)
- [Front-End Specification - Leaderboard Entry Modal](../front-end-spec.md#screen-3-leaderboard-entry-modal)
- [Front-End Specification - Homepage Layout](../front-end-spec.md#screen-1-homepage---rankings)

---

**Epic Created:** 2025-09-30
**Last Updated:** 2025-09-30
**Epic Version:** 1.0
