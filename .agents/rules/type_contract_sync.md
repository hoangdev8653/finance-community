# Frontend-Backend Type & API Contract Synchronization Rule

Ensure absolute end-to-end type safety between the NestJS backend and Next.js frontend to prevent runtime crashes and schema drift.

---

## 1. Synchronization Requirement

Whenever a Backend Endpoint, DTO, Entity, or Response payload in `apps/api` is created, updated, or removed:
1. **Frontend Types**: Immediately update the corresponding TypeScript interface in `apps/web/types/` (e.g. `user.ts`, `post.ts`, `comment.ts`, `series.ts`, `category.ts`).
2. **API Client & Hooks**: Update any React Query hooks and API client functions in `apps/web/lib/` to reflect new parameters, payload schemas, and response types.

---

## 2. Naming & Case Conventions

1. Use consistent **camelCase** for all JSON properties exchanged over HTTP (e.g. `coverImageUrl`, `displayName`, `createdAt`, `isPublished`).
2. Do not mix `snake_case` in frontend state unless strictly interacting with raw database drivers.
3. Keep Nullability explicit: If a backend property can be null or undefined (e.g., `bio?: string | null`), represent it precisely in frontend types.
