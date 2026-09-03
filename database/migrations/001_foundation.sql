CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC;

CREATE TABLE app_private.journeys (
  id text PRIMARY KEY, slug text UNIQUE NOT NULL, title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE app_private.journey_versions (
  id uuid PRIMARY KEY,
  journey_id text NOT NULL REFERENCES app_private.journeys(id),
  journey_version text NOT NULL, scoring_version text NOT NULL,
  content_hash text NOT NULL CHECK (content_hash ~ '^[a-f0-9]{64}$'),
  content_snapshot jsonb NOT NULL CHECK (jsonb_typeof(content_snapshot) = 'object'),
  released_at timestamptz,
  UNIQUE(journey_id, journey_version), UNIQUE(id, scoring_version)
);
CREATE TABLE app_private.archetypes (
  version_id uuid NOT NULL REFERENCES app_private.journey_versions(id),
  slug text NOT NULL, registry_order integer NOT NULL CHECK (registry_order BETWEEN 1 AND 12),
  definition jsonb NOT NULL CHECK (jsonb_typeof(definition) = 'object'),
  PRIMARY KEY(version_id, slug), UNIQUE(version_id, registry_order)
);
CREATE TABLE app_private.psychological_dimensions (
  version_id uuid NOT NULL REFERENCES app_private.journey_versions(id),
  dimension_type text NOT NULL CHECK (dimension_type IN ('archetypes','motivations','decision_styles','shadow','traits')),
  dimension_key text NOT NULL CHECK (dimension_key ~ '^[a-z][a-z0-9_]{0,63}$' AND dimension_key NOT IN ('constructor','prototype')),
  label text NOT NULL, description text NOT NULL,
  PRIMARY KEY(version_id, dimension_type, dimension_key)
);
CREATE TABLE app_private.scenes (
  version_id uuid NOT NULL REFERENCES app_private.journey_versions(id),
  id text NOT NULL, act integer NOT NULL CHECK (act BETWEEN 1 AND 7),
  scene_order integer NOT NULL CHECK (scene_order BETWEEN 1 AND 15),
  title text NOT NULL, narrative text NOT NULL,
  male_variant text, female_variant text, image_prompt text,
  is_pressure boolean NOT NULL DEFAULT false,
  PRIMARY KEY(version_id, id), UNIQUE(version_id, scene_order)
);
CREATE TABLE app_private.scene_choices (
  version_id uuid NOT NULL, scene_id text NOT NULL, id text NOT NULL,
  choice_order integer NOT NULL CHECK (choice_order BETWEEN 1 AND 4),
  text text NOT NULL, male_variant text, female_variant text,
  PRIMARY KEY(version_id, scene_id, id), UNIQUE(version_id, scene_id, choice_order),
  FOREIGN KEY(version_id, scene_id) REFERENCES app_private.scenes(version_id, id)
);
CREATE TABLE app_private.choice_score_effects (
  version_id uuid NOT NULL, scene_id text NOT NULL, choice_id text NOT NULL,
  dimension_type text NOT NULL, dimension_key text NOT NULL,
  score integer NOT NULL CHECK (score BETWEEN -3 AND 3),
  PRIMARY KEY(version_id, scene_id, choice_id, dimension_type, dimension_key),
  FOREIGN KEY(version_id, scene_id, choice_id) REFERENCES app_private.scene_choices(version_id, scene_id, id),
  FOREIGN KEY(version_id, dimension_type, dimension_key) REFERENCES app_private.psychological_dimensions(version_id, dimension_type, dimension_key)
);

CREATE FUNCTION app_private.guard_release() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.released_at IS NOT NULL THEN RAISE EXCEPTION 'Released journey versions are immutable'; END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER immutable_release BEFORE UPDATE OR DELETE ON app_private.journey_versions
FOR EACH ROW EXECUTE FUNCTION app_private.guard_release();

CREATE FUNCTION app_private.guard_released_content() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP <> 'INSERT' AND EXISTS(SELECT 1 FROM app_private.journey_versions WHERE id = OLD.version_id AND released_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Released content is immutable';
  END IF;
  IF TG_OP <> 'DELETE' AND EXISTS(SELECT 1 FROM app_private.journey_versions WHERE id = NEW.version_id AND released_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Cannot add to or modify released content';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['archetypes','psychological_dimensions','scenes','scene_choices','choice_score_effects'] LOOP
    EXECUTE format('CREATE TRIGGER immutable_content BEFORE INSERT OR UPDATE OR DELETE ON app_private.%I FOR EACH ROW EXECUTE FUNCTION app_private.guard_released_content()', t);
  END LOOP;
END $$;

CREATE TABLE app_private.users (
  id uuid PRIMARY KEY, name text CHECK (char_length(name) BETWEEN 1 AND 60), email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE app_private.journey_sessions (
  id uuid PRIMARY KEY, user_id uuid REFERENCES app_private.users(id) ON DELETE CASCADE,
  version_id uuid NOT NULL REFERENCES app_private.journey_versions(id),
  name text CHECK (char_length(name) BETWEEN 1 AND 60),
  character_gender text NOT NULL CHECK (character_gender IN ('man','woman')),
  capability_hash text NOT NULL UNIQUE CHECK (capability_hash ~ '^[a-f0-9]{64}$'),
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','processing','completed')),
  current_scene integer NOT NULL DEFAULT 1 CHECK (current_scene BETWEEN 1 AND 16),
  started_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
  CHECK ((status = 'completed' AND completed_at IS NOT NULL) OR (status <> 'completed' AND completed_at IS NULL)),
  UNIQUE(id, version_id)
);
CREATE INDEX sessions_by_user ON app_private.journey_sessions(user_id);
CREATE TABLE app_private.user_answers (
  session_id uuid NOT NULL, scene_id text NOT NULL, version_id uuid NOT NULL, choice_id text NOT NULL,
  answered_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(session_id, scene_id),
  FOREIGN KEY(session_id, version_id) REFERENCES app_private.journey_sessions(id, version_id) ON DELETE CASCADE,
  FOREIGN KEY(version_id, scene_id, choice_id) REFERENCES app_private.scene_choices(version_id, scene_id, id)
);
CREATE TABLE app_private.result_profiles (
  id uuid PRIMARY KEY, session_id uuid NOT NULL UNIQUE, version_id uuid NOT NULL, scoring_version text NOT NULL,
  primary_archetype text NOT NULL, secondary_archetype text NOT NULL, tertiary_archetype text NOT NULL, shadow_archetype text NOT NULL,
  structured_profile jsonb NOT NULL CHECK (jsonb_typeof(structured_profile) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(id, version_id),
  CHECK (primary_archetype <> secondary_archetype AND primary_archetype <> tertiary_archetype AND secondary_archetype <> tertiary_archetype),
  FOREIGN KEY(session_id, version_id) REFERENCES app_private.journey_sessions(id, version_id) ON DELETE CASCADE,
  FOREIGN KEY(version_id, scoring_version) REFERENCES app_private.journey_versions(id, scoring_version),
  FOREIGN KEY(version_id, primary_archetype) REFERENCES app_private.archetypes(version_id, slug),
  FOREIGN KEY(version_id, secondary_archetype) REFERENCES app_private.archetypes(version_id, slug),
  FOREIGN KEY(version_id, tertiary_archetype) REFERENCES app_private.archetypes(version_id, slug),
  FOREIGN KEY(version_id, shadow_archetype) REFERENCES app_private.archetypes(version_id, slug)
);
CREATE TABLE app_private.archetype_results (
  result_profile_id uuid NOT NULL, version_id uuid NOT NULL, archetype_slug text NOT NULL,
  raw_score integer NOT NULL, calibrated_score double precision NOT NULL CHECK (calibrated_score > '-Infinity'::float8 AND calibrated_score < 'Infinity'::float8),
  normalized_percentage integer NOT NULL CHECK (normalized_percentage BETWEEN 0 AND 100),
  rank integer NOT NULL CHECK (rank BETWEEN 1 AND 12),
  PRIMARY KEY(result_profile_id, archetype_slug), UNIQUE(result_profile_id, rank),
  FOREIGN KEY(result_profile_id, version_id) REFERENCES app_private.result_profiles(id, version_id) ON DELETE CASCADE,
  FOREIGN KEY(version_id, archetype_slug) REFERENCES app_private.archetypes(version_id, slug)
);
CREATE TABLE app_private.dimension_results (
  result_profile_id uuid NOT NULL, version_id uuid NOT NULL, dimension_type text NOT NULL CHECK (dimension_type <> 'archetypes'), dimension_key text NOT NULL,
  raw_score integer NOT NULL, normalized_value integer NOT NULL CHECK (normalized_value BETWEEN 0 AND 100), has_evidence boolean NOT NULL,
  PRIMARY KEY(result_profile_id, dimension_type, dimension_key),
  FOREIGN KEY(result_profile_id, version_id) REFERENCES app_private.result_profiles(id, version_id) ON DELETE CASCADE,
  FOREIGN KEY(version_id, dimension_type, dimension_key) REFERENCES app_private.psychological_dimensions(version_id, dimension_type, dimension_key)
);
CREATE FUNCTION app_private.forbid_snapshot_update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Saved answers and result snapshots are immutable'; END $$;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['user_answers','result_profiles','archetype_results','dimension_results'] LOOP
    EXECUTE format('CREATE TRIGGER immutable_snapshot BEFORE UPDATE ON app_private.%I FOR EACH ROW EXECUTE FUNCTION app_private.forbid_snapshot_update()', t);
  END LOOP;
END $$;

CREATE FUNCTION app_private.check_archetype_total() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE rid uuid; n integer; total integer;
BEGIN
  IF TG_TABLE_NAME = 'result_profiles' THEN rid := NEW.id;
  ELSIF TG_OP = 'DELETE' THEN rid := OLD.result_profile_id;
  ELSE rid := NEW.result_profile_id; END IF;
  IF NOT EXISTS (SELECT 1 FROM app_private.result_profiles WHERE id = rid) THEN RETURN NULL; END IF;
  SELECT count(*), coalesce(sum(normalized_percentage),0) INTO n,total FROM app_private.archetype_results WHERE result_profile_id = rid;
  IF n <> 12 OR total <> 100 THEN RAISE EXCEPTION 'Result needs twelve archetypes totaling 100 percent'; END IF;
  RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER complete_result AFTER INSERT ON app_private.result_profiles
DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION app_private.check_archetype_total();
CREATE CONSTRAINT TRIGGER complete_archetypes AFTER INSERT OR UPDATE OR DELETE ON app_private.archetype_results
DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION app_private.check_archetype_total();

CREATE TABLE app_private.ai_interpretations (
  id uuid PRIMARY KEY, result_profile_id uuid NOT NULL REFERENCES app_private.result_profiles(id) ON DELETE CASCADE,
  provider text NOT NULL, model text NOT NULL, prompt_version text NOT NULL,
  response_json jsonb NOT NULL CHECK (jsonb_typeof(response_json) = 'object'), created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(result_profile_id, prompt_version)
);
CREATE TABLE app_private.generated_characters (
  id uuid PRIMARY KEY, result_profile_id uuid NOT NULL UNIQUE REFERENCES app_private.result_profiles(id) ON DELETE CASCADE,
  character_name text NOT NULL, prompt text NOT NULL, prompt_version text NOT NULL,
  provider text NOT NULL, provider_model text NOT NULL, generation_id text NOT NULL, image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE app_private.generated_assets (
  id uuid PRIMARY KEY, result_profile_id uuid NOT NULL REFERENCES app_private.result_profiles(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('character','pdf','share_card')), storage_key text NOT NULL UNIQUE,
  content_type text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(id, result_profile_id)
);
CREATE INDEX assets_by_result ON app_private.generated_assets(result_profile_id);
CREATE TABLE app_private.pdf_reports (
  id uuid PRIMARY KEY, result_profile_id uuid NOT NULL REFERENCES app_private.result_profiles(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL, template_version text NOT NULL, report_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(result_profile_id, template_version),
  FOREIGN KEY(asset_id, result_profile_id) REFERENCES app_private.generated_assets(id, result_profile_id) ON DELETE CASCADE
);
CREATE TABLE app_private.share_cards (
  id uuid PRIMARY KEY, result_profile_id uuid NOT NULL REFERENCES app_private.result_profiles(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL, platform text NOT NULL, format text NOT NULL, caption text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((platform = 'instagram' AND format IN ('portrait','story')) OR (platform = 'linkedin' AND format = 'professional') OR (platform = 'x' AND format = 'compact')),
  FOREIGN KEY(asset_id, result_profile_id) REFERENCES app_private.generated_assets(id, result_profile_id) ON DELETE CASCADE
);
CREATE TABLE app_private.public_shares (
  id uuid PRIMARY KEY, result_profile_id uuid NOT NULL REFERENCES app_private.result_profiles(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  selected_projection jsonb NOT NULL CHECK (jsonb_typeof(selected_projection) = 'object' AND NOT selected_projection ?| ARRAY['answers','journey','raw_scores','shadow_axis','user','capability_hash']),
  created_at timestamptz NOT NULL DEFAULT now(), revoked_at timestamptz
);
CREATE TABLE app_private.generation_jobs (
  id uuid PRIMARY KEY, result_profile_id uuid NOT NULL REFERENCES app_private.result_profiles(id) ON DELETE CASCADE,
  stage text NOT NULL CHECK (stage IN ('interpretation','character','pdf','share_card')),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','succeeded','failed')),
  attempt integer NOT NULL DEFAULT 0 CHECK (attempt >= 0), idempotency_key text NOT NULL UNIQUE, error_code text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX pending_jobs ON app_private.generation_jobs(status, updated_at);
CREATE TABLE app_private.asset_deletion_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), storage_key text NOT NULL UNIQUE,
  queued_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0)
);
CREATE FUNCTION app_private.queue_asset_deletion() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO app_private.asset_deletion_outbox(storage_key) VALUES (OLD.storage_key) ON CONFLICT (storage_key) DO NOTHING;
  RETURN OLD;
END $$;
CREATE TRIGGER delete_remote_asset BEFORE DELETE ON app_private.generated_assets
FOR EACH ROW EXECUTE FUNCTION app_private.queue_asset_deletion();

REVOKE ALL ON ALL TABLES IN SCHEMA app_private FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA app_private FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_private REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_private REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['users','journey_sessions','user_answers','result_profiles','archetype_results','dimension_results','ai_interpretations','generated_characters','generated_assets','pdf_reports','share_cards','public_shares','generation_jobs','asset_deletion_outbox'] LOOP
    EXECUTE format('ALTER TABLE app_private.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;
