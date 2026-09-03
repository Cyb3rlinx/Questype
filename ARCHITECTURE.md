# Interactive Archetype Journey — architecture

Status: pre-implementation design, MVP v1. First delivery implements Phase 1; later-phase contracts are explicitly identified in IMPLEMENTATION_PLAN.md. No graphical direction or fantasy art style is selected.

## Repository inspection

The workspace was empty on 2026-09-03: no application, package manifest, database, Git history, or applicable AGENTS.md. There is no existing architecture to preserve. The supplied master specification is the product source of truth.

## Boundaries

Use TypeScript throughout, Next.js App Router and React for the Phase 2 web application, PostgreSQL for durable state, and Zod for input/output contracts. Phase 1 is a runnable, framework-independent domain package and database foundation. A website scaffold and Sites deployment belong to the working web application, not this incomplete foundation; no site is published in Phase 1.

Dependency direction:

```text
React presentation -> server application services -> domain functions
                                  |                       |
                         repository/provider ports   versioned content
                                  |
                    PostgreSQL / AI / image / PDF / storage adapters
```

Domain code cannot import React, Next.js, database drivers, environment variables, clocks, or random generators. Explicit inputs include the content version, scoring version, answer sequence, identity, result ID, and completion timestamp. Thus the same input produces the same result. An application service supplies operational IDs and timestamps. The AI sees an already calculated profile and cannot change its numbers or ranking.

## Proposed structure

```text
ARCHITECTURE.md, PRODUCT_SPEC.md, SCORING_SPEC.md
DATABASE_SCHEMA.md, AI_SPEC.md, JOURNEY_V1.md, IMPLEMENTATION_PLAN.md
src/
  domain/
    types.ts                    stable keys and Zod contracts
    registry/                   archetypes and psychological dimensions
    content/                    immutable journey releases and validation
    scoring/                    calibration, scoring, ranking, shadow, profile
    character/                  approved naming library
    journey/                    pure session transitions and public scene DTOs
  ai/
    contracts.ts                interpretation validation, no numeric fields
    prompts/                    versioned interpretation / social / image prompts
  reports/                      report content contract (renderer in Phase 7)
  sharing/                      public projection and platform card contracts
  providers/                    text, image, storage, PDF, social interfaces
  database/                     migration runner, seed adapter
  app/                          Phase 2 Next.js routes and server-only wiring
  application/                  Phase 2 session/result orchestration
scripts/                        content validation, 10,000-journey simulation
database/migrations/            ordered PostgreSQL SQL migrations
tests/                          pure-domain and actual PostgreSQL-engine tests
artifacts/                      reproducible balancing report and example profile
```

## Session and result lifecycle (Phase 2 onward)

1. `/start` accepts an optional name and `character_gender` (`man` or `woman`). Anonymous use is the default.
2. The server issues a high-entropy opaque capability in an HttpOnly, SameSite cookie; the database stores only its hash. Never put the capability in a result URL, logs, or localStorage.
3. localStorage may contain a versioned session pointer and non-sensitive progress hint. The server is authoritative. Recovery on the same browser uses the cookie, even if localStorage is cleared. Losing both requires a new anonymous journey; do not promise accountless cross-device recovery.
4. `GET /api/session` returns current progress and sanitized scene content, never score effects, shadow rules, or private profiles belonging to another session.
5. `POST /api/session/answers` checks origin, ownership, content version, scene order and choice membership. A transaction locks the session, inserts an answer once, and advances the cursor. A same-choice retry is idempotent; conflicting writes fail.
6. Completion freezes the answer sequence and profile. Persist the deterministic result before calling providers. Processing stages have independent status, timeout, bounded retry, and idempotency keys.
7. AI or image failure never discards answers. A labelled deterministic interpretation and labelled mock image mode keep development usable. A real result can retry failed enrichment without recomputing historical scores.
8. `/result/:id` requires ownership. Only `/share/:token` reads a separate, revocable, explicitly selected public projection. Retaking creates a new session and leaves earlier results untouched unless deleted.

## Versioning

Journey and scoring versions are immutable once released; changed narratives, score effects, calibration, shadow rules, or tie rules require a new release. Results store both versions, a content SHA-256, a registry snapshot, and the final structured profile. Interpretation, image prompts and templates each have their own version. Do not dynamically re-score old results when displaying them. New journeys get their own ID and releases.

## Privacy and operations

Private tables are in a non-public `app_private` schema, inaccessible to browser roles. Backend database credentials must be server-only and distinct from a migration owner. No public API is implemented in Phase 1, so the SQL schema alone is not represented as an authorized application. Phase 2 must enforce capabilities, origin checks, rate limits and body-size limits before exposing writes.

Deletion removes session-owned answers, profiles, interpretations, characters, reports, and share records by cascading foreign keys. Object storage deletion requires a transactional deletion outbox plus worker retries before enabling remote assets. Provider retention and regional settings must be documented before real mode. Collect no email or account unless requested later. Never log names, full prompts, answers, credentials or full profiles.

## Technical risks and gates

| Risk | Decision / acceptance gate |
| --- | --- |
| Unequal content opportunities | Content-relative calibration, opportunity audit, 10,000 seeded simulations, explicit warning thresholds |
| Fiction mistaken for validated assessment | Reflective language; percentages are relative narrative alignment, not probabilities or population percentiles |
| Uniform-choice simulation mistaken for human validation | Simulations test mechanics only; human pilot and independent content review remain launch gates |
| Client extraction/manipulation | Return explicit public DTOs only; calculate from canonical server choices, never client-submitted score maps |
| Duplicate answers / provider charges | Session row locks, uniqueness constraints, immutable results, stage-specific idempotency keys |
| Provider prompt injection / unsafe prose | Treat all profile strings as data, strict bounded JSON, contextual title validation, limited retries and safe fallback |
| Long image/PDF requests | Durable processing stages; no assumption that one HTTP request completes every provider task |
| Public leakage through links/cards | Explicit share projection with no raw answers, private axes, or name by default; revocation |
| PostgreSQL vs hosting compatibility | Keep the database adapter replaceable; a Workers target requires an HTTP database transport rather than raw TCP |
| Final visual requirements absent | Neutral development surfaces only; final art and report styling remain separate work |

Library reference points: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Zod](https://zod.dev/), [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html). Package versions are recorded in the lockfile rather than assumed from this document.
