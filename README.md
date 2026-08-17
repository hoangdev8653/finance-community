# Finance Community --- Engineering Specification

Version: 1.0.0\
Status: Architecture planning / pre-implementation

## Purpose

This repository contains the approved engineering foundation for a
scalable finance knowledge and community platform.

The immediate goal is **not to start feature coding blindly**.
Antigravity must first understand and respect these documents before
creating application code.

## Current technology direction

### Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   React Hook Form
-   Zod
-   TanStack Query

### Backend

-   Node.js
-   NestJS
-   TypeScript
-   REST API
-   JWT access token + refresh token
-   Google OAuth
-   Facebook OAuth
-   Email/password authentication
-   Email verification

### Data / Infrastructure

-   PostgreSQL
-   Cloudinary for media
-   Vercel for frontend
-   Backend deployment target can be VPS / Render / Railway initially
-   Redis, queues and search infrastructure are future scaling options

## Architecture principles

1.  Frontend and backend are separate applications.
2.  Business logic belongs in backend application/domain layers, not
    controllers.
3.  Frontend must never contain secrets.
4.  Database schema must be treated as a contract.
5.  New features should extend existing domains before creating
    unnecessary new modules.
6.  APIs are versioned from the beginning.
7.  Security and authorization are server-side responsibilities.
8.  Media binaries are stored in Cloudinary; PostgreSQL stores media
    metadata.
9.  Architecture should support future horizontal scaling without
    requiring a rewrite.
10. Antigravity must read this documentation before modifying
    architecture or generating major modules.

## Current product areas

-   Authentication
-   User & Profile
-   Series
-   Community
-   Categories
-   Tags
-   Comments
-   Reactions
-   Follow
-   Search
-   Media
-   Notifications
-   Moderation
-   Administration
-   Analytics
-   System / Feature Flags
-   Audit / Logging

## Important status

The database ERD is intentionally **not finalized yet**.

The next engineering phase is:

> Database Architecture & ERD v1.0

Do not invent database tables and treat them as approved architecture
before that phase is completed.
