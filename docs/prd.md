# AI vs Human Image Challenge - Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- Create an engaging gamified experience with scoring system that challenges users to distinguish AI-generated images from human-created ones
- Display persistent leaderboard/ranking on homepage showing top performers
- Provide immediate visual feedback ("Acertou!" for correct, negative feedback for incorrect) with point awards
- Present exactly 2 images side-by-side for direct comparison
- Collect optional user name (and email) at game end for leaderboard entry
- Persist ranking data in JSON file for leaderboard display
- Build a historical tracking system (left panel) allowing users to review their previous selections within current session
- Enable administrators to curate and manage the image repository with descriptive metadata
- Deliver a visually cohesive experience matching HackTudo branding and aesthetic
- Support Brazilian Portuguese as the primary language for all user-facing content

### Background Context

With the rapid advancement of AI image generation technology, distinguishing between AI-created and human-made images has become increasingly challenging. This "AI vs Human" image detection game addresses the growing need for AI literacy by creating an interactive, Tinder-style interface where users test their ability to identify image origins.

The application serves as both an educational tool and entertainment platform, helping users develop critical visual analysis skills while providing measurable feedback on their accuracy. By implementing admin controls for content curation and incorporating HackTudo's clean, minimalist design system, the platform aims to deliver a professional yet engaging user experience entirely in Brazilian Portuguese.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-09-30 | 0.1 | Initial PRD draft | BMad Master |

---

## Requirements

### Functional Requirements

**FR1:** The homepage displays the game interface with exactly 2 images side-by-side for comparison

**FR2:** Each image pair consists of one AI-generated image and one human-created image, randomly positioned (left or right)

**FR3:** User clicks/taps on the image they believe is AI-generated to make their selection

**FR4:** System immediately provides visual feedback upon selection:
- "Acertou!" animation with positive visual effects (e.g., green highlight, confetti, success animation) for correct answers
- Negative feedback animation (e.g., red highlight, shake effect, "Errou!" or sad emoji) for incorrect answers

**FR5:** Correct answers award points to the user (10 points per correct answer)

**FR6:** Incorrect answers award zero points (no penalty deduction)

**FR7:** After feedback animation completes, system automatically loads next image pair for continuous gameplay

**FR8:** Left panel displays history of user's selections in current game session, showing:
- Thumbnail of both images from each round
- Visual indicator of which image was selected
- Whether the selection was correct or incorrect
- Running score display at top of history panel

**FR9:** Homepage displays persistent leaderboard showing top 10 players with:
- Rank position
- Player name
- Total score
- Number of rounds played

**FR10:** After user clicks reset button or navigates away, system prompts user to enter their name for leaderboard entry if they scored points

**FR11:** Name entry form includes:
- Required name field (text input)
- Optional email field (email input)
- "Enviar" (Submit) button
- "Jogar Novamente" (Play Again) button to skip leaderboard entry

**FR12:** User can choose to skip leaderboard entry and play again without submitting name

**FR13:** Ranking data persists to JSON file (data/rankings.json) stored on server/filesystem

**FR14:** Leaderboard loads from rankings.json on application startup and page refresh

**FR15:** Leaderboard displays scores in descending order (highest first)

**FR16:** If user's score qualifies for top 10, highlight their entry in the leaderboard

**FR17:** Reset button in bottom-right corner clears current game session:
- Clears history panel
- Resets current score to zero
- Loads new image pair
- Does NOT trigger leaderboard entry prompt if score is zero

**FR18:** Admin interface accessible via /admin route, requires login authentication (username/password)

**FR19:** Admin login form includes:
- Username field
- Password field
- "Entrar" (Login) button
- Session management with timeout after 30 minutes of inactivity

**FR20:** Admin dashboard displays navigation menu with options:
- Gerenciar Imagens (Manage Images)
- Fazer Logout (Logout)

**FR21:** Admin can upload images to repository with metadata via upload form:
- Image file upload (drag-drop or file picker)
- Image type selection (AI-generated or Human-created) - required radio buttons
- Optional description text (textarea, max 500 characters)
- Preview of uploaded image before submission

**FR22:** Admin can view list of all images in repository in table/grid format showing:
- Image thumbnail
- Image filename
- Image type (AI/Human)
- Description (truncated if long)
- Actions: Edit, Delete buttons

