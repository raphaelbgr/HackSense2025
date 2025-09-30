# Epic 5: Admin Authentication & Image Management

**Status:** Not Started
**Priority:** P2
**Epic Owner:** Development Team
**Target Sprint:** Sprint 5

---

## Epic Goal

Develop admin interface with secure authentication allowing administrators to upload, edit, and delete images with metadata (type and description).

## Expanded Goal

Develop a secure admin interface accessible via /admin route where administrators can log in with username/password, then upload new images with metadata (AI or Human type, optional description), view all existing images in a gallery, edit image metadata, and delete images. This epic enables content curation for the game.

## Epic Value

The admin interface empowers content managers to:
- Curate high-quality image repository for the game
- Maintain balanced distribution of AI and human images
- Add descriptive context to images for educational value
- Remove inappropriate or low-quality images
- Scale content library over time

Without this interface, the game's content is static and cannot be easily updated or expanded.

## Success Criteria

- [ ] Admin login page functional with secure authentication
- [ ] Admin dashboard accessible only after successful login
- [ ] Drag-and-drop image upload with type and description metadata
- [ ] Image gallery displays all repository images with thumbnails
- [ ] Edit functionality allows updating image type and description
- [ ] Delete functionality removes images with confirmation
- [ ] Session management with 30-minute timeout
- [ ] All admin actions secured and validated

## Dependencies

**Prerequisites:**
- Epic 1 completed (routing, file storage utilities, authentication foundation)
- Admin credentials configured in environment variables

**Blocks:**
- None (independent epic)

---

## User Stories

### Story 5.1: Implement Admin Authentication System

**Story ID:** AIVH-5.1
**Story Points:** 5
**Priority:** P2

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

#### Technical Notes

- Password hashing: bcrypt with 10+ rounds
- JWT: jsonwebtoken library with HS256 algorithm, 30-minute expiration
- Alternative: express-session with MemoryStore (simpler for single admin)
- Middleware: Verify JWT on protected routes, return 401 if invalid
- CSRF protection: CSRF token on form submission

#### Definition of Done

- Login page renders with form
- Authentication endpoint functional and tested
- JWT/session tokens generated and verified
- Protected routes middleware working
- Unit tests passing

---

### Story 5.2: Create Admin Dashboard Layout and Navigation

**Story ID:** AIVH-5.2
**Story Points:** 3
**Priority:** P2

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

#### Technical Notes

- Protected route component: Check auth state, redirect if not authenticated
- Logout endpoint: Clear session/JWT token
- Glassmorphic dashboard layout
- Navigation: Active route highlighted with CSS class
- Session timeout: Client-side timer or server-side expiry check

#### Definition of Done

- Dashboard renders after login
- Navigation functional
- Logout works and redirects
- Protected route logic prevents unauthorized access
- Session timeout handled gracefully

---

### Story 5.3: Build Image Upload Form with Drag-and-Drop

**Story ID:** AIVH-5.3
**Story Points:** 8
**Priority:** P2

**As an** administrator,
**I want** to upload images via drag-and-drop with metadata,
**so that** I can efficiently add new content to the game repository.

#### Acceptance Criteria

1. Image upload form component created on admin dashboard
2. Form includes fields:
   - Drag-and-drop zone or file picker (both supported)
   - Image type radio buttons: "IA Gerada" or "Humana" (required)
   - Description textarea (optional, max 500 characters, Portuguese placeholder)
   - "Fazer Upload" submit button
3. Drag-and-drop zone features:
   - Visual highlight on drag-over (border glow, background change)
   - Text: "Arraste imagens aqui ou clique para selecionar"
   - File type hint: "PNG, JPG, JPEG, WebP, GIF (max 5MB)"
4. File input validates:
   - File type: PNG, JPG, JPEG, WebP, GIF only
   - File size: maximum 5MB
   - Minimum dimensions: 400x400px (validated client-side with FileReader API)
5. Image preview displays after file selection
6. API endpoint POST /api/admin/images accepts multipart/form-data:
   - image file
   - type (ai or human)
   - description (optional)
7. Backend validates file on upload (type, size, dimensions using sharp or similar)
8. Backend saves image to /public/images/{ai|human}/ with unique filename (timestamp + UUID)
9. Backend updates /data/image-metadata.json with new entry
10. On successful upload:
    - Form resets
    - Success message displays: "Imagem enviada com sucesso!"
    - Image gallery (Story 5.4) refreshes
11. On validation error:
    - Error message displays with details
    - Form retains values for retry

#### Technical Notes

- Drag-and-drop: react-dropzone library
- File validation client-side: FileReader API for dimensions
- Backend validation: multer for multipart/form-data, sharp for image processing
- Unique filename: `${Date.now()}-${uuidv4()}.${extension}`
- Image metadata: { id, filename, type, description, uploadedAt }
- CSRF protection on form

#### Definition of Done

- Drag-and-drop zone functional
- File picker fallback works
- Client and server validation working
- Image saves to correct directory
- Metadata updates in JSON file
- Success/error messages display

---

### Story 5.4: Display Image Gallery with Edit and Delete Actions

**Story ID:** AIVH-5.4
**Story Points:** 5
**Priority:** P2

