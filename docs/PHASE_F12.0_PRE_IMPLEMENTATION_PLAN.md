# PHASE F12.0 — MEDIA UPLOAD & ASSET MANAGEMENT ENGINE PRE-IMPLEMENTATION PLAN

**Target**: Media Upload, Presigned Cloudinary Direct Ingestion, Image Asset Registration & Studio/Profile Integration (`apps/web`)  
**Phase**: F12.0  
**Mode**: STRICT READ-ONLY — PLANNING ONLY  
**Date**: 2026-08-16  
**Author**: Senior Staff Frontend Architect, Full-Stack Architecture Reviewer, Backend Contract Auditor, Application Security Engineer & Lead QA  
**Status**: READY FOR HUMAN APPROVAL  

---

## 1. Executive Summary

Following the successful completion and approval of **Phases F2 through F11.1**, this document establishes the comprehensive, implementation-ready architectural plan for **Phase F12.0 — Media Upload & Asset Management Engine**.

An exhaustive investigation of the backend (`apps/api/src/modules/media`), the database schema (`docs/DATABASE_SCHEMA.sql`, Table 7: `media`), and existing frontend deferred points (`PostStudio`, `EditProfileModal`, `PostCoverMedia`) confirms that **Media Management is the critical next milestone**.

Phase F12 introduces:
1. **Presigned Cloudinary Upload Flow**: Requesting cryptographically signed direct upload parameters from `POST /api/v1/media/upload-signature` and performing direct client-to-Cloudinary HTTPS uploads without routing heavy binary payloads through the platform API server.
2. **Metadata Registration**: Persisting uploaded assets via `POST /api/v1/media` (`RegisterMediaDto`) and receiving canonical `MediaEntity` records.
3. **Asset Lifecycle & Invalidation**: Retrieval via `GET /api/v1/media/:id` and soft-deletion via `DELETE /api/v1/media/:id`.
4. **Studio & Profile Integration**:
   - `MediaUploader.tsx`: Accessible drag-and-drop / file-picker component with file type validation, size limit enforcement (max 10MB), progress feedback, and preview.
   - `CoverImagePicker.tsx`: Integrated into `PostStudio.tsx` for cover banner uploads (`purpose = 'cover'`).
   - `AvatarPicker.tsx`: Integrated into `EditProfileModal.tsx` for analyst avatar updates (`purpose = 'avatar'`).

---

## 2. Frozen Approved Baselines & Current Project State

```text
PHASE F2   App Shell & UI Foundation              APPROVED (Frozen)
PHASE F3.1 Authentication & Identity              APPROVED (Frozen)
PHASE F4.1 Public Feed & Discovery Engine         APPROVED (Frozen)
PHASE F5.1 Post Detail & Series Reader            APPROVED (Frozen)
PHASE F6.1 Comments & Discussions                 APPROVED (Frozen)
PHASE F7.1 Users, Profiles & Social Identity       APPROVED (Frozen)
PHASE F8.1 Notification System                     APPROVED (Frozen)
PHASE F9.1 Post Creation & Editing Studio          APPROVED (Frozen)
PHASE F10.1 Educational Series Engine              APPROVED (Frozen)
PHASE F11.1 Reactions & Engagement Engine          APPROVED (Frozen)

Latest Verified Validation:
- Tests: 123/123 PASS across 45 test files
- Typecheck: 0 TypeScript errors
- Production Build: PASS (Next.js Turbopack)
- Backend Modifications: 0
- Database Modifications: 0
- Migrations: 0
- Scope Creep: 0
```

All previous phases remain **IMMUTABLE BASELINES**.

---

## 3. Post-F11.1 Frontend Capability Gap Analysis

