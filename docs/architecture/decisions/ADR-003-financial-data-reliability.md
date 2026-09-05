# ADR-003: Financial data reliability

- Status: Proposed
- Date: 2026-09-05

## Decision

Market responses must distinguish provider data from cached or baseline data. A fallback snapshot is allowed for resilience but must be marked `STALE` and include timestamps; it must never be presented as live.

## Required response metadata

```ts
{
  source: 'YAHOO_FINANCE' | 'BINANCE' | 'CACHE' | 'BASELINE',
  status: 'LIVE' | 'STALE' | 'UNAVAILABLE',
  fetchedAt: string | null,
  staleAt: string | null,
}
```

## Consequences

The API, frontend ticker and tests must agree on these fields. Provider failure, stale-cache and complete-unavailability scenarios are release-blocking tests.
