# Web MVP implementation — 2026-09-03

The user's visual reference and request to build the landing page and all journey panels advance the original Phase 1 foundation into a functioning web MVP. This document records the actual implementation where it differs from the original phased design.

## Routes and experience

| Route | Purpose |
| --- | --- |
| `/` | Photographic landing, three-step introduction, all twelve archetypes |
| `/start` | Optional name, man/woman character representation, saved-journey recovery |
| `/journey` | Fifteen scenes, four choices each, seven-act map, persistent progress and pause |
| `/processing` | Completes the real scoring operation with retry on failure |
| `/result/:id` | Private reveal, character title, twelve archetypes, strengths and three insight tabs |
| `/share/:id` | Explicit selected-field public projection; unavailable after revocation |
| `/privacy` | Plain-language storage information and confirmed deletion |

The visual theme uses photographic valley, waystation and beacon imagery, forest green backgrounds, warm parchment/gold accents, Cormorant Garamond headings and locally hosted DM Sans. Browser WebP images are compressed derivatives of the design assets. The PDF uses the full-resolution valley. Scene illustrations are atmospheric art, not dynamically generated depictions of each choice or personalized portraits.

## Runtime and persistence

The web implementation uses a Cloudflare Workers-compatible Vinext app hosted by Sites. A D1 adapter replaces a PostgreSQL connection in the active web runtime. The original PostgreSQL foundation is retained and independently tested.

Six normalized tables store owners, immutable story releases, sessions, individual answers, results and selected public shares. Generated Drizzle migrations are applied by the hosting workflow. No request-time DDL is used. Answer acceptance uses revision comparisons and an atomic D1 batch. Results are unique per session; answer and completion retries are idempotent. Retakes create a new session under the same owner.

A random 256-bit HttpOnly, SameSite=Lax cookie supplies browser ownership; only its hash is stored. HTTPS sets Secure. Access to saved sessions, results, report data and share settings is authorized on every request. Mutation routes require a matching Origin and bound JSON inputs. JSON responses use private/no-store. Clearing the cookie loses access; there is no account recovery or multi-device synchronization in this MVP.

Deleting the owner cascades through that browser's sessions, answers, results and shares. There are no privately generated remote media assets requiring an outbox. Link revocation removes the live projection but cannot retract screenshots or already downloaded cards. The current Sites deployment is owner-only; share routes do not bypass that site-wide access policy.

## Scoring, interpretation and exports

The existing deterministic engine runs only on the server and preserves the versioned content hash. The current fifteen-scene public DTO includes story/choice text and progress; it excludes choice weights. All twelve result percentages total exactly 100.

Interpretations are curated output from the validated deterministic provider. No runtime AI credentials are configured. Report data comes from an authorized route and is rendered in the browser with pdf-lib and embedded fonts; the browser renders names using system fallback fonts to preserve non-Latin scripts locally. The report contains a cover, twelve sections and a reflection disclaimer.

Social exports are PNGs in Instagram portrait (1080×1350), Story (1080×1920), LinkedIn (1200×627), and X (1200×675) formats. Name inclusion is off by default. Users select one to three archetypes. Creating/updating a link explicitly persists that projection. Reloading restores link-management controls. Changed settings never silently reuse an older public projection in downloads/captions. Native sharing and clipboard actions are initiated by the user; the application never posts to a social account.

## Verification and remaining scope

The domain suite covers scoring, parity, content, sessions and PostgreSQL foundation constraints. The real HTTP smoke suite covers D1 answer races, idempotency, refresh recovery, private ownership, PDF generation, selected sharing, restoration of sharing settings, revocation, retake and deletion. Desktop/mobile browser walkthroughs cover the actual client components. The PDF is rendered and visually inspected before handoff.

The remaining original-scope work is real text/image providers, individualized portrait persistence, account-based recovery, hosted PostgreSQL if selected, operational backup/retention decisions, human pilot studies and public-launch review. The product does not claim scientific diagnostic validity.

The updated dependency tree has no high/critical advisories. Four moderate audit entries derive from an unused development-server path in drizzle-kit's transitive esbuild. Drizzle is only used for local schema generation, not to serve this site; the audit's suggested forced downgrade was not applied.