**FR23:** Admin can edit existing image metadata:
- Change image type (AI/Human)
- Update description
- Changes save to image metadata JSON

**FR24:** Admin can delete images from repository with confirmation dialog

**FR25:** If admin sets description for an image, description displays below the image during gameplay in small italic text

**FR26:** System validates that uploaded images are valid image formats (PNG, JPG, JPEG, WebP, GIF)

**FR27:** System validates minimum image dimensions (400x400px) to ensure quality

**FR28:** Game prevents showing the same image pair twice in succession

**FR29:** Game randomly selects image pairs ensuring balanced distribution of AI and human images

**FR30:** All user-facing text displays in Brazilian Portuguese (PT-BR)

**FR31:** Game handles scenarios where insufficient images exist in repository (minimum 4 images required: 2 AI, 2 Human) by displaying friendly error message

### Non-Functional Requirements

**NFR1:** Application adopts HackTudo website design system:
- Color palette: Clean neutrals with subtle accent colors
- Typography: Arial, Helvetica, sans-serif font stack
- Base font size: 10px with relative sizing
- Clean, minimalist aesthetic with smooth transitions (.2s to .4s ease)
- Responsive grid-based layout
- Consistent border radius and shadow patterns

**NFR2:** Application is fully responsive and functions seamlessly on:
- Desktop (1920px+, 1440px, 1024px breakpoints)
- Tablet (768px)
- Mobile (375px, 320px)

**NFR3:** Images load efficiently with:
- Lazy loading for off-screen images
- Progressive JPEG loading where applicable
- Maximum file size limit of 5MB per image
- Automatic image optimization/compression on upload

**NFR4:** Animation feedback executes within 300ms of user interaction

**NFR5:** Admin authentication uses secure practices:
- Passwords hashed using bcrypt or similar (minimum 10 rounds)
- No plaintext password storage
- Session tokens with httpOnly cookies
- CSRF protection on admin forms

**NFR6:** JSON ranking file maintains data integrity:
- Atomic write operations to prevent corruption
- File locking during concurrent writes (if applicable)
- Backup mechanism for rankings.json

**NFR7:** Application handles errors gracefully with user-friendly messages in Portuguese:
- Missing/corrupted image files
- Network errors
- File upload failures
- Authentication failures

**NFR8:** Image repository supports minimum of 100 image pairs without performance degradation

**NFR9:** Page load time under 2 seconds on standard broadband connection

**NFR10:** Accessibility considerations:
- Keyboard navigation support for all interactive elements
- Alt text for images (generated from description if available)
- Sufficient color contrast ratios (WCAG AA minimum)
- Focus indicators for interactive elements

**NFR11:** Application works on modern browsers:
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari and Chrome

---

## User Interface Design Goals

### Overall UX Vision

The application delivers a clean, engaging, game-like experience that feels immediate and responsive. The interface prioritizes the core game mechanic (choosing between two images) with minimal distractions. Visual feedback is celebratory and encouraging, using smooth animations and HackTudo's design language to create a cohesive branded experience. The UI feels native to HackTudo's ecosystem while standing out as a distinct game experience.

### Key Interaction Paradigms

**Primary Interaction:** Direct image selection via click/tap on the suspected AI image
- Hover states on desktop show subtle scale/shadow effects
- Touch-friendly tap targets on mobile (minimum 44x44px)
- Immediate visual feedback locks the selection and triggers animation

**Secondary Interactions:**
- Scroll within history panel to review past selections
- Reset button with confirmation for accidental clicks
- Leaderboard modal/panel that can be expanded or collapsed
- Admin CRUD operations with standard form interactions

**Feedback Mechanisms:**
- "Acertou!" success animation: Green pulse, confetti particles, upward point counter animation
- "Errou!" failure animation: Red shake, subtle dimming, emoji reaction
- Score counter animates on updates
- Loading states for image fetching

### Core Screens and Views

1. **Homepage/Game Interface** (Primary View)
   - Center: Two large side-by-side images with subtle borders
   - Left Panel: Scrollable history with mini-thumbnails and results
   - Top Right: Current score display
   - Bottom Right: Reset button
   - Top or Right Side: Leaderboard widget (top 10)

