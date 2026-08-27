# Finance Community — Content Architecture Hardening Package

This folder contains the complete implementation specification for the next architecture-hardening phase of `hoangdev8653/finance-community`.

## Files

- `00_CONTENT_ARCHITECTURE_HARDENING_OVERVIEW.md` — overall goals and target architecture
- `01_TAXONOMY_MODEL.md` — Domain → Category → Topic → Tag model
- `02_POST_TOPIC_RELATIONSHIP.md` — required many-to-many post/topic design
- `03_NAVIGATION_AND_DOMAIN_UX.md` — header, domain routing, and learning navigation
- `04_NEWS_VS_LEARNING_ARCHITECTURE.md` — separate News and Learning editorial engines
- `05_REPOSITORY_DOCUMENTATION_SYNC.md` — documentation/rules that must be synchronized
- `06_IMPLEMENTATION_PLAN_AND_CHECKLIST.md` — phased implementation and QA checklist
- `07_CODEX_EXECUTION_PROMPT.md` — ready-to-use Codex implementation prompt

## Recommended Use

Use `07_CODEX_EXECUTION_PROMPT.md` as the primary prompt for Codex.

Have Codex perform the repository audit first and return an architecture impact report before it executes broad code changes.

Use the other files as the detailed specification and acceptance criteria.
