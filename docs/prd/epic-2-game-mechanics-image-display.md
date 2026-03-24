# Epic 2: Game Mechanics & Image Display

**Status:** Not Started
**Priority:** P0 (Highest)
**Epic Owner:** Development Team
**Target Sprint:** Sprint 2

---

## Epic Goal

Implement core game functionality allowing users to select between two images, receive immediate feedback, track score, and load new image pairs continuously.

## Expanded Goal

Build the core game functionality where users select between two side-by-side images to identify which is AI-generated. Implement image loading from the repository, random pair selection, click handlers, immediate visual feedback animations ("Acertou!" and "Errou!"), score tracking, and automatic progression to next image pair. This epic delivers a playable game loop.

## Epic Value

This epic delivers the core user experience and primary value proposition of the application. It enables users to:
- Test their ability to distinguish AI-generated from human-created images
- Receive immediate, engaging feedback on their selections
- Track their performance with a scoring system
- Experience continuous gameplay with automatic progression

Without this epic, the application has no playable functionality.

## Success Criteria

- [ ] Users can view and select between two side-by-side images
- [ ] Correct selections trigger "Acertou!" animation and award 10 points
- [ ] Incorrect selections trigger "Errou!" animation with no points awarded
- [ ] Score displays prominently and updates in real-time
- [ ] New image pairs load automatically after feedback animation
- [ ] Reset button clears score and starts fresh game session
- [ ] All animations smooth (60fps) and accessible (respect prefers-reduced-motion)

## Dependencies

**Prerequisites:**
- Epic 1 completed (routing, design system, base layout)
- Images uploaded to repository (minimum 4: 2 AI, 2 Human) - can use seed images for testing
- Front-end spec animation guidelines (docs/front-end-spec.md)

**Blocks:**
- Epic 3 (history panel requires game state from this epic)
- Epic 4 (leaderboard submission requires score from this epic)

---

## User Stories

### Story 2.1: Create Image Repository API Endpoints

**Story ID:** AIVH-2.1
**Story Points:** 5
**Priority:** P0

**As a** frontend developer,
**I want** backend API endpoints to fetch random image pairs,
**so that** I can display images in the game interface.

#### Acceptance Criteria

1. API endpoint GET /api/game/pair returns JSON with random image pair:
   - `imageA`: { id, url, type (hidden from response), description }
   - `imageB`: { id, url, type (hidden from response), description }
   - One image is AI-generated, one is human-created
   - Left/right position randomized
2. Endpoint reads from /data/image-metadata.json to get available images
3. Endpoint validates sufficient images exist (minimum 2 AI, 2 Human)
4. Returns 503 error if insufficient images with Portuguese error message
5. Image URLs served from /public/images/{ai|human}/ directories
6. Endpoint ensures same pair not returned twice in succession (session tracking or query param)
7. API endpoint POST /api/game/verify accepts JSON body: { selectedImageId, pairId }
8. Verify endpoint returns JSON: { correct: boolean, selectedType: string, score: number }
9. Unit tests cover: successful pair generation, insufficient images error, verify logic
10. Integration test verifies full request/response cycle

#### Technical Notes

- Random selection: Fisher-Yates shuffle or simple Math.random()
- Session tracking: Use session middleware or query param approach
- Verify endpoint: Compare selectedImageId against stored pair data
- Error handling: Return 503 for insufficient images, 400 for invalid requests

#### Definition of Done

- Endpoints implemented and tested
- Unit tests passing
- Integration tests passing
- API documentation added (OpenAPI/Swagger or README)

---

### Story 2.2: Build Game Interface Layout with Image Display

**Story ID:** AIVH-2.2
**Story Points:** 5
**Priority:** P0

**As a** user,
**I want** to see two large images side-by-side on the homepage,
**so that** I can compare them and make my selection.

#### Acceptance Criteria

1. Homepage layout displays two images side-by-side in center of screen
2. Images sized responsively:
   - Desktop: ~600px width each with gap between
   - Tablet: ~400px width each
   - Mobile: stacked vertically, full width minus padding
3. Each image rendered in card/container with subtle border and shadow (HackTudo style)
4. Images maintain aspect ratio with object-fit: cover
5. Loading state displays skeleton or spinner while fetching images
6. Image descriptions display below each image (small italic text) if present
7. Error state displays friendly message if images fail to load
8. Images fetched from GET /api/game/pair on component mount
9. Image alt text populated from description or default "Imagem do jogo"
10. Layout maintains HackTudo design system (colors, spacing, typography)

#### Technical Notes

- Use glassmorphic card component from design system
- Fetch images on mount using useEffect
- Loading state: Skeleton component or spinner
- Error boundary for image load failures
- Responsive layout: CSS Grid or Flexbox

#### Definition of Done

- Images render correctly on all breakpoints
- Loading and error states implemented
- Glassmorphic styling matches front-end spec
- Accessible (alt text, keyboard focus)

---

### Story 2.3: Implement Image Selection and Feedback Animation

**Story ID:** AIVH-2.3
**Story Points:** 8
**Priority:** P0

**As a** user,
**I want** to click on an image to make my selection and immediately see visual feedback,
**so that** I know whether I correctly identified the AI-generated image.

#### Acceptance Criteria

