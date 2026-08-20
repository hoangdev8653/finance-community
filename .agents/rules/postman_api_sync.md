# Backend API & Postman Synchronization Rule

When creating, updating, or deleting any Backend endpoint, Controller, DTO, or Module in `apps/api`, you MUST ALWAYS review and update the Postman Collection file at `docs/finance_community_postman_collection.json`.

---

## 1. Core Synchronization Trigger

Whenever you:
- **Add a new endpoint** (`@Get`, `@Post`, `@Patch`, `@Put`, `@Delete`) in any NestJS controller.
- **Modify an existing endpoint** (change route path, URL params, query params, DTO/request body, or auth requirement).
- **Delete/Deprecate an endpoint**.

You **MUST** immediately synchronize `docs/finance_community_postman_collection.json` in the same task/turn.

---

## 2. Naming Standards for Postman Requests

1. **NO redundant HTTP method prefix** in request names (Postman already renders colored method badges `GET`, `POST`, `PATCH`, `DELETE`).
   - ❌ Incorrect: `GET /api/v1/users/me` or `GET Get Profile`
   - ✅ Correct: `Get Current User Profile`
2. **Use Clear Action + Resource format**:
   - `Register New Account`
   - `Login with Email & Password`
   - `List Posts (Feed & Filter)`
   - `Get Post Details by Slug`
   - `Create New Post`
   - `Update Existing Post`
   - `Delete Post`
   - `Toggle Post Like`
   - `Submit Content Report`
   - `Change User Status (Active/Suspended/Banned)`

---

## 3. Configuration Requirements for Each Postman Request

1. **URL Structure**:
   - Use `{{baseUrl}}` variable (e.g. `{{baseUrl}}/api/v1/posts/:contentType/:slug`).
   - Include all relevant query parameters with helpful descriptions and defaults.
2. **Authentication**:
   - For public endpoints (decorated with `@Public()`), explicitly set `"auth": { "type": "noauth" }`.
   - For authenticated endpoints, inherit collection bearer token (`{{token}}`).
3. **Request Body**:
   - For `POST`/`PATCH`/`PUT` requests, include realistic, formatted JSON payload matching the controller's DTO validation schema.
4. **Folder Organization**:
   - Place each request into its corresponding numbered domain folder (e.g. `1. Authentication`, `2. Users & Profiles`, `3. Posts & Articles`, `4. Categories & Tags`, `5. Educational Series`, `6. Comments & Discussions`, `7. Reactions & Social`, `8. Notifications`, `9. Media & Uploads`, `10. Reports & Moderation`, `11. Admin & Governance`).
