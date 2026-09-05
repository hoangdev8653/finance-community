# ADR-001: Keep a modular monolith

- Status: Accepted
- Date: 2026-09-05

## Decision

Keep one NestJS deployable with explicit domain modules and PostgreSQL as the system of record. Use adapters and queue boundaries internally before considering separate services.

## Rationale

The product has many related domains but does not yet require independent scaling or deployment. A monolith keeps transactions, local development and debugging simple.

## Consequences

Modules must avoid cross-domain database shortcuts and expose application-level interfaces. A future service extraction should follow a measured scaling or ownership need, not a technology preference.
