# Questype — The Unwritten Road

A working web MVP for a fifteen-scene narrative journey. The visual direction follows the supplied photographic valley reference: natural limestone, old forests, a tiny traveler, muted greens, warm gold and editorial serif typography.

## What works

- Cinematic landing page and an introduction to all twelve archetypes.
- Optional name and character representation, fifteen story panels across seven acts, progress, pause and resume.
- Deterministic server-side scoring and private results with all twelve percentages, strengths, motivations, decision style, pressure patterns, relationships and growth.
- A downloadable five-page PDF containing a cover and twelve report sections.
- Four social-card formats, captions, explicit name/top-archetype selection, persistent share controls and revocable links.
- Retakes that preserve earlier results, anonymous ownership cookies, same-origin mutation checks and deletion of this browser's saved journeys.

This MVP uses curated, deterministic interpretations. Scene artwork was generated during design and is shared across journeys. It does not call a live text/image provider or generate an individual character portrait. These adapters remain a future phase. Archetypes are a narrative self-reflection framework, not a clinical assessment.

## Run locally

Requires Node.js 22.13 or later (verified on 24.14.0).

```sh
npm ci --include=optional
npm run db:local
npm run dev
```

The web app uses React, Vinext and shadcn/Base UI. Durable web data lives in the Cloudflare `DB` D1 binding. Drizzle migrations are checked in under `drizzle/` and bundled for deployment. Local data is stored in ignored `.wrangler/` state. No external AI or PostgreSQL credentials are needed for this preview.

```sh
npm run check
npm run test:web  # while the local server is running
npm run build
```

`check` runs strict web/domain typechecking, 37 tests, content validation and domain compilation into `dist-domain/`. `test:web` exercises the real HTTP/D1 endpoints with disposable synthetic data, removes that data, and writes an ignored QA report/PDF. `build` creates the deployed Worker and browser assets in `dist/`.

`npm run simulate` reproduces 10,000 seeded paths. The recorded primary frequencies are 7.80%–8.84%, with every archetype reachable, exact totals and no configured balance warnings. This checks the mechanics; human playtesting is still needed.

## Deploy to Cloudflare Workers

The Worker and its D1 binding are declared in `wrangler.jsonc`. After authenticating Wrangler, apply the migrations once and deploy:

```sh
npm run db:remote
npm run deploy
```

For Cloudflare Workers Builds connected to GitHub, use `main` as the production branch, `npm run build` as the build command and `npx wrangler deploy` as the deploy command. The repository root is the build root and no application secrets are required.

Add `questype.com` to the same Cloudflare account before assigning it as a Worker custom domain. Cloudflare must manage the domain's active DNS zone before Wrangler can create the custom-domain records and certificate.

## Structure and design documents

- `app/`, `components/journey/`, `lib/`: complete web flow and downloadable exports.
- `src/application/web-service.ts`, `db/`, `drizzle/`: authenticated anonymous web persistence and public projections.
- `src/domain/`: versioned story, pure session transitions, deterministic scoring and character titles.
- `src/ai/`, `src/reports/`, `src/sharing/`: validated interpretation, report and sharing contracts.
- [WEB_MVP.md](WEB_MVP.md): routes, deployment adapter, privacy and implementation limits.
- [PRODUCT_SPEC.md](PRODUCT_SPEC.md), [SCORING_SPEC.md](SCORING_SPEC.md), [AI_SPEC.md](AI_SPEC.md), [JOURNEY_V1.md](JOURNEY_V1.md): original product and domain specification.
- [ARCHITECTURE.md](ARCHITECTURE.md), [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md), [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md): initial phased architecture; the web adaptation is recorded in WEB_MVP.md.

## PostgreSQL foundation

The original PostgreSQL schema and migrations remain in `database/`; they are verified with PGlite during tests. They are an alternative persistence foundation, not the active Sites runtime. With an intentionally configured `DATABASE_URL`, `npm run db:migrate` and `npm run db:seed` initialize that schema. No external PostgreSQL instance was provisioned.

Do not import the story seed or scoring engine into a client component. During the journey the server returns only the public scene projection. Browser identity never enters the psychological scoring input.