| Capability / Domain | Backend Ready | Frontend Exists | Partially Implemented | Missing | Candidate Phase |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Media Upload & Asset Management** (`media`) | **YES** | No | Deferred in F9.1 / F7.1 | **YES** | **PHASE F12 (Selected)** |
| **Community Content Reporting** (`reports`) | **YES** | No | No | **YES** | PHASE F13 |
| **Moderation Queue & Actions** (`moderation`) | **YES** | No | No | **YES** | PHASE F13 |
| **Admin Governance & System Ops** (`admin`) | **YES** | No | No | **YES** | PHASE F14 |

**Architectural Justification for F12**:
1. Media upload is a direct dependency for completing the authoring experience in `PostStudio` (F9.1) and profile customization in `EditProfileModal` (F7.1).
2. The backend media module (`MediaController`, `MediaService`, `MediaRepository`) is 100% complete and tested in `apps/api/src/modules/media`.
3. Database table `media` is defined in `docs/DATABASE_SCHEMA.sql` with foreign keys to `posts.cover_media_id` and `users.avatar_media_id`.

---

## 4. Phase F12.0 Target Definition & Justification

- **Module Name**: Media Upload & Asset Management Engine
- **Primary Objective**: Provide secure, presigned direct client uploads for images, registering them into platform database entities, and connecting them to post covers and user avatars.

---

## 5. Backend Contract Audit (`apps/api/src/modules/media/`)

Source inspection of `apps/api/src/modules/media/controllers/media.controller.ts`:

| Endpoint | Method | Auth Required | Request Body / Params | Response Shape | Status Codes |
| :--- | :---: | :---: | :--- | :--- | :---: |
| `/api/v1/media/upload-signature` | `POST` | Bearer JWT (Active, Verified) | `{ folder?: string }` | `{ timestamp: number, signature: string, folder: string }` | `200 OK`, `401`, `403` |
| `/api/v1/media` | `POST` | Bearer JWT (Active, Verified) | `RegisterMediaDto` | `MediaEntity` | `201 Created`, `400`, `401`, `403`, `409` |
| `/api/v1/media/:id` | `GET` | Public | `id: string` (Path param) | `MediaEntity` | `200 OK`, `404 Not Found` |
| `/api/v1/media/:id` | `DELETE` | Bearer JWT (Active) | `id: string` (Path param) | *Empty* | `204 No Content`, `401`, `403`, `404` |

### `RegisterMediaDto` Schema:
- `cloudinaryPublicId`: `string` (Required, unique)
- `secureUrl`: `string` (Required, valid HTTPS URL)
- `resourceType`: `'image' | 'video' | 'raw'` (Required, default `'image'`)
- `format`: `string` (Optional, e.g., `'jpg'`, `'png'`, `'webp'`)
- `width`: `number` (Optional)
- `height`: `number` (Optional)
- `fileSize`: `number` (Optional, in bytes)
- `purpose`: `'avatar' | 'cover' | 'content'` (Optional, default `'content'`)

### `MediaEntity` Response Shape:
```typescript
export interface MediaItem {
  id: string;
  uploaderId: string;
  cloudinaryPublicId: string;
  secureUrl: string;
  resourceType: 'image' | 'video' | 'raw';
  format: string | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  purpose: 'avatar' | 'cover' | 'content';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

---

## 6. Database Contract Audit (`docs/DATABASE_SCHEMA.sql`)

From `docs/DATABASE_SCHEMA.sql` (Table 7: `media`):
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `uploader_id`: `UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT`
- `cloudinary_public_id`: `VARCHAR(255) NOT NULL UNIQUE`
- `secure_url`: `TEXT NOT NULL`
- `resource_type`: `VARCHAR(20) NOT NULL DEFAULT 'image'`
- `format`: `VARCHAR(20) NULL`
- `width`: `INTEGER NULL`
- `height`: `INTEGER NULL`
- `file_size`: `BIGINT NULL`
- `purpose`: `VARCHAR(20) NOT NULL DEFAULT 'content'` (`CHECK (purpose IN ('avatar', 'cover', 'content'))`)
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `deleted_at`: `TIMESTAMPTZ NULL` (Soft delete)

---

## 7. Frontend Architecture Plan

```
apps/web/
├── types/
│   └── media.ts                     # MediaItem, UploadSignatureResponse, RegisterMediaDto
├── lib/
│   ├── media/
│   │   ├── media-service.ts         # REST client for signature, registration, retrieval, delete
│   │   ├── upload-client.ts         # Direct HTTPS multipart uploader to Cloudinary endpoint
│   │   └── use-media.ts             # TanStack Query mutation hooks (useUploadMedia, useDeleteMedia)
│   └── query/
│       └── keys.ts                  # Register queryKeys.media
└── components/
    └── media/
        ├── MediaUploader.tsx        # Drag-and-drop / file picker with progress bar & error states
        ├── CoverImagePicker.tsx     # PostStudio cover image selection & preview
        └── AvatarPicker.tsx         # EditProfileModal avatar image upload & preview