2. **Game End / Leaderboard Entry Modal**
   - Displays final score prominently
   - Name input form with optional email
   - Current leaderboard position (if qualifies)
   - "Enviar" and "Jogar Novamente" buttons

3. **Admin Login Screen**
   - Centered login form
   - HackTudo branding
   - Username and password fields
   - "Entrar" button

4. **Admin Dashboard - Image Management**
   - Navigation menu (left sidebar or top bar)
   - Upload image form section
   - Image gallery/table view with thumbnails
   - Edit/Delete actions per image
   - Logout option

### Accessibility

**Target Level:** WCAG AA compliance

- Keyboard navigation for all interactive elements
- Focus indicators clearly visible
- Color contrast ratios meet AA standards
- Alt text for all images
- Screen reader friendly labels for form inputs
- Skip links for keyboard users

### Branding

**HackTudo Design System Integration:**

- Color Palette: Leverage CSS variables from hacktudo.com.br
  - Primary neutral backgrounds
  - Accent colors for interactive elements and feedback
  - Success green for "Acertou!" feedback
  - Error red for incorrect selections

- Typography:
  - Arial, Helvetica, sans-serif font family
  - Base 10px sizing with rem units for scalability
  - Clear hierarchy: Large headings, readable body text

- Visual Style:
  - Clean, minimalist card-based layouts
  - Subtle shadows and border radius for depth
  - Smooth transitions and animations (0.2s-0.4s cubic-bezier)
  - Responsive grid system

- Animation Aesthetic:
  - Celebration animations using CSS transforms and opacity
  - Particle effects for success states (confetti library or CSS)
  - Smooth state transitions

### Target Device and Platforms

**Primary Target:** Web Responsive (Desktop and Mobile)

- Desktop browsers (primary interaction mode): 1024px and wider
- Tablet: 768px-1023px
- Mobile: 320px-767px

**Platform Support:**
- Modern web browsers (Chrome, Firefox, Safari, Edge)
- Touch-optimized for mobile devices
- Progressive enhancement approach

---

## Technical Assumptions

### Repository Structure

**Monorepo** - Single repository containing all application code

- Frontend and backend code in same repository
- Shared configuration and utilities
- Simplified deployment pipeline

### Service Architecture

**Monolith with Frontend and Backend Separation**

- **Frontend:** Single-page application (SPA) or server-rendered pages
  - Framework: React with Vite (modern, fast, HMR support) OR Next.js (SSR, file-based routing, API routes)
  - State Management: React Context API or Zustand (lightweight)
  - Styling: CSS Modules or Tailwind CSS with HackTudo design tokens

- **Backend:** Lightweight Node.js server
  - Framework: Express.js (minimal, flexible) OR Fastify (faster, modern)
  - File-based data storage (JSON files for rankings and image metadata)
  - Simple authentication middleware for admin routes

- **Image Storage:** Local filesystem storage with organized directory structure
  - `/public/images/ai/` - AI-generated images
  - `/public/images/human/` - Human-created images
  - `/data/image-metadata.json` - Image metadata (type, description, filename)
  - `/data/rankings.json` - Leaderboard data

**Rationale:** Monolithic structure keeps deployment simple for MVP while maintaining clear separation between frontend and backend concerns. File-based storage eliminates database dependency for initial launch.

### Testing Requirements

**Unit + Integration Testing**

- **Frontend Testing:**
  - Component unit tests with React Testing Library
  - User interaction tests (click handlers, form submissions)
  - Visual regression tests for animations (optional, Playwright/Storybook Chromatic)

- **Backend Testing:**
  - API endpoint integration tests
  - File I/O operations (rankings, metadata)
  - Authentication middleware tests

- **End-to-End Testing:**
  - Critical user flows: Game play, leaderboard entry, admin image upload
  - Cross-browser testing (manual or Playwright)

- **Testing Tools:**
  - Jest or Vitest for unit/integration tests
  - React Testing Library for component tests
  - Playwright for E2E tests (optional for MVP)

**Rationale:** Unit + Integration testing provides good coverage without full E2E overhead for MVP. Focus on critical paths and business logic.

### Additional Technical Assumptions and Requests

- **Language:** TypeScript for both frontend and backend (type safety, better DX)

- **Styling Approach:** Extract HackTudo CSS variables into shared theme configuration
  - Create `theme.css` or `design-tokens.js` mapping HackTudo colors/fonts
  - Use CSS custom properties for easy theme consistency

