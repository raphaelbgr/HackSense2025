# Epic 1: Foundation & Core Infrastructure

**Status:** Not Started
**Priority:** P0 (Highest)
**Epic Owner:** Development Team
**Target Sprint:** Sprint 1

---

## Epic Goal

Establish project setup with development environment, repository structure, basic frontend shell with HackTudo styling, and backend server with file-based data storage foundation.

## Expanded Goal

Set up the complete development environment and project foundation including repository initialization, frontend and backend scaffolding, HackTudo design system integration, basic routing structure, and file-based storage setup. This epic delivers a deployable "Hello World" application with HackTudo styling and health check endpoint.

## Epic Value

This epic provides the foundational infrastructure required for all subsequent development work. Without this foundation, no features can be built or deployed. It establishes:
- Development environment and tooling
- Code repository structure and conventions
- Design system integration for brand consistency
- Backend data persistence layer
- Deployment pipeline for continuous delivery

## Success Criteria

- [ ] Development environment fully operational (both frontend and backend servers running)
- [ ] HackTudo design system integrated and verified with sample components
- [ ] File-based storage utilities tested and working
- [ ] Application deployed to production hosting with health check passing
- [ ] All team members able to clone, setup, and run application locally

## Dependencies

**Prerequisites:**
- Node.js and npm installed on development machines
- Git repository access
- Hosting platform account (Vercel, Render, Railway, or similar)
- Access to hacktudo.com.br for design token extraction

**Blocks:**
- Epic 2 (requires routing and base layout)
- Epic 3 (requires routing and state management foundation)
- Epic 4 (requires file storage utilities)
- Epic 5 (requires routing and authentication foundation)

---

## User Stories

### Story 1.1: Initialize Project Repository and Development Environment

**Story ID:** AIVH-1.1
**Story Points:** 5
**Priority:** P0

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

#### Technical Notes

- Use Vite for frontend build tool (fast HMR, modern defaults)
- Express.js for backend (minimal, flexible)
- Concurrent script to run both dev servers simultaneously
- Environment variables: PORT, ADMIN_USERNAME, ADMIN_PASSWORD, DATA_DIR

#### Definition of Done

- Code merged to main branch
- README instructions followed by another team member successfully
- Both servers start without errors
- Health check endpoint verified with curl/Postman

---

### Story 1.2: Integrate HackTudo Design System and Base Layout

**Story ID:** AIVH-1.2
**Story Points:** 5
**Priority:** P0

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

#### Technical Notes

- Liquid glass (glassmorphism) design system as documented in front-end-spec.md
- CSS custom properties for theming
- Include backdrop-filter support check for older browsers
- Document all design tokens in theme.css with comments

#### Definition of Done

- Theme.css file contains all HackTudo design tokens
- Base layout component renders on test page
- Responsive behavior verified on multiple viewports
- Design tokens documented and accessible to all components

---

### Story 1.3: Create File-Based Data Storage Foundation

**Story ID:** AIVH-1.3
**Story Points:** 3
**Priority:** P0

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

#### Technical Notes

- Use fs.promises for async file operations
- Atomic write: write to temp file, then fs.rename (atomic on most filesystems)
- TypeScript interfaces for Ranking and ImageMetadata
- Consider file locking for concurrent writes (optional for MVP)

#### Definition of Done

- FileStorage utility functions implemented and exported
- Unit tests passing with 100% coverage
- Test endpoint returns success
- Initial data files created and committed (empty arrays)

---

### Story 1.4: Setup Basic Frontend Routing and Navigation

**Story ID:** AIVH-1.4
**Story Points:** 3
**Priority:** P0

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

#### Technical Notes

- React Router v6 with BrowserRouter
- Protected route component/wrapper for admin routes (check auth state)
- Navigation component with Link components
- Placeholder pages: simple heading + lorem ipsum text

#### Definition of Done

- All routes accessible via browser URL
- Navigation component renders and works
- 404 page displays for invalid routes
- Keyboard navigation verified

---

### Story 1.5: Deploy Foundation to Hosting Platform

**Story ID:** AIVH-1.5
**Story Points:** 5
**Priority:** P0

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

#### Technical Notes

- Choose hosting platform: Vercel (recommended for simplicity), Render, Railway, or traditional VPS
- Vercel: Use vercel.json for API route config
- Data persistence: Consider volume mounts or cloud storage for /data directory
- CI/CD: Manual deployment for MVP, automated later

#### Definition of Done

- Application deployed and accessible via public URL
- Health check endpoint verified in production
- Deployment process documented in README
- Team members able to trigger deployments

---

## Epic Acceptance Criteria

- [ ] All 5 stories completed and accepted
- [ ] Application deployed and accessible in production
- [ ] Development environment documented and working for all team members
- [ ] HackTudo design system integrated and verified
- [ ] File storage utilities tested and reliable
- [ ] Basic routing functional on all routes

## Technical Architecture Notes

**Tech Stack:**
- Frontend: React 18, Vite, TypeScript, React Router v6
- Backend: Node.js, Express.js, TypeScript
- Styling: CSS Modules with CSS custom properties, Liquid Glass design system
- Data Storage: JSON files (filesystem)
- Hosting: Vercel, Render, or Railway

**Folder Structure:**
```
/src
  /client
    /components
    /pages
    /styles
  /server
    /routes
    /utils
    /middleware
/public
  /images
/data
  rankings.json
  image-metadata.json
```

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Hosting platform file persistence issues | High | Medium | Document storage strategy, test persistence, consider cloud storage |
| Design token extraction incomplete | Medium | Low | Reference front-end-spec.md, validate with stakeholder |
| Development environment setup complexity | Medium | Medium | Detailed README, troubleshooting section, pair with team members |
| Deployment configuration issues | High | Medium | Test deployment early, use staging environment |

## Related Documents

- [PRD - Product Requirements Document](../prd.md)
- [Front-End Specification](../front-end-spec.md)
- [Technical Assumptions (PRD Section)](../prd.md#technical-assumptions)

---

**Epic Created:** 2025-09-30
**Last Updated:** 2025-09-30
**Epic Version:** 1.0