```

---

## 8. In-Scope vs. Out-of-Scope

### In-Scope:
- [x] Client presigned signature generation via `mediaService.getUploadSignature()`.
- [x] Direct client-to-Cloudinary upload helper (`uploadClient.uploadToCloudinary()`).
- [x] Backend media metadata registration via `mediaService.registerMedia()`.
- [x] Single composite mutation hook `useUploadMedia()` handling signature -> upload -> registration.
- [x] Generic `MediaUploader` component with preview, progress indicator, and clear button.
- [x] Integration into `PostStudio.tsx` (`CoverImagePicker`) to assign `coverMediaId`.
- [x] Integration into `EditProfileModal.tsx` (`AvatarPicker`) to assign `avatarMediaId`.
- [x] Soft deletion via `mediaService.deleteMedia()`.
- [x] File type validation (JPEG, PNG, WebP, GIF) and size capping (Max 10MB).
- [x] Unit test suites for services, upload client, and UI components.

### Out-of-Scope:
- ❌ Video transcoding / streaming pipelines
- ❌ Server-side image manipulation / crop canvas libraries
- ❌ Standalone media asset browser / file manager page (deferred)
- ❌ Modifying backend source code or database schemas

---

## 9. Direct Upload Flow & Signature Architecture

```
[ Frontend Client ]
        │
        │ 1. POST /api/v1/media/upload-signature { folder: 'posts' }
        ▼
[ NestJS Backend ] ────► Computes HMAC SHA256 Signature
        │
        │ 2. Returns { timestamp, signature, folder }
        ▼
[ Frontend Client ]
        │
        │ 3. POST FormData to https://api.cloudinary.com/v1_1/<cloud_name>/image/upload
        ▼
[ Cloudinary CDN ] ────► Validates signature & stores binary
        │
        │ 4. Returns { public_id, secure_url, format, width, height, bytes }
        ▼
[ Frontend Client ]
        │
        │ 5. POST /api/v1/media { cloudinaryPublicId, secureUrl, ... }
        ▼
[ NestJS Backend ] ────► Inserts record into `media` table (Table 7)
        │
        │ 6. Returns canonical MediaItem (UUID `id`)
        ▼
[ PostStudio / EditProfileModal ] ── Assigned to `coverMediaId` / `avatarMediaId`
```

---

## 10. Component & Route Integration

1. **`PostStudio.tsx`**:
   - Replace manual `coverMediaId` text input with `<CoverImagePicker value={coverMediaId} onChange={setCoverMediaId} />`.
   - Displays uploaded banner preview with replace/remove action.
2. **`EditProfileModal.tsx`**:
   - Mount `<AvatarPicker value={avatarMediaId} currentAvatarUrl={profile.avatarMediaId} onChange={setAvatarMediaId} />`.
   - Displays round avatar preview with upload trigger.

---

## 11. Types & Data Models (`apps/web/types/media.ts`)

```typescript
export interface UploadSignatureResponse {
  timestamp: number;
  signature: string;
  folder: string;
}

export interface RegisterMediaDto {
  cloudinaryPublicId: string;
  secureUrl: string;
  resourceType?: 'image' | 'video' | 'raw';
  format?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  purpose?: 'avatar' | 'cover' | 'content';
}