- **Image Upload:** Use `multer` or similar middleware for handling multipart form data

- **Authentication:** Simple username/password with bcrypt hashing
  - Environment variables for admin credentials (not hardcoded)
  - JWT or session-based auth for admin routes

- **Animation Libraries:**
  - `framer-motion` for smooth React animations
  - `canvas-confetti` or `react-confetti` for celebration effects

- **Deployment Target:**
  - Static hosting for frontend (Vercel, Netlify, or GitHub Pages)
  - Node.js hosting for backend (Vercel serverless functions, Railway, Render, or traditional VPS)
  - Alternative: Full-stack deployment on single platform (Vercel with API routes, Render web service)

- **Environment Configuration:**
  - `.env` file for configuration (admin credentials, port, file paths)
  - Separate `.env.development` and `.env.production`

- **File Structure Convention:**
  ```
  /src
    /client (or /frontend)
      /components
      /pages
      /styles
      /hooks
      /utils
    /server (or /backend)
      /routes
      /middleware
      /utils
      /services
  /public
    /images
      /ai
      /human
  /data
    rankings.json
    image-metadata.json
  ```

- **CORS Configuration:** Allow frontend to communicate with backend (same-origin or explicit CORS headers)

- **Error Logging:** Console logging for development, structured logging for production (optional: Winston, Pino)

- **Image Validation:** Check file types, dimensions, and size on upload before accepting

- **Graceful Degradation:** If JavaScript fails, display message that game requires JS enabled

---

## Epic List

### Epic 1: Foundation & Core Infrastructure
**Goal:** Establish project setup with development environment, repository structure, basic frontend shell with HackTudo styling, and backend server with file-based data storage foundation.

### Epic 2: Game Mechanics & Image Display
**Goal:** Implement core game functionality allowing users to select between two images, receive immediate feedback, track score, and load new image pairs continuously.

### Epic 3: History Panel & User Progress Tracking
**Goal:** Create session-based history panel showing user's selection history with thumbnails and results, providing visual feedback on gameplay progression.

### Epic 4: Leaderboard System & Persistence
**Goal:** Build persistent leaderboard with JSON file storage, name/email entry form, and ranking display on homepage showing top performers.

### Epic 5: Admin Authentication & Image Management
**Goal:** Develop admin interface with secure authentication allowing administrators to upload, edit, and delete images with metadata (type and description).

---

## Epic 1: Foundation & Core Infrastructure

**Expanded Goal:** Set up the complete development environment and project foundation including repository initialization, frontend and backend scaffolding, HackTudo design system integration, basic routing structure, and file-based storage setup. This epic delivers a deployable "Hello World" application with HackTudo styling and health check endpoint.

### Story 1.1: Initialize Project Repository and Development Environment

**As a** developer,
**I want** a properly initialized monorepo with TypeScript, React (Vite), and Express.js configured,
**so that** I can begin building features with a solid foundation and modern tooling.

#### Acceptance Criteria

1. Git repository initialized with proper .gitignore (node_modules, .env, build artifacts)
2. Package.json created with project metadata and npm scripts (dev, build, test)
3. TypeScript configured for both frontend (tsconfig.json) and backend (tsconfig.server.json)
4. React + Vite frontend scaffold created in /src/client with hot module reloading working
5. Express.js backend scaffold created in /src/server with nodemon for auto-restart
6. Folder structure follows conventions: /src/client, /src/server, /public, /data directories created
7. Environment configuration setup: .env.example file with required variables documented
8. README.md created with setup instructions and project overview
9. Development servers start successfully: `npm run dev:client` and `npm run dev:server`
10. Basic health check endpoint GET /api/health returns 200 OK with JSON response

---

### Story 1.2: Integrate HackTudo Design System and Base Layout

**As a** frontend developer,
**I want** HackTudo's design tokens (colors, typography, spacing) integrated into the application styling system,
**so that** the application maintains visual consistency with the HackTudo brand.

#### Acceptance Criteria

