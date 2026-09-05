# Architecture overview

## Scope

Finance Community is a knowledge and learning platform with community content, authentication, taxonomy, media, comments, reactions, notifications, moderation, administration, market data and an AI editorial module.

## Core shape

```text
Next.js web app
        ↓
NestJS modular monolith
        ↓
PostgreSQL
        ├── Cloudinary (media)
        └── optional Redis/worker boundary for scale-sensitive jobs
```

The modular monolith is the current and default architecture. New modules should have clear controllers, application services, repositories and tests without introducing distributed services prematurely.

## Principles

1. Correctness and data integrity before feature breadth.
2. Authentication and authorization are enforced at the backend boundary.
3. Financial data must expose freshness and source; fallback data is never labelled live.
4. Long-running or retryable work belongs behind a job boundary.
5. Human review is required before AI-generated content is published.
6. Every sensitive moderation or administration action is auditable.
7. Server state belongs to TanStack Query; local UI state belongs to component state or Zustand.

## Boundaries

| Boundary | Responsibility |
| --- | --- |
| Web | Rendering, interaction, form validation and server-state presentation |
| API | Authentication, authorization, validation, orchestration and response contracts |
| Domain modules | Posts, learning, users, moderation, notifications, market and AI behavior |
| Repositories | Database access and query-specific persistence |
| PostgreSQL | Durable state, constraints and transactions |
| External providers | Market feeds, OAuth, Cloudinary and Gemini; always isolated behind adapters |
