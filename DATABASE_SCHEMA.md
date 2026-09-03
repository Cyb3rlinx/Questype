# Database schema — MVP v1

Target: PostgreSQL. Executable, transactional migrations live in `database/migrations/`. Private data belongs to `app_private`; browser roles receive no grants. IDs are server-generated UUIDs except stable textual registry/content keys. All timestamps use `timestamptz`. No credential is stored in a migration or seed.

## Content and registries

| Table | Main fields / constraints |
| --- | --- |
| `journeys` | text ID, unique slug, title, created_at |
| `journey_versions` | UUID ID, journey FK, journey_version, scoring_version, content_hash, content_snapshot JSONB, released_at; unique (journey_id, journey_version) |
| `archetypes` | (version_id, slug) composite PK, registry_order, definition JSONB including every registry field |
| `psychological_dimensions` | (version_id, dimension_type, dimension_key) PK, label, description; types archetypes/motivations/decision_styles/shadow/traits |
| `scenes` | (version_id, id) PK, act 1–7, scene_order, title, narrative, male/female variants nullable, image_prompt nullable, is_pressure; unique (version_id, scene_order) |
| `scene_choices` | (version_id, scene_id, id) PK, choice_order 1–4, text and nullable representation variants; scene FK and unique scene/order |
| `choice_score_effects` | (version_id, scene_id, choice_id, dimension_type, dimension_key) PK; composite choice and dimension FKs; score integer [-3,3] |

Version-scoped definitions ensure future wording and taxonomy changes do not rewrite historical results. Seed inserts a complete snapshot and rows in one transaction, verifies matching content hash on retry, then marks the version released. Released content and children cannot be modified or deleted. Create a new version for changes. A database trigger enforces this, including direct SQL updates. Retirement means stop offering a release to new sessions, not delete it.

## Private user state

| Table | Main fields / constraints |
| --- | --- |
| `users` | UUID PK, optional name and email, created_at; account workflow deferred |
| `journey_sessions` | UUID PK, nullable user FK, version_id, optional name, character_gender enum check, capability_hash unique, status, current_scene >=1, started_at, completed_at; unique (id, version_id) |
| `user_answers` | (session_id, scene_id) PK, version_id, choice_id, answered_at; composite session/version and choice FKs enforce membership |
| `result_profiles` | UUID PK, session_id unique FK, version_id, scoring_version, selected archetype slugs, structured_profile JSONB, created_at; version-scoped archetype FKs |
| `archetype_results` | (result_profile_id, archetype_slug) PK, raw_score, calibrated_score, normalized_percentage integer 0–100, rank unique per result |
| `dimension_results` | (result_profile_id, dimension_type, dimension_key) PK, raw_score, normalized_value 0–100, has_evidence; dimension-version FK |

Profile rows are immutable snapshots, not materialized views re-evaluated on reads. Archetype child results must reference the same result version. Exact total percentage, row completeness, and the equality of JSON and relational projections are enforced by the future completion transaction using domain validation; a deferred database trigger additionally checks twelve rows and sum=100. Completion must insert profile and all projections in one transaction. A session row lock and unique result/session index prevent duplicate finalizations. No browser client writes directly to these tables.

## Generated data and sharing

| Table | Main fields / constraints |
| --- | --- |
| `ai_interpretations` | UUID PK, result FK, provider, model, prompt_version, response_json, created_at; unique (result, prompt_version) |
| `generated_characters` | UUID PK, result FK unique, character_name, prompt, prompt_version, provider, provider_model, generation_id, image_url, created_at |
| `generated_assets` | UUID PK, result FK, kind, storage_key unique, content_type, created_at |
| `pdf_reports` | UUID PK, result FK, asset FK, template_version, report_data JSONB, created_at; unique (result, template_version) |
| `share_cards` | UUID PK, result FK, asset FK, platform, format, caption, created_at; supported platform/format checks |
| `public_shares` | UUID PK, result FK, token_hash unique, selected_projection JSONB, created_at, revoked_at; raw answers prohibited by application projection schema |
| `generation_jobs` | UUID PK, result FK, stage, status, attempt, idempotency_key unique, error_code, created_at, updated_at |
| `asset_deletion_outbox` | UUID PK, storage_key unique, queued_at, completed_at, attempts; independent of result FK so it survives deletion |

Assets and report/card ownership are checked using composite result/asset foreign keys. Deleting an asset queues its storage key before cascading, so cleanup is not lost when its result disappears. Revoked shares return 404, never the private result as a fallback.

## Access boundary and indexes

Revoke all private-schema/table access from PUBLIC, and enable RLS without public policies on personal tables (deny by default for non-owner roles). Explicit role grants and backend ownership/capability checks are a Phase 2 task; do not assume a service credential is protected by RLS, since privileged roles may bypass it. Use separate migration and runtime roles. Supabase service keys remain server-side; a direct browser connection never receives table access.

Index sessions by capability hash and user; answers by session; results by session; jobs by status/update time; shares by token hash; generated assets by result. Composite FKs preserve release identity across answers and results. Personal rows cascade from session deletion. User deletion cascades owned sessions. Shared immutable content is retained.

## Migration and verification

The runner uses a transaction and an advisory lock, records SHA-256 checksums in a migration ledger, and fails if an applied file changes. The content seed is transactional and idempotent only for an identical hash. Embedded PostgreSQL tests run the SQL, seed twice, reject cross-version choices and invalid weights, check released-content immutability, validate result totals, and exercise deletion. This validates SQL behavior locally; production role grants, TLS, backups and hosted-engine compatibility remain deployment gates.
