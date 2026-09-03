import { SCORE_GROUPS, type JourneyContent } from '../domain/types.js';
import { assertValidContent } from '../domain/content/validate.js';
import { transaction, type DatabaseClient } from './client.js';
import { contentHash, contentVersionId } from './content-hash.js';

export async function seedContent(db: DatabaseClient, content: JourneyContent): Promise<{ version_id: string; content_hash: string; inserted: boolean }> {
  assertValidContent(content);
  const versionId = contentVersionId(content);
  const hash = contentHash(content);
  return transaction(db, async () => {
    await db.query('SELECT pg_advisory_xact_lock($1)', [12981732]);
    const existing = await db.query<{ content_hash: string; released_at: string | null }>('SELECT content_hash,released_at FROM app_private.journey_versions WHERE id=$1', [versionId]);
    if (existing.rows.length) {
      if (existing.rows[0]!.content_hash !== hash) throw new Error('Content differs from saved release; create a new journey version');
      if (!existing.rows[0]!.released_at) throw new Error('An unreleased draft already uses this version');
      return { version_id: versionId, content_hash: hash, inserted: false };
    }
    await db.query('INSERT INTO app_private.journeys(id,slug,title) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING', [content.id, content.slug, content.title]);
    await db.query('INSERT INTO app_private.journey_versions(id,journey_id,journey_version,scoring_version,content_hash,content_snapshot) VALUES ($1,$2,$3,$4,$5,$6::jsonb)', [versionId, content.id, content.journey_version, content.scoring_version, hash, JSON.stringify(content)]);
    for (let i = 0; i < content.archetypes.length; i++) {
      const archetype = content.archetypes[i]!;
      await db.query('INSERT INTO app_private.archetypes(version_id,slug,registry_order,definition) VALUES ($1,$2,$3,$4::jsonb)', [versionId, archetype.slug, i + 1, JSON.stringify(archetype)]);
    }
    for (const d of content.dimensions) await db.query('INSERT INTO app_private.psychological_dimensions(version_id,dimension_type,dimension_key,label,description) VALUES ($1,$2,$3,$4,$5)', [versionId, d.group, d.key, d.label, d.description]);
    for (const scene of content.scenes) {
      await db.query('INSERT INTO app_private.scenes(version_id,id,act,scene_order,title,narrative,male_variant,female_variant,image_prompt,is_pressure) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', [versionId, scene.id, scene.act, scene.order, scene.title, scene.narrative, scene.male_variant, scene.female_variant, scene.image_prompt, scene.is_pressure]);
      for (let i = 0; i < scene.choices.length; i++) {
        const choice = scene.choices[i]!;
        await db.query('INSERT INTO app_private.scene_choices(version_id,scene_id,id,choice_order,text,male_variant,female_variant) VALUES ($1,$2,$3,$4,$5,$6,$7)', [versionId, scene.id, choice.id, i + 1, choice.text, choice.male_variant, choice.female_variant]);
        for (const g of SCORE_GROUPS) for (const [key, score] of Object.entries(choice.scores[g])) {
          await db.query('INSERT INTO app_private.choice_score_effects(version_id,scene_id,choice_id,dimension_type,dimension_key,score) VALUES ($1,$2,$3,$4,$5,$6)', [versionId, scene.id, choice.id, g, key, score]);
        }
      }
    }
    await db.query('UPDATE app_private.journey_versions SET released_at=now() WHERE id=$1', [versionId]);
    return { version_id: versionId, content_hash: hash, inserted: true };
  });
}