1. Click/tap handler attached to each image
2. On click, selection sent to POST /api/game/verify endpoint
3. During API call, both images disabled (no further clicks, cursor: wait)
4. On correct answer:
   - Selected image highlights with green border/glow
   - "Acertou!" text appears with celebration animation
   - Confetti or particle effect displays briefly
   - Success sound plays (optional, with user preference for mute)
5. On incorrect answer:
   - Selected image highlights with red border/shake animation
   - "Errou!" text appears with sad emoji or dimming effect
   - Correct image highlighted with subtle green indicator
6. Animation completes within 2-3 seconds total
7. After animation completes, new image pair automatically loads
8. Animations use framer-motion or CSS animations matching HackTudo timing (0.2s-0.4s)
9. Animations respect prefers-reduced-motion for accessibility
10. Selection flow feels smooth and responsive without lag

#### Technical Notes

- Use framer-motion for React animations
- Confetti library: canvas-confetti or react-confetti
- Animation sequence: selection → API call → feedback overlay → auto-next
- State machine: ready → selecting → animating → ready
- Prefers-reduced-motion: Disable confetti, reduce animation duration by 50%

#### Definition of Done

- Acertou! and Errou! animations implemented
- Confetti effect working (with reduced-motion support)
- Animations smooth at 60fps
- Auto-progression to next pair after animation
- All animations respect accessibility preferences

---

### Story 2.4: Implement Score Tracking and Display

**Story ID:** AIVH-2.4
**Story Points:** 3
**Priority:** P0

**As a** user,
**I want** to see my current score update in real-time as I play,
**so that** I can track my progress and performance.

#### Acceptance Criteria

1. Score display component created and positioned in top-right corner
2. Score initializes at 0 when game starts
3. Score increments by 10 points on correct answer with animated count-up
4. Score remains unchanged on incorrect answer (no penalty)
5. Score persists in React state (Context API or Zustand) across image pairs
6. Score animation uses smooth transition (e.g., counting from previous to new value)
7. Score display styled with HackTudo design system (large, bold, prominent)
8. Current round number displayed alongside score (e.g., "Rodada 5 | Pontos: 40")
9. Score resets to 0 when reset button clicked (Story 2.5)
10. Score component responsive: smaller on mobile, larger on desktop

#### Technical Notes

- State management: React Context API or Zustand
- Score animation: react-countup or custom hook
- State structure: { score: number, roundNumber: number }
- Glass card component for score display

#### Definition of Done

- Score displays and updates correctly
- Count-up animation implemented
- Round counter increments on each pair
- Responsive styling verified

---

### Story 2.5: Add Reset Button with Session Clear

**Story ID:** AIVH-2.5
**Story Points:** 3
**Priority:** P0

**As a** user,
**I want** a reset button to start a new game session,
**so that** I can clear my score and history and play again.

#### Acceptance Criteria

1. Reset button displayed in bottom-right corner with HackTudo button styling
2. Button labeled "Reiniciar" or "Novo Jogo" in Portuguese
3. Button shows confirmation dialog: "Tem certeza? Seu progresso será perdido." with "Sim" and "Cancelar" options
4. On confirmation:
   - Score resets to 0
   - Round counter resets to 1
   - History panel clears (Story 3.x)
   - New image pair loads
5. Reset does not trigger leaderboard entry if score is 0
6. Reset button styled with hover and active states
7. Button accessible via keyboard (tab, enter)
8. Button positioned fixed or absolute in bottom-right, visible at all times
9. Button responsive: smaller on mobile, standard size on desktop
10. Confirmation dialog uses HackTudo modal styling

#### Technical Notes

- Floating button component (fixed positioning)
- Confirmation modal: reusable modal component
- Reset action: dispatch resetGame() action to state
- Glassmorphic button styling

#### Definition of Done

- Reset button renders and functions correctly
- Confirmation dialog prevents accidental resets
- All game state clears on reset
- New image pair loads after reset

---

## Epic Acceptance Criteria

- [ ] All 5 stories completed and accepted
- [ ] Core game loop functional: select image → feedback → new pair
- [ ] Score tracking accurate and visible
- [ ] Animations smooth and accessible
- [ ] Reset button clears session and restarts game
- [ ] Game tested on all target devices (desktop, tablet, mobile)

## Technical Architecture Notes

**State Management:**
```typescript
interface GameState {
  score: number;
  roundNumber: number;
  currentPair: ImagePair | null;
  isAnimating: boolean;
  gameStatus: 'ready' | 'selecting' | 'animating';
}
```

**API Endpoints:**
- GET /api/game/pair → Returns random image pair
- POST /api/game/verify → Verifies user selection

**Animation Timing:**
- Click → API call: 100-200ms
- Feedback animation: 2-3 seconds
- Auto-load next pair: Immediately after animation

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Animation performance issues on low-end devices | Medium | Medium | Test on various devices, use GPU-accelerated properties |
| Insufficient seed images for testing | High | Low | Create seed image set (4-8 images) for development |
| API latency causes poor UX | Medium | Low | Implement optimistic UI, preload next pair |
| Confetti library bundle size | Low | Low | Use lightweight library, code-split if needed |

## Related Documents

- [PRD - Product Requirements Document](../prd.md)
- [Front-End Specification - Animation Section](../front-end-spec.md#animation--micro-interactions)
- [Front-End Specification - Game Interface Layout](../front-end-spec.md#screen-2-play-page---game-interface)

---

**Epic Created:** 2025-09-30
**Last Updated:** 2025-09-30
**Epic Version:** 1.0