1. CSS variables extracted from hacktudo.com.br and defined in /src/client/styles/theme.css
2. Design tokens include: color palette, font families, base font size, border radius, shadow values, transition timings
3. Global styles applied: box-sizing, font family, base font size, CSS reset
4. Base layout component created with HackTudo styling (header, main content area, footer if needed)
5. Typography styles defined for headings (h1-h6) and body text matching HackTudo aesthetic
6. Responsive breakpoints defined as CSS custom properties (mobile: 320px, tablet: 768px, desktop: 1024px+)
7. Layout renders correctly on desktop (1920px, 1440px, 1024px), tablet (768px), and mobile (375px, 320px)
8. Test page displays sample typography and color swatches to verify design system integration
9. All styles use CSS custom properties/variables for easy theme consistency

---

### Story 1.3: Create File-Based Data Storage Foundation

**As a** backend developer,
**I want** utility functions for reading and writing JSON files atomically,
**so that** rankings and image metadata persist reliably without data corruption.

#### Acceptance Criteria

1. Utility functions created in /src/server/utils/fileStorage.ts:
   - `readJSON(filePath)` - reads and parses JSON file
   - `writeJSON(filePath, data)` - writes data to JSON file atomically
2. Functions handle errors gracefully: file not found, invalid JSON, write failures
3. writeJSON implements atomic write pattern (write to temp file, then rename)
4. Initial data files created: /data/rankings.json (empty array) and /data/image-metadata.json (empty array)
5. Unit tests written covering: successful read/write, error handling, atomic write behavior
6. Test endpoint GET /api/data/health verifies file system access and returns success
7. Functions use TypeScript types for rankings and image metadata structures
8. File paths configurable via environment variables (DATA_DIR)

---

### Story 1.4: Setup Basic Frontend Routing and Navigation

**As a** user,
**I want** to navigate between homepage and admin pages,
**so that** I can access game interface and admin functionality.

#### Acceptance Criteria

1. React Router (v6) installed and configured
2. Routes defined:
   - `/` - Homepage (game interface placeholder)
   - `/admin` - Admin login page (placeholder)
   - `/admin/dashboard` - Admin dashboard (placeholder, protected route)
3. Basic navigation component created with HackTudo styling
4. Each route renders placeholder page with heading and description
5. Active route highlighted in navigation menu
6. 404 Not Found page created for undefined routes
7. Navigation is keyboard accessible (tab through links, enter to navigate)
8. Responsive navigation: hamburger menu on mobile, full menu on desktop

---

### Story 1.5: Deploy Foundation to Hosting Platform

**As a** developer,
**I want** the foundation application deployed to production hosting,
**so that** subsequent features can be tested in production environment and stakeholders can preview progress.

#### Acceptance Criteria

1. Frontend build process creates optimized production bundle
2. Backend build process compiles TypeScript to JavaScript
3. Deployment configuration created for chosen platform (Vercel, Render, Railway, or similar)
4. Environment variables configured in hosting platform (match .env.example)
5. /public and /data directories properly configured for production (file persistence strategy documented)
6. Deployment successful: Application accessible via public URL
7. Health check endpoint returns 200 OK in production
8. Placeholder homepage renders correctly with HackTudo styling in production
9. HTTPS enabled on production URL
10. Deployment documentation added to README.md (how to deploy updates)

---

## Epic 2: Game Mechanics & Image Display

**Expanded Goal:** Build the core game functionality where users select between two side-by-side images to identify which is AI-generated. Implement image loading from the repository, random pair selection, click handlers, immediate visual feedback animations ("Acertou!" and "Errou!"), score tracking, and automatic progression to next image pair. This epic delivers a playable game loop.

### Story 2.1: Create Image Repository API Endpoints

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

---

### Story 2.2: Build Game Interface Layout with Image Display

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

---

### Story 2.3: Implement Image Selection and Feedback Animation

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

---

### Story 2.4: Implement Score Tracking and Display

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

---

### Story 2.5: Add Reset Button with Session Clear

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

---

## Epic 3: History Panel & User Progress Tracking

**Expanded Goal:** Create a left sidebar panel that displays the user's selection history for the current game session. Each history entry shows thumbnails of both images, which image was selected, and whether the choice was correct or incorrect. This provides users with visual feedback on their gameplay progression and allows them to review past decisions.

### Story 3.1: Design and Implement History Panel Layout

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

---

### Story 3.2: Display History Entries with Thumbnails and Results

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

---

### Story 3.3: Integrate History State Management with Game Flow

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

---

