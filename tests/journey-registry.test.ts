import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { journeyV1 } from '../src/domain/content/journey-v1.js';
import { contentHash } from '../src/database/content-hash.js';
import { validateContent } from '../src/domain/content/validate.js';
import {
  DEFAULT_JOURNEY_SLUG,
  getJourneyDefinition,
  getJourneyDefinitionById,
  listJourneyManifests,
  listPublicJourneys,
} from '../src/domain/journeys/registry.js';
import { journeyPublicManifestSchema } from '../src/domain/journeys/contracts.js';

test('the registry resolves the current Journey through slug, stable id and legacy id', async () => {
  assert.equal(DEFAULT_JOURNEY_SLUG, 'the-unwritten-road');
  const bySlug = getJourneyDefinition(DEFAULT_JOURNEY_SLUG);
  assert.ok(bySlug);
  assert.equal(getJourneyDefinitionById('journey_unwritten_road'), bySlug);
  assert.equal(getJourneyDefinitionById('archetype-journey'), bySlug);
  assert.equal(getJourneyDefinition('unknown-road'), null);

  const model = await bySlug.loadServerModel();
  assert.equal(model.content, journeyV1);
  assert.equal(model.contentHash, contentHash(journeyV1));
  assert.equal(model.content.scenes.length, bySlug.manifest.sceneCount);
  assert.equal(model.content.journey_version, bySlug.manifest.currentVersion);
  assert.equal(model.content.scoring_version, bySlug.manifest.scoringVersion);
});

test('the public registry exposes localized metadata without score maps', () => {
  const manifests = listJourneyManifests();
  assert.equal(manifests.length, 1);
  const english = listPublicJourneys('en')[0]!;
  const spanish = listPublicJourneys('es')[0]!;
  assert.equal(english.title, 'The Unwritten Road');
  assert.equal(spanish.title, 'El camino no escrito');
  assert.equal(english.sceneCount, 15);
  assert.ok(!JSON.stringify(manifests).includes('decision_styles'));
  assert.ok(!JSON.stringify(manifests).includes('scores'));
});

test('manifest validation blocks language-bearing or unapproved new release art', () => {
  const legacy = structuredClone(listJourneyManifests()[0]!);
  legacy.assets.onboarding.containsReadableLanguage = true as false;
  assert.equal(journeyPublicManifestSchema.safeParse(legacy).success, false);

  const future = structuredClone(listJourneyManifests()[0]!);
  future.id = 'journey_future';
  future.slug = 'future-road';
  future.legacyVisualQaException = false;
  assert.equal(journeyPublicManifestSchema.safeParse(future).success, false);
});

test('every scene and representation resolves to real language-neutral responsive assets', () => {
  const manifest = listJourneyManifests()[0]!;
  assert.equal(manifest.legacyVisualQaException, true);
  const statuses = new Set<string>();
  for (const representation of ['man', 'woman'] as const) {
    const scenes = manifest.assets.scenes[representation];
    assert.equal(Object.keys(scenes).length, manifest.sceneCount);
    for (const scene of journeyV1.scenes) {
      const visual = scenes[scene.id];
      assert.ok(visual, `Missing ${representation} visual for ${scene.id}`);
      for (const asset of [
        visual.default,
        ...Object.values(visual.choiceVariants ?? {}),
      ]) {
        assert.equal(asset.containsReadableLanguage, false);
        statuses.add(asset.qaStatus);
        assert.ok(asset.alt.en.length > 10);
        assert.ok(asset.alt.es.length > 10);
        assert.ok(
          existsSync(
            join(process.cwd(), 'public', asset.src.replace(/^\//, '')),
          ),
        );
        assert.ok(
          !asset.responsiveSrc ||
            existsSync(
              join(
                process.cwd(),
                'public',
                asset.responsiveSrc.replace(/^\//, ''),
              ),
            ),
        );
        assert.equal(asset.width, 1600);
        assert.equal(asset.height, 900);
      }
    }
  }
  assert.equal(
    Object.keys(manifest.assets.scenes.man.scene_10!.choiceVariants ?? {})
      .length,
    4,
  );
  assert.equal(
    manifest.assets.scenes.woman.scene_11!.inheritsChoiceFrom,
    'scene_10',
  );
  assert.ok(statuses.has('approved'));
  assert.ok(statuses.has('pending'));
  assert.ok(statuses.has('repair'));
});

test('the shared content contract accepts an eighteen-scene Journey without V1 naming assumptions', () => {
  const next = structuredClone(journeyV1);
  next.id = 'journey_council_realms';
  next.slug = 'council-of-realms';
  next.title = 'Council of Realms';
  for (let order = 16; order <= 18; order++) {
    const scene = structuredClone(journeyV1.scenes[order - 16]!);
    scene.id = `council_moment_${order}`;
    scene.order = order;
    scene.act = order === 16 ? 8 : 9;
    scene.choices.forEach((choice, index) => {
      choice.id = `council_${order}_${index + 1}`;
    });
    next.scenes.push(scene);
  }
  assert.deepEqual(validateContent(next).errors, []);
});