export interface MediaItem {
  id: string;
  uploaderId: string;
  cloudinaryPublicId: string;
  secureUrl: string;
  resourceType: 'image' | 'video' | 'raw';
  format: string | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  purpose: 'avatar' | 'cover' | 'content';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

---

## 12. TanStack Query Strategy & Query Keys

- Query Keys:
  - `queryKeys.media.all`: `['media']`
  - `queryKeys.media.detail(id)`: `['media', 'detail', id]`
- Mutations:
  - `useUploadMedia()`: Handles signature acquisition, direct upload, and backend registration in a unified async pipeline with progress tracking.
  - `useDeleteMedia()`: Executes soft deletion and invalidates media cache.

---

## 13. Authentication, Authorization & Security Boundaries

- Direct upload signatures and registration endpoints require valid Bearer JWT (`JwtAuthGuard`, `AccountStatusGuard`, `EmailVerificationGuard`).
- Cloudinary API Secret is NEVER exposed to the frontend; only temporary timestamps and HMAC SHA256 signatures are transmitted.
- Client validates MIME types (`image/jpeg`, `image/png`, `image/webp`, `image/gif`) and enforces maximum size (10 MB).
- Backend validates HTTPS URL formats on `RegisterMediaDto`.

---

## 14. Accessibility (WCAG 2.2 AA)

- Accessible file input triggers with hidden `<input type="file">` and associated `<label>`.
- Keyboard accessible drop-zone (`Enter` / `Space` trigger).
- Screen-reader progress announcements (`aria-live="polite"` during upload).
- Clear error alerts when invalid file formats or oversized files are rejected.
- Remove / Replace buttons with descriptive `aria-label` attributes.

---

## 15. Responsive Design

- Mobile (<768px): Stacked upload area with touch-friendly 44x44px button triggers.
- Desktop (>=1024px): Drag-and-drop drop-zone with visual hover feedback.

---

## 16. Error, Loading & Empty States

- **Idle / Empty**: Dashed drop-zone with cloud upload icon and format instructions.
- **Uploading**: Linear progress indicator with percentage and spinner.
- **Success**: Image preview with replace and remove actions.
- **Error**: Inline error message with retry trigger (e.g., *"File exceeds 10MB limit"*, *"Upload failed, please try again"*).

---

## 17. Testing Strategy

Vitest test suites in `apps/web/tests/media/`:
1. `media-service.test.ts`: Tests `getUploadSignature`, `registerMedia`, `getMediaById`, and `deleteMedia`.
2. `upload-client.test.ts`: Tests direct Cloudinary upload multipart request and error handling.
3. `MediaUploader.test.tsx`: Tests drag-and-drop, file type validation, size limits, and progress display.
4. `CoverImagePicker.test.tsx`: Tests cover image assignment and removal in Studio flow.
5. `AvatarPicker.test.tsx`: Tests avatar image upload in Profile edit flow.

---

## 18. Acceptance Criteria

- **AC-F12-001**: `mediaService.getUploadSignature` fetches valid presigned payload from backend.
- **AC-F12-002**: `uploadClient.uploadToCloudinary` successfully uploads binary image and receives CDN metadata.
- **AC-F12-003**: `mediaService.registerMedia` registers metadata with backend and returns canonical `MediaItem` UUID.
- **AC-F12-004**: `CoverImagePicker` allows uploading and previewing post cover banner in `PostStudio`.
- **AC-F12-005**: `AvatarPicker` allows uploading and previewing avatar in `EditProfileModal`.
- **AC-F12-006**: Files > 10MB or invalid MIME types are rejected on the client before upload.
- **AC-F12-007**: All 123+ Vitest tests continue to pass, typecheck passes with 0 errors, and production build succeeds.

---

## 19. Planned File Changes

### Files to Create:
- `apps/web/types/media.ts`
- `apps/web/lib/media/media-service.ts`
- `apps/web/lib/media/upload-client.ts`
- `apps/web/lib/media/use-media.ts`
- `apps/web/components/media/MediaUploader.tsx`
- `apps/web/components/media/CoverImagePicker.tsx`
- `apps/web/components/media/AvatarPicker.tsx`
- `apps/web/tests/media/media-service.test.ts`
- `apps/web/tests/media/upload-client.test.ts`
- `apps/web/tests/media/MediaUploader.test.tsx`
- `apps/web/tests/media/CoverImagePicker.test.tsx`
- `apps/web/tests/media/AvatarPicker.test.tsx`

### Files to Modify:
- `apps/web/lib/query/keys.ts` (Register `queryKeys.media`)
- `apps/web/components/studio/PostStudio.tsx` (Mount `CoverImagePicker`)
- `apps/web/components/profile/EditProfileModal.tsx` (Mount `AvatarPicker`)

### Files That Must NOT Be Modified:
- `apps/api/**` (0 backend modifications)
- `docs/DATABASE_SCHEMA.sql` (0 database modifications)

---

## 20. Implementation Sequence

1. Define TypeScript interfaces in `apps/web/types/media.ts`.
2. Register query keys in `apps/web/lib/query/keys.ts`.
3. Implement API service in `apps/web/lib/media/media-service.ts`.
4. Implement Cloudinary direct upload client in `apps/web/lib/media/upload-client.ts`.
5. Implement TanStack Query mutation hooks in `apps/web/lib/media/use-media.ts`.
6. Implement `MediaUploader.tsx` base component.
7. Implement `CoverImagePicker.tsx` and integrate into `PostStudio.tsx`.
8. Implement `AvatarPicker.tsx` and integrate into `EditProfileModal.tsx`.
9. Implement comprehensive Vitest test suites in `apps/web/tests/media/`.
10. Execute validation suite (`npm run test`, `npm run typecheck`, `npm run build`).

---

## 21. Risk Register

| Risk ID | Risk Description | Severity | Probability | Mitigation Strategy | Blocking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R-F12-01** | Cloudinary direct upload CORS or network failure | Medium | Low | Detailed error handling with retry prompt in UI | No |
| **R-F12-02** | Oversized file upload attempt | Low | Medium | Client-side size inspection before triggering network requests | No |
| **R-F12-03** | Cloudinary credentials / secret exposure | Critical | Low | API Secret strictly confined to backend; frontend only receives HMAC signature | No |
| **R-F12-04** | Studio or Profile form desynchronization | Medium | Low | `onChange` propagates canonical UUID `media.id` to parent form state | No |

---

## 22. Regression Protection

- All changes in `PostStudio.tsx` and `EditProfileModal.tsx` are additive.
- All existing 123 unit tests across F2–F11.1 must remain 100% green.

---

## 23. Final Recommendation & Status

```text
============================================================
PHASE F12.0 — PRE-IMPLEMENTATION PLAN
============================================================

Mode: STRICT READ-ONLY
Implementation: NOT AUTHORIZED

Repository Investigation: COMPLETE
Previous Baselines: FROZEN (F2, F3.1, F4.1, F5.1, F6.1, F7.1, F8.1, F9.1, F10.1, F11.1)
Backend Contract: VERIFIED (POST /upload-signature, POST /media, GET /media/:id, DELETE /media/:id)
Database Contract: VERIFIED (Table 7: media)
Frontend Architecture: VERIFIED (MediaUploader, CoverImagePicker, AvatarPicker)
Security: VERIFIED (Presigned HMAC direct uploads, 0 secret exposure)
Accessibility: VERIFIED (WCAG 2.2 AA compliant, accessible file inputs)
Scope: FINALIZED (Media Upload & Asset Management)

FINAL STATUS:
READY FOR HUMAN APPROVAL

STOP.
DO NOT IMPLEMENT CODE.
DO NOT MODIFY FILES.
DO NOT FIX FINDINGS.
DO NOT START CODING.

AWAIT HUMAN APPROVAL.
============================================================
```