**As an** administrator,
**I want** to view all uploaded images in a gallery with actions,
**so that** I can manage the image repository effectively.

#### Acceptance Criteria

1. Image gallery component created on admin dashboard below upload form
2. Gallery fetches images from GET /api/admin/images (returns array from image-metadata.json)
3. Gallery displays images in grid or table format:
   - Thumbnail (150px)
   - Filename
   - Type badge ("IA" or "Humana" with color coding: blue for AI, green for Human)
   - Description (truncated if long, expandable tooltip on hover)
   - Actions: "Editar" and "Excluir" buttons
4. Loading state displays while fetching images
5. Empty state displays: "Nenhuma imagem ainda. Faça upload de imagens."
6. Gallery responsive: grid on desktop (3-4 columns), list on mobile (1 column)
7. Gallery styled with HackTudo design system (cards, clean layout)
8. Gallery supports pagination if many images (10-20 per page)
9. Gallery includes search/filter by type (AI/Human) dropdown
10. Thumbnails lazy load for performance

#### Technical Notes

- Grid layout: CSS Grid with repeat(auto-fill, minmax(200px, 1fr))
- Thumbnail lazy loading: Intersection Observer or react-lazyload
- Pagination: react-paginate or custom implementation
- Filter: Dropdown to filter by type, update displayed images
- Type badge: Glassmorphic badge with color coding

#### Definition of Done

- Gallery renders with all images
- Grid layout responsive
- Pagination working if many images
- Filter by type functional
- Loading and empty states work
- Lazy loading implemented

---

### Story 5.5: Implement Edit and Delete Image Functionality

**Story ID:** AIVH-5.5
**Story Points:** 5
**Priority:** P2

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
6. Confirmation dialog includes "Sim, Excluir" (danger button) and "Cancelar" buttons
7. API endpoint DELETE /api/admin/images/:id removes entry from image-metadata.json and deletes file from /public/images/
8. On successful delete:
   - Dialog closes
   - Success message displays: "Imagem excluída!"
   - Gallery refreshes without deleted image
9. Error handling: If image file missing, still remove metadata entry and show warning
10. Unit tests cover: edit flow, delete flow, error scenarios

#### Technical Notes

- Edit modal: Glassmorphic modal with form
- Delete confirmation: Reusable confirmation dialog component
- File deletion: fs.promises.unlink()
- Error handling: Try-catch with user-friendly messages
- Optimistic UI: Update gallery immediately, rollback if API fails

#### Definition of Done

- Edit modal functional with pre-populated data
- Delete confirmation prevents accidental deletions
- Both API endpoints working and tested
- Gallery refreshes after edit/delete
- Error handling graceful
- Unit tests passing

---

## Epic Acceptance Criteria

- [ ] All 5 stories completed and accepted
- [ ] Admin login secure and functional
- [ ] Image upload with drag-and-drop working
- [ ] Image gallery displays all images
- [ ] Edit and delete actions functional
- [ ] Session management with timeout
- [ ] All admin routes protected
- [ ] Tested with real admin workflow

## Technical Architecture Notes

**Authentication Flow:**
1. Admin enters credentials → POST /api/auth/login
2. Server validates credentials, generates JWT
3. JWT stored in httpOnly cookie or localStorage
4. Protected routes check JWT via middleware
5. Session expires after 30 minutes, redirect to login

**Image Upload Flow:**
1. Admin selects/drags image → Client validation
2. Form submit → POST /api/admin/images (multipart/form-data)
3. Server validates file (type, size, dimensions)
4. Image saved to /public/images/{ai|human}/
5. Metadata appended to image-metadata.json
6. Gallery refreshes with new image

**Data Models:**
```typescript
interface ImageMetadata {
  id: string; // UUID
  filename: string;
  type: 'ai' | 'human';
  description?: string;
  uploadedAt: string; // ISO 8601
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number; // bytes
}
```

## Security Considerations

- **Password Storage**: Bcrypt hash in environment variable, never plaintext
- **JWT Secret**: Strong random secret, stored in environment variable
- **CSRF Protection**: CSRF tokens on admin forms
- **File Upload Validation**: Strict file type and size validation (client + server)
- **Path Traversal Prevention**: Sanitize filenames, use UUID for uniqueness
- **Rate Limiting**: Consider rate limiting on login endpoint (future enhancement)
- **Session Expiry**: 30-minute timeout for inactive sessions

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| File upload exploits (malicious files) | High | Low | Strict validation, file type checking, size limits, use sharp for re-encoding |
| Weak password | High | Medium | Document password requirements, consider password strength check |
| Session hijacking | Medium | Low | httpOnly cookies, HTTPS only, short session expiry |
| Concurrent image uploads causing conflicts | Low | Low | Atomic file writes, unique filenames with UUID |
| Image deletion while in use in game | Low | Low | Accept as edge case, game handles missing images gracefully |

## Related Documents

- [PRD - Epic 5 Section](../prd.md#epic-5-admin-authentication--image-management)
- [Front-End Specification - Admin Dashboard](../front-end-spec.md#screen-4-admin-dashboard---image-management)
- [PRD - Non-Functional Requirements (Security)](../prd.md#non-functional-requirements)

---

**Epic Created:** 2025-09-30
**Last Updated:** 2025-09-30
**Epic Version:** 1.0
