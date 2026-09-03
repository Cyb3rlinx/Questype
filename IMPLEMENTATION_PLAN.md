# Implementation plan

Delivery scope follows the final instruction: create all seven planning documents, then implement Phase 1. The rest of the MVP is specified here as future work; it must not be represented as already built.

## Before coding — completed design

- Repository inspection and architecture: ARCHITECTURE.md.
- File tree, lifecycle, privacy, provider boundaries and risks: ARCHITECTURE.md.
- Relational schema, ownership strategy and versioning: DATABASE_SCHEMA.md.
- Archetypes and dimension design: PRODUCT_SPEC.md and versioned registries.
- Raw scoring, calibration, normalization, ties and shadow algorithm: SCORING_SPEC.md.
- AI schema, versions and validation: AI_SPEC.md.
- Fifteen-scene content structure: JOURNEY_V1.md.
- Sequencing and gates: this document.

## Phase 1 — Foundation (this delivery)

Status: implemented and locally verified on 2026-09-03. `npm run check` passes 37 tests, content validation and compilation. The 10,000-journey simulation has twelve reachable primary outcomes and no configured warnings. See [README.md](README.md), [artifacts/BALANCE_REPORT.md](artifacts/BALANCE_REPORT.md), and [artifacts/example-profile.json](artifacts/example-profile.json). PostgreSQL behavior was tested in an embedded engine; a production database was not provisioned. Phases 2–9 below are pending.

Initialize a strict TypeScript package, test runner, environment example and documented commands. Implement Zod domain schemas, complete twelve-archetype registry, motivation/decision/shadow registries and extensible traits. Add the fifteen-scene content seed so the architecture is exercised against real data. Implement pure scoring, normalization, shadow evidence and structured profile foundation. Add deterministic naming, provider interfaces, AI output schema and report-data contract; these are contracts and pure transformations, not external integrations.

Create executable PostgreSQL migrations, transactional migration/seed commands, release immutability, referential integrity, private schema, and deletion outbox. Test with an actual embedded PostgreSQL engine without requiring production credentials. Add pure session transitions and public scene serialization as the handoff to Phase 2. Run content validation and 10,000 seeded simulations, save a balancing report and reproducible example profile.

Acceptance: typecheck, unit/integration tests, content validation, simulation report, clean compilation. Report any distribution warnings honestly. No final UI, deployment, production database provisioning, real AI calls, image generation, PDF files or social publication in this phase.

## Phase 2 — Journey engine

Add Next.js/React web routes, neutral accessible UI, optional name and representation, anonymous HttpOnly capability cookie, origin checks and rate limits. Implement PostgreSQL repository and transactional answer persistence. Browser storage is only a recovery hint; server state wins. Display sanitized scene DTOs. Retake creates a new session. Validate refresh recovery after scene 8, duplicate submissions, concurrent tabs, network interruption, expired/missing ownership and mobile keyboard/screen-reader access.

## Phase 3 — Psychological engine release review

Wire the tested domain functions into server-only result completion. Verify immutable content selection, one profile per session, snapshot/projection consistency, exact totals and no scoring metadata in browser bundles/responses. Review mechanical balance with human playtests; change content only in a new release. Produce a locked launch balancing report and targeted representation-parity tests.

## Phase 4 — Result engine

Implement private result page, deterministic fallback prose, character naming, all twelve scores, motivation/decision/pressure layers, strengths, relationships, growth and deletion. Validate result ownership and weak-evidence language. Names and titles are escaped text. Never imply the output is a diagnosis or experimentally validated personality truth.

## Phase 5 — AI interpretation

Add the selected real text adapter, durable processing stages, timeout/retry, strict and contextual output checks and deterministic fallback. Persist provider/model/prompt version. Test malformed/extra fields, diagnostic wording, title drift, prompt-injection strings, rate limiting and failed/retried generation. Human review of generated samples is a release gate.

## Phase 6 — Character generation

Once visual direction is supplied, implement labelled mock mode and real provider mode with private asset persistence, metadata, allowed download origins, limits and idempotent retry. Exactly one selected final image per result; retries do not silently replace a historical image. Add outbox-driven asset cleanup.

## Phase 7 — Reports

Render the typed cover plus twelve sections to PDF with application-owned styling. Include the selected character image and notice. Authenticate download endpoints; test long names, long prose, pagination, Unicode and broken-image fallback. Render and visually inspect a generated PDF before calling the feature complete.

## Phase 8 — Sharing

Implement explicit field selection and revocable public projection. Render Instagram 4:5, Story 9:16, professional LinkedIn and compact X cards. Provide caption copy, downloads, native Web Share and supported URL intents. Test image dimensions, caption length, fallback behavior and raw-answer/name privacy. Do not automatically post on a user's behalf.

## Phase 9 — QA and delivery

Run end-to-end anonymous journey, resume, result revisit, retake, deletion and share revocation; responsive and accessibility checks; failure and recovery scenarios; provider smoke tests; hosted PostgreSQL role/transaction tests; and production build. Select a compatible hosting target and complete its deployment workflow only after the requested web experience is ready. Validate secrets, origin policy, private cache headers, backups and retention against the actual deployment.

## External decisions needed later

No external input blocks Phase 1. A deployed MVP later needs a database target, text/image provider configuration and credentials, asset storage, public app origin and visual direction. These are recorded here rather than silently mocked as production capabilities.

## Web MVP follow-up — 2026-09-03

The supplied visual direction and subsequent request authorized the consumer web experience. The landing, onboarding, all fifteen story panels, persisted progress, deterministic result screens, PDF and social exports, share management and deletion are now implemented. The Sites runtime uses D1; the original PostgreSQL schema remains available as a separately tested foundation. Live AI interpretation and individual portrait generation are still pending. See [WEB_MVP.md](WEB_MVP.md) for the current implementation and its precise limits; the phase descriptions above remain the original roadmap.
