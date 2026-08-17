# PHASE F1 — FRONTEND ROUTE MAP & SPECIFICATION

**Target**: Frontend Page Structure & API Endpoint Alignment  
**Mode**: STRICT ARCHITECTURAL SPECIFICATION  
**Date**: 2026-08-15  
**Status**: APPROVED & LOCKED FOR FRONTEND IMPLEMENTATION  

---

## 1. Route Map Overview

The Frontend route hierarchy maps directly to the 48 approved REST API endpoints established in `docs/PHASE_3.4_API_CONTRACT_FINAL_AUDIT.md`.

---

## 2. Public Routes (Unauthenticated Visitors Allowed)

| Route Path | Page Name & Purpose | Auth Requirement | Required Permission | Major UI Components | Primary API Endpoints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | **Home Feed**<br>Aggregated post & series feed | Public | None | `Header`, `Sidebar`, `PostCard`, `SeriesCard`, `RightWidgetPanel` | `GET /api/v1/posts`<br>`GET /api/v1/series`<br>`GET /api/v1/categories` |
| `/posts` | **Post Index**<br>Browsable community posts | Public | None | `PostFilterBar`, `PostCard`, `Pagination` | `GET /api/v1/posts` |
| `/posts/[slug]` | **Post Detail**<br>Article reader page | Public / Author | None (Author for draft) | `PostHeader`, `PostContent`, `ReactionsBar`, `CommentThread`, `AuthorCard` | `GET /api/v1/posts/slug/:slug`<br>`GET /api/v1/posts/:postId/comments`<br>`GET /api/v1/posts/:id/reactions` |
| `/series` | **Series Index**<br>Curated educational series | Public | None | `SeriesGrid`, `SeriesCard`, `CategoryBadge` | `GET /api/v1/series` |
| `/series/[id]` | **Series Detail**<br>Series overview & post chapters | Public | None | `SeriesHeader`, `PostListItem`, `AuthorCard` | `GET /api/v1/series/:id`<br>`GET /api/v1/series/:id/posts` |
| `/categories` | **Category Index** | Public | None | `CategoryGrid`, `CategoryCard` | `GET /api/v1/categories` |
| `/categories/[id]`| **Category Feed** | Public | None | `CategoryHeader`, `PostCard`, `SeriesCard` | `GET /api/v1/categories/:id`<br>`GET /api/v1/posts?categoryId=:id` |
| `/tags` | **Tag Index** | Public | None | `TagCloud`, `TagSearchBar` | `GET /api/v1/tags` |
| `/tags/[id]` | **Tag Feed** | Public | None | `TagHeader`, `PostCard` | `GET /api/v1/tags/:id`<br>`GET /api/v1/posts?tagId=:id` |
| `/users/[username]`| **Public User Profile** | Public | None | `ProfileHeader`, `ProfileStats`, `FollowButton`, `UserPostTabs` | `GET /api/v1/users/:username`<br>`GET /api/v1/users/:id/followers`<br>`GET /api/v1/users/:id/following` |
| `/login` | **Sign In** | Public (Guest) | None | `LoginForm`, `OAuthButtonGroup` | `POST /api/v1/auth/login`<br>`GET /api/v1/auth/google` |
| `/register` | **Sign Up** | Public (Guest) | None | `RegisterForm`, `OAuthButtonGroup` | `POST /api/v1/auth/register` |
| `/forgot-password`| **Password Recovery** | Public (Guest) | None | `ForgotPasswordForm` | `POST /api/v1/auth/forgot-password` |

---

## 3. Authenticated Member Routes (Protected)

| Route Path | Page Name & Purpose | Auth Requirement | Required Permission | Major UI Components | Primary API Endpoints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard` | **Personalized Feed**<br>Following posts & activity | `JwtAuthGuard` | Active Account | `PersonalFeedTabs`, `PostCard`, `ActivityStream` | `GET /api/v1/posts?feed=following` |
| `/posts/create` | **Post Creation Studio** | `JwtAuthGuard` | Active + Verified | `PostEditor`, `MediaUploader`, `CategorySelect`, `TagInput` | `POST /api/v1/media/signature`<br>`POST /api/v1/media`<br>`POST /api/v1/posts` |
| `/posts/[id]/edit`| **Post Edit Studio** | `JwtAuthGuard` | Author / Mod | `PostEditor`, `MediaUploader` | `GET /api/v1/posts/:id`<br>`PATCH /api/v1/posts/:id` |
| `/series/create` | **Series Creation** | `JwtAuthGuard` | Active + Verified | `SeriesForm`, `PostSelector` | `POST /api/v1/series` |
| `/series/[id]/edit`| **Series Edit** | `JwtAuthGuard` | Author | `SeriesForm`, `ReorderPostList` | `PATCH /api/v1/series/:id` |
| `/notifications`| **Notifications Center** | `JwtAuthGuard` | Active Account | `NotificationList`, `NotificationItem`, `MarkAllReadBtn` | `GET /api/v1/notifications`<br>`PATCH /api/v1/notifications/:id/read`<br>`POST /api/v1/notifications/read-all` |
| `/settings/profile`| **Profile Settings** | `JwtAuthGuard` | Active Account | `AvatarUploader`, `ProfileForm`, `AccountStatusCard` | `GET /api/v1/users/me`<br>`PATCH /api/v1/users/me` |
| `/settings/security`| **Security Settings** | `JwtAuthGuard` | Active Account | `ChangePasswordForm`, `OAuthConnections` | `POST /api/v1/auth/change-password` |

---

## 4. Admin & Moderation Routes (Privileged RBAC)

| Route Path | Page Name & Purpose | Auth Requirement | Required Permission | Major UI Components | Primary API Endpoints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/admin/moderation/reports` | **Moderation Queue**<br>Reported posts/comments | `JwtAuthGuard` | `moderation:manage` | `ModerationTable`, `ReportCard`, `ActionModal` | `GET /api/v1/moderation/reports`<br>`POST /api/v1/moderation/actions` |
| `/admin/users` | **User Management**<br>Account status & roles | `JwtAuthGuard` | `admin:full` | `UserManagementTable`, `StatusDropdown`, `RoleAssignModal` | `GET /api/v1/admin/users`<br>`PATCH /api/v1/admin/users/:id/status`<br>`POST /api/v1/admin/roles/assign` |
| `/admin/settings` | **System Settings** | `JwtAuthGuard` | `admin:full` | `SystemSettingsForm`, `SettingGroup` | `GET /api/v1/admin/settings`<br>`PATCH /api/v1/admin/settings/:key` |
| `/admin/feature-flags` | **Feature Flags Control** | `JwtAuthGuard` | `admin:full` | `FeatureFlagTable`, `Switch` | `GET /api/v1/admin/feature-flags`<br>`PATCH /api/v1/admin/feature-flags/:key` |
| `/admin/audit-logs` | **Audit Logs Reader** | `JwtAuthGuard` | `admin:full` | `AuditLogTable`, `LogDetailModal`, `FilterPanel` | `GET /api/v1/admin/audit-logs` |
