# Editorial Workflow Specification v1.0

## Unified flow

```text
INGESTED -> ANALYZED -> AI_DRAFT -> EDITOR_REVIEW -> APPROVED -> PUBLISHED
                                    └-> NEEDS_REVISION
                              any -> FAILED
```

## Ownership

- `posts` owns canonical published content.
- `series` owns series and chapter ordering.
- `moderation` owns policy enforcement.
- `audit` records privileged actions across all stages.

## Review requirements

Before approval, the reviewer must be able to inspect the original source, extracted content, AI output, claims, source references, prompt/model metadata and revision history.

## Permissions

- `MODERATOR`: moderation only.
- `ADMIN`: editorial review and content operations.
- `SUPER_ADMIN`: configuration, provider settings and role governance.

No frontend state is authoritative for these permissions.
