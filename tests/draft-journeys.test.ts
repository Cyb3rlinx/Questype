import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  analyzeSignalCoverage,
  simulateSignalModel,
} from '../src/domain/signals/coverage.js';
import { aggregateSignalAssessments } from '../src/domain/signals/engine.js';
import { draftSignalContent } from '../src/domain/journeys/draft-contracts.js';
import {
  getJourneyDefinition,
  listJourneyCards,
  loadDraftJourneyModel,
} from '../src/domain/journeys/registry.js';

const cases = [
  {
    slug: 'council-of-realms',
    id: 'journey_council_realms',
    focus: [
      'leadership_initiative',
      'social_confidence',
      'empathy_cooperation',
      'structure',
      'autonomy',
    ],
  },
  {
    slug: 'stormbound-passage',
    id: 'journey_stormbound_passage',
    focus: [
      'risk_tolerance',
      'adaptability',
      'persistence',
      'emotional_regulation',
    ],
  },
] as const;

for (const item of cases) {
  void test(`${item.slug} has a complete fixed bilingual draft contract`, async () => {
    const definition = getJourneyDefinition(item.slug);
    assert.ok(definition);
    assert.equal(definition.manifest.id, item.id);
    assert.equal(definition.manifest.status, 'draft');
    assert.equal(definition.loadServerModel, undefined);
    assert.ok(definition.loadDraftModel);

    const model = await loadDraftJourneyModel(item.slug);
    assert.ok(model);
    assert.equal(model.content.id, item.id);
    assert.equal(model.content.scenes.length, 18);
    assert.equal(model.contentHash.length, 64);
    assert.equal(model.resultContract, 'questype-signals.v1');
    assert.equal(
      new Set(model.content.scenes.map((scene) => scene.id)).size,
      18,
    );

    const choiceIds = model.content.scenes.flatMap((scene) =>
      scene.choices.map((choice) => choice.id),
    );
    assert.equal(choiceIds.length, 72);
    assert.equal(new Set(choiceIds).size, 72);
    model.content.scenes.forEach((scene, index) => {
      assert.equal(scene.order, index + 1);
      assert.equal(scene.choices.length, 4);
      assert.ok(scene.title.en && scene.title.es);
      assert.ok(scene.narrative.en && scene.narrative.es);
      for (const choice of scene.choices) {
        assert.ok(choice.text.en && choice.text.es);
        assert.ok(choice.benefit.en && choice.benefit.es);
        assert.ok(choice.tradeoff.en && choice.tradeoff.es);
      }
    });

    const signalContent = draftSignalContent(model.content);
    const coverage = analyzeSignalCoverage(signalContent, model.signalModel);
    assert.deepEqual(coverage.excessiveDensityScenes, []);
    for (const signal of item.focus) {
      const row = coverage.signals.find(
        (candidate) => candidate.signal === signal,
      )!;
      assert.ok(
        row.opportunityScenes >= 4,
        `${signal} needs four or more scenes`,
      );
      assert.equal(row.positiveOptions, row.negativeOptions);
    }

    const firstPath = model.content.scenes.map((scene) => ({
      scene_id: scene.id,
      choice_id: scene.choices[0]!.id,
    }));
    assert.deepEqual(
      model.signalEngine.evaluate(firstPath, { resultId: 'same-result' }),
      model.signalEngine.evaluate(firstPath, { resultId: 'same-result' }),
    );
    const simulation = simulateSignalModel(
      signalContent,
      model.signalModel,
      200,
      44,
    );
    assert.equal(simulation.runs, 200);
  });

  void test(`${item.slug} exposes approved key art and pending language-neutral scene placeholders`, () => {
    const manifest = getJourneyDefinition(item.slug)!.manifest;
    const placeholderAssets = [
      manifest.assets.processing,
      ...Object.values(manifest.assets.scenes).flatMap((scenes) =>
        Object.values(scenes).map((scene) => scene.default),
      ),
    ];
    assert.equal(manifest.assets.onboarding.qaStatus, 'approved');
    assert.equal(manifest.assets.onboarding.containsReadableLanguage, false);
    assert.match(manifest.assets.onboarding.provenance, /supplied 2026-09-13/i);
    assert.ok(
      existsSync(
        join(process.cwd(), 'public', manifest.assets.onboarding.src.slice(1)),
      ),
    );
    assert.ok(
      manifest.assets.onboarding.responsiveSrc &&
        existsSync(
          join(
            process.cwd(),
            'public',
            manifest.assets.onboarding.responsiveSrc.slice(1),
          ),
        ),
    );
    assert.ok(placeholderAssets.length >= 37);
    for (const asset of placeholderAssets) {
      assert.equal(asset.qaStatus, 'pending');
      assert.equal(asset.containsReadableLanguage, false);
      assert.match(asset.provenance, /placeholder/i);
      assert.ok(existsSync(join(process.cwd(), 'public', asset.src.slice(1))));
      assert.ok(
        !asset.responsiveSrc ||
          existsSync(
            join(process.cwd(), 'public', asset.responsiveSrc.slice(1)),
          ),
      );
    }
  });
}

void test('public Journey cards contain no hidden weights and drafts remain non-actionable data', () => {
  const cards = listJourneyCards();
  assert.equal(cards.length, 3);
  assert.equal(cards.filter((card) => card.status === 'published').length, 1);
  assert.equal(cards.filter((card) => card.status === 'draft').length, 2);
  const serialized = JSON.stringify(cards);
  assert.ok(!serialized.includes('choiceEvidence'));
  assert.ok(!serialized.includes('direction'));
  assert.ok(!serialized.includes('weight'));
});

void test('Council and Stormbound accumulate as two normalized Journey sources', async () => {
  const assessments = [];
  for (const item of cases) {
    const model = await loadDraftJourneyModel(item.slug);
    assert.ok(model);
    assessments.push(
      model.signalEngine.evaluate(
        model.content.scenes.map((scene) => ({
          scene_id: scene.id,
          choice_id: scene.choices[0]!.id,
        })),
        { resultId: `${item.slug}-accumulated` },
      ),
    );
  }
  const profile = aggregateSignalAssessments(assessments);
  assert.equal(profile.journeysCompleted, 2);
  assert.equal(profile.profileDepth, 'emerging');
  assert.equal(profile.decisionsAnalyzed, 36);
  assert.equal(profile.signals.creation_orientation.value, null);
  assert.equal(profile.signals.leadership_initiative.journeys, 2);
  assert.equal(profile.signals.risk_tolerance.journeys, 1);
  assert.equal(profile.sourceResultIds.length, 2);
});
