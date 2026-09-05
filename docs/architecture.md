# Finance Community Architecture

This directory is the architecture home for Finance Community. Start here, then use the audit and decision records for detail.

## Documents

| Document | Purpose |
| --- | --- |
| [Overview](architecture/overview.md) | Scope, principles, boundaries and ownership |
| [Current state](architecture/current-state.md) | What is implemented today and known gaps |
| [Target state](architecture/target-state.md) | Desired production architecture |
| [Roadmap](architecture/roadmap.md) | Ordered engineering work and exit criteria |
| [Architecture audit](architecture/ARCHITECTURE_AUDIT.md) | Detailed audit, risks and long-form recommendations |

## Architecture decisions

- [ADR-001: Modular monolith](architecture/decisions/ADR-001-modular-monolith.md)
- [ADR-002: Authentication boundary](architecture/decisions/ADR-002-authentication-boundary.md)
- [ADR-003: Financial data reliability](architecture/decisions/ADR-003-financial-data-reliability.md)

## Document rules

- “Current state” must be backed by code, tests or deployment configuration.
- “Target state” is a proposal and must not be described as implemented.
- Each material decision gets an ADR with status, rationale and consequences.
- Task execution is tracked in [`TASK_QUEUE.md`](../TASK_QUEUE.md); this directory explains why, not who is currently assigned.

Last reviewed: 2026-09-05
