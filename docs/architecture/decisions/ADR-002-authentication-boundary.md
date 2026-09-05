# ADR-002: Authentication boundary

- Status: Proposed
- Date: 2026-09-05

## Decision to make

Choose one canonical access-token and refresh/revocation lifecycle across local JWT, Supabase JWKS and OAuth provisioning. The backend remains the authority for authorization and account status.

## Constraints

- Tokens and secrets must never be logged or persisted in frontend storage without an explicit threat-model decision.
- Logout, expiry, rotation, revocation and stolen-token behavior require tests.
- OAuth providers may provision users, but must not bypass backend permissions.

## Next action

Record the selected lifecycle and remove or isolate unused alternate paths before production release.
