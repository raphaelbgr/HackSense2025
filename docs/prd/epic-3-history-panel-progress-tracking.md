# Epic 3: History Panel & User Progress Tracking

**Status:** Not Started
**Priority:** P1
**Epic Owner:** Development Team
**Target Sprint:** Sprint 3

---

## Epic Goal

Create session-based history panel showing user's selection history with thumbnails and results, providing visual feedback on gameplay progression.

## Expanded Goal

Create a left sidebar panel that displays the user's selection history for the current game session. Each history entry shows thumbnails of both images, which image was selected, and whether the choice was correct or incorrect. This provides users with visual feedback on their gameplay progression and allows them to review past decisions.

## Epic Value

The history panel enhances user engagement by:
- Providing visual progress tracking throughout the game session
- Allowing users to review and learn from past decisions
- Creating a sense of accumulation and achievement
- Supporting reflection on performance patterns

This feature increases retention and helps users improve their AI detection skills over time.

## Success Criteria

- [ ] History panel displays on left side of screen (desktop) or as drawer (mobile)
- [ ] Each round's selection history entry shows both image thumbnails
- [ ] Selected image clearly indicated with border/overlay
- [ ] Correct/incorrect result shown with visual badge (✓/✗)
- [ ] History scrollable when entries exceed viewport height
- [ ] History clears when reset button clicked
- [ ] Empty state message displayed when no history yet

## Dependencies

**Prerequisites:**
- Epic 1 completed (base layout, routing)
- Epic 2 completed (game state, score tracking)

**Blocks:**
- None (Epic 4 and 5 are independent)

---

## User Stories

### Story 3.1: Design and Implement History Panel Layout

**Story ID:** AIVH-3.1
**Story Points:** 5
**Priority:** P1

**As a** user,
**I want** a panel on the left side of the screen showing my selection history,
**so that** I can review my past choices and see my progression.

#### Acceptance Criteria