## Epic 4: Leaderboard System & Persistence

**Expanded Goal:** Build a persistent leaderboard system that stores player scores in JSON file, displays top 10 players on the homepage, and prompts users to enter their name (and optional email) when they complete a game with a non-zero score. The leaderboard ranks players by total score and highlights the current user's entry if they qualify for top 10.

### Story 4.1: Create Leaderboard API Endpoints

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

---

### Story 4.2: Display Leaderboard Widget on Homepage

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

---

### Story 4.3: Implement Game End and Name Entry Modal

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

---

### Story 4.4: Integrate Leaderboard Submission with Game State

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

---

## Epic 5: Admin Authentication & Image Management

**Expanded Goal:** Develop a secure admin interface accessible via /admin route where administrators can log in with username/password, then upload new images with metadata (AI or Human type, optional description), view all existing images in a gallery, edit image metadata, and delete images. This epic enables content curation for the game.

### Story 5.1: Implement Admin Authentication System

**As an** administrator,
**I want** a secure login page at /admin,
**so that** only authorized users can access image management features.

#### Acceptance Criteria

1. Admin login page created at /admin route with HackTudo styling
2. Login form includes:
   - Username field (text input)
   - Password field (password input, masked)
   - "Entrar" button
3. API endpoint POST /api/auth/login accepts JSON body: { username, password }
4. Login endpoint validates credentials against environment variables (ADMIN_USERNAME, ADMIN_PASSWORD)
5. Passwords hashed using bcrypt (admin password hash stored in env, not plaintext)
6. On successful login:
   - Server generates session token (JWT or session cookie)
   - Returns { success: true, token }
   - Frontend stores token in httpOnly cookie or localStorage
7. On failed login:
   - Returns 401 error with message: "Usuário ou senha incorretos"
   - Frontend displays error message below form
