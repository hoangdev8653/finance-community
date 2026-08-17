# Domain Architecture v1.0

## 1. Domain map

``` text
SYSTEM
|
+-- Authentication
|
+-- User & Profile
|
+-- Content
|   +-- Series
|   +-- Community
|   +-- Categories
|   +-- Tags
|
+-- Comments
|
+-- Reactions
|
+-- Follow
|
+-- Search
|
+-- Media
|
+-- Notifications
|
+-- Moderation
|
+-- Administration
|
+-- Analytics
|
+-- System
|
+-- Audit / Logging
```

## 2. Authentication domain

Responsibilities: - registration - login - logout - email verification -
password reset - Google OAuth - Facebook OAuth - access token - refresh
token - session lifecycle

Does not own: - profile content - posts - comments

## 3. User & Profile domain

Responsibilities: - user identity - username - display name - avatar
reference - biography - account status - role association - public
profile

Future: - badges - reputation - contribution score

## 4. Content domain

The content domain is the central publishing domain.

### Series

Admin-authored knowledge.

### Community

Member-authored discussion.

Shared infrastructure should be reused where semantics are genuinely the
same.

## 5. Comments domain

Responsibilities: - create comment - edit comment - delete comment -
reply - report comment - comment reactions - moderation state

The design should support nested replies without forcing unlimited-depth
rendering complexity.

## 6. Reactions domain

The data model should not assume that the only possible reaction forever
is `LIKE`.

MVP can expose only Like.

Future reactions may be enabled without redesigning the entire
interaction architecture.

## 7. Follow domain

Potential follow targets: - users - categories - tags - series

The exact initial scope will be decided during database/API design.

## 8. Search domain

Searchable resources may include: - Series - Community posts - users -
categories - tags

Initial implementation can use PostgreSQL capabilities.

Search should be isolated behind a service/provider boundary so a
dedicated search engine can be introduced later.

## 9. Media domain

Responsibilities: - upload authorization - media metadata - ownership -
Cloudinary public ID - image dimensions - file type/size validation -
deletion lifecycle

## 10. Notification domain

Potential events: - comment on post - reply - reaction - follow -
mention - moderation event - system announcement

Initial delivery: - in-app

Future: - email - push

## 11. Moderation domain

Responsibilities: - reports - moderation cases - moderation actions -
content hiding - warnings - restrictions - bans - audit trail

## 12. Administration domain

Responsibilities: - dashboard - users - content - categories - tags -
reports - moderation - system configuration

Role model should support at least:

``` text
MEMBER
MODERATOR
ADMIN
SUPER_ADMIN
```

Exact permission matrix is to be defined later.

## 13. Analytics domain

Track meaningful events such as: - page view - content view - reaction -
comment - share - registration - traffic source

Do not make analytics tightly coupled to business logic.

## 14. System domain

Responsibilities: - feature flags - system configuration - scheduled
jobs - email templates - runtime settings

## 15. Audit domain

Track security-sensitive or administrative operations: - actor -
action - target - timestamp - metadata - reason where applicable

Audit logs must not be casually deleted by ordinary users.