1. History panel rendered as left sidebar on desktop (fixed or absolute positioning)
2. Panel width: ~250-300px on desktop, collapsible drawer on mobile
3. Panel includes header: "Histórico" with running score display
4. Panel scrollable when history entries exceed viewport height
5. Panel styled with HackTudo design system (background, borders, shadows)
6. On mobile: History panel accessible via slide-out drawer with hamburger icon
7. Panel maintains visibility during gameplay (doesn't interfere with image selection)
8. Empty state displays message: "Nenhuma seleção ainda. Comece a jogar!"
9. Panel responsive: full-height sidebar on desktop, bottom sheet or drawer on mobile
10. Panel includes subtle scroll indicator when content overflows

#### Technical Notes

- Desktop: Fixed sidebar with overflow-y: auto
- Mobile: Slide-out drawer component (Radix UI, Headless UI, or custom)
- Glassmorphic styling for panel background
- Z-index management to prevent interference with game

#### Definition of Done

- History panel renders on desktop and mobile
- Drawer animation smooth on mobile
- Empty state displays correctly
- Scroll behavior works as expected

---

### Story 3.2: Display History Entries with Thumbnails and Results

**Story ID:** AIVH-3.2
**Story Points:** 5
**Priority:** P1

**As a** user,
**I want** each history entry to show both images I compared and which one I selected,
**so that** I can remember my past decisions and learn from them.

#### Acceptance Criteria

1. History entry component created displaying:
   - Thumbnails of both images (small, ~80px width each)
   - Visual indicator (border/overlay) on selected image
   - Correct/incorrect badge or icon (green checkmark or red X)
   - Round number (e.g., "Rodada 3")
2. Each entry styled as compact card with HackTudo design
3. Entries added to history panel in chronological order (newest at top or bottom)
4. Selected image highlighted with colored border (green if correct, red if incorrect)
5. Correct image indicated with subtle label or icon (e.g., "IA" badge)
6. History updates immediately after each round completes
7. Maximum history entries displayed: 50 (or infinite scroll with virtualization)
8. Entry hover state shows larger preview or tooltip (desktop only)
9. Thumbnails lazy load if many entries exist
10. History entries accessible and keyboard navigable

#### Technical Notes

- History entry component: map over history array
- Thumbnail images: Use same URLs as game, smaller size
- Lazy loading: Intersection Observer API or library
- Virtualization (optional): react-window or react-virtual if performance issues
- Badge icons: ✓ (U+2713) and ✗ (U+2717) or custom SVG

#### Definition of Done

- History entries render with thumbnails
- Correct/incorrect indication clear
- Performance acceptable with 50+ entries
- Hover tooltips work on desktop

---

### Story 3.3: Integrate History State Management with Game Flow

**Story ID:** AIVH-3.3
**Story Points:** 3
**Priority:** P1

**As a** developer,
**I want** game state (score, history, round number) managed centrally,
**so that** all components stay in sync and state updates reliably.

#### Acceptance Criteria

1. Global state management setup using React Context API or Zustand
2. State includes:
   - `score: number`
   - `roundNumber: number`
   - `history: Array<{ round, imageA, imageB, selectedId, correct, score }>`
3. Actions defined:
   - `addHistoryEntry(entry)` - adds new entry to history
   - `updateScore(points)` - increments score
   - `resetGame()` - clears history and resets score/round
4. History panel subscribes to state and re-renders on updates
5. Score display subscribes to state and re-renders on updates
6. Game flow components dispatch actions on user interactions
7. State persists in sessionStorage (optional) to survive page refresh
8. Unit tests verify state updates correctly for all actions
9. State structure documented in TypeScript interfaces
10. State management provides good developer experience (clear, debuggable)

#### Technical Notes

- Recommended: Zustand (lightweight, simple API)
- Alternative: React Context + useReducer
- TypeScript interfaces for type safety
- sessionStorage persistence (optional): serialize state on change, hydrate on mount
- DevTools integration for debugging

#### Definition of Done

- State management implemented and tested
- All components using shared state
- State updates propagate correctly
- Unit tests passing
- TypeScript interfaces documented

---

## Epic Acceptance Criteria

- [ ] All 3 stories completed and accepted
- [ ] History panel displays and updates correctly
- [ ] History entries show thumbnails and results
- [ ] State management robust and tested
- [ ] Mobile drawer interaction smooth
- [ ] Empty state and full history state both work

## Technical Architecture Notes

**State Structure:**
```typescript
interface HistoryEntry {
  round: number;
  imageA: ImageInfo;
  imageB: ImageInfo;
  selectedId: string;
  correctId: string;
  correct: boolean;
  scoreAwarded: number;
  timestamp: Date;
}

interface GameState {
  score: number;
  roundNumber: number;
  history: HistoryEntry[];
  currentPair: ImagePair | null;
  isAnimating: boolean;
}
```

**Component Hierarchy:**
```
<GameLayout>
  <HistoryPanel>
    <HistoryHeader />
    <HistoryList>
      <HistoryEntry /> (repeated)
    </HistoryList>
  </HistoryPanel>
  <GameArea>
    <ScoreDisplay />
    <ImagePair />
  </GameArea>
</GameLayout>
```

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Performance issues with many history entries | Medium | Low | Implement virtualization (react-window) |
| Mobile drawer animation janky | Low | Medium | Use GPU-accelerated transforms, test on real devices |
| State management complexity | Medium | Low | Use simple state library (Zustand), thorough testing |
| sessionStorage quota exceeded | Low | Very Low | Limit history to 50 entries, clear on reset |

## Related Documents

- [PRD - Epic 3 Section](../prd.md#epic-3-history-panel--user-progress-tracking)
- [Front-End Specification - Play Page Layout](../front-end-spec.md#screen-2-play-page---game-interface)

---

**Epic Created:** 2025-09-30
**Last Updated:** 2025-09-30
**Epic Version:** 1.0