8. Session expires after 30 minutes of inactivity
9. Protected route middleware created: verifies token on /api/admin/* routes
10. Unit tests cover: successful login, failed login, token validation, session expiry

---

### Story 5.2: Create Admin Dashboard Layout and Navigation

**As an** administrator,
**I want** a dashboard with navigation after logging in,
**so that** I can access image management features easily.

#### Acceptance Criteria

1. Admin dashboard page created at /admin/dashboard route (protected)
2. Dashboard layout includes:
   - Header with HackTudo branding and "Painel Administrativo" title
   - Navigation menu with options: "Gerenciar Imagens", "Fazer Logout"
   - Main content area for image management
3. Logout button triggers API call POST /api/auth/logout
4. On logout:
   - Session token invalidated/deleted
   - User redirected to /admin login page
5. Protected route logic: redirects to /admin if user not authenticated
6. Dashboard styled with HackTudo design system (clean, admin-focused UI)
7. Navigation responsive: sidebar on desktop, hamburger menu on mobile
8. Active navigation item highlighted
9. Dashboard accessible via keyboard navigation
10. Session timeout displays message: "Sessão expirada. Faça login novamente."

---

### Story 5.3: Build Image Upload Form with Metadata

**As an** administrator,
**I want** to upload images with metadata via a form,
**so that** I can add new content to the game repository.

#### Acceptance Criteria

1. Image upload form component created on admin dashboard
2. Form includes fields:
   - Image file upload (drag-drop area or file picker)
   - Image type radio buttons: "IA Gerada" or "Humana"
   - Description textarea (optional, max 500 characters, Portuguese placeholder)
   - "Fazer Upload" submit button
3. File input validates:
   - File type: PNG, JPG, JPEG, WebP, GIF only
   - File size: maximum 5MB
   - Minimum dimensions: 400x400px (validated client-side with FileReader API)
4. Image preview displays after file selection
5. API endpoint POST /api/admin/images accepts multipart/form-data:
   - image file
   - type (ai or human)
   - description (optional)
6. Backend validates file on upload (type, size, dimensions using sharp or similar)
7. Backend saves image to /public/images/{ai|human}/ with unique filename (timestamp + original name)
8. Backend updates /data/image-metadata.json with new entry:
   - { id, filename, type, description, uploadedAt }
9. On successful upload:
   - Form resets
   - Success message displays: "Imagem enviada com sucesso!"
   - Image gallery (Story 5.4) refreshes
10. On validation error:
    - Error message displays with details
    - Form retains values for retry

---

### Story 5.4: Display Image Gallery with Edit and Delete Actions

**As an** administrator,
**I want** to view all uploaded images in a gallery with actions,
**so that** I can manage the image repository effectively.

#### Acceptance Criteria

1. Image gallery component created on admin dashboard below upload form
2. Gallery fetches images from GET /api/admin/images (returns array from image-metadata.json)
3. Gallery displays images in grid or table format:
   - Thumbnail (150px)
   - Filename
   - Type badge ("IA" or "Humana" with color coding)
   - Description (truncated if long, expandable tooltip)
   - Actions: "Editar" and "Excluir" buttons
4. Loading state displays while fetching images
5. Empty state displays: "Nenhuma imagem ainda. Faça upload de imagens."
6. Gallery responsive: grid on desktop (3-4 columns), list on mobile (1 column)
7. Gallery styled with HackTudo design system (cards, clean layout)
8. Gallery supports pagination if many images (10-20 per page)
9. Gallery includes search/filter by type (AI/Human)
10. Thumbnails lazy load for performance

---

### Story 5.5: Implement Edit and Delete Image Functionality

**As an** administrator,
**I want** to edit image metadata or delete images,
**so that** I can correct mistakes and remove outdated content.

#### Acceptance Criteria

1. "Editar" button opens modal with edit form pre-populated:
   - Image type radio buttons (current type selected)
   - Description textarea (current description filled)
   - "Salvar" and "Cancelar" buttons
2. API endpoint PUT /api/admin/images/:id accepts JSON body: { type, description }
3. PUT endpoint updates entry in image-metadata.json
4. On successful edit:
   - Modal closes
   - Success message displays: "Imagem atualizada!"
   - Gallery refreshes with updated data
5. "Excluir" button opens confirmation dialog: "Tem certeza que deseja excluir esta imagem? Esta ação não pode ser desfeita."
6. Confirmation dialog includes "Sim, Excluir" and "Cancelar" buttons
7. API endpoint DELETE /api/admin/images/:id removes entry from image-metadata.json and deletes file from /public/images/
8. On successful delete:
   - Dialog closes
   - Success message displays: "Imagem excluída!"
   - Gallery refreshes without deleted image
9. Error handling: If image file missing, still remove metadata entry and show warning
10. Unit tests cover: edit flow, delete flow, error scenarios (file not found, permission errors)

---

## Checklist Results Report

_(This section will be populated after running the PM Checklist to validate the PRD completeness and quality.)_

**Note:** Before finalizing this PRD, the PM Checklist (pm-checklist.md) should be executed to verify:
- All functional and non-functional requirements are clear and testable
- Epic and story sequencing follows agile best practices
- Acceptance criteria are specific and achievable
- Technical assumptions align with project goals
- No critical gaps or ambiguities exist

---

## Next Steps

### UX Expert Prompt

**Prompt for UX Expert/Design Architect:**

"Create a detailed UX/UI specification for the AI vs Human Image Challenge application based on the PRD in docs/prd.md. Focus on:
1. Wireframes/mockups for all core screens (homepage/game interface, leaderboard modal, admin dashboard)
2. Animation specifications for 'Acertou!' and 'Errou!' feedback sequences
3. Responsive design breakpoints and mobile adaptations
4. Detailed component specifications (buttons, forms, modals, panels)
5. HackTudo design system integration (specific color values, typography scale, spacing units)

Ensure all designs adhere to WCAG AA accessibility standards and Brazilian Portuguese language requirements."

### Architect Prompt

**Prompt for Software Architect:**

"Create a comprehensive technical architecture document for the AI vs Human Image Challenge application based on the PRD in docs/prd.md. Include:
1. System architecture diagram (frontend, backend, storage layers)
2. Technology stack selection with rationale (React/Vite, Express, TypeScript, etc.)
3. API design with endpoint specifications (request/response schemas)
4. Data models for rankings.json and image-metadata.json
5. File storage structure and organization
6. Authentication and session management implementation
7. Deployment architecture and hosting recommendations
8. Testing strategy and CI/CD pipeline
9. Performance optimization approaches
10. Security considerations (authentication, file uploads, CSRF protection)

Use the PRD's Technical Assumptions section as foundation and expand with detailed implementation guidance for development team."
