import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { councilOfRealmsManifest } from '../src/domain/journeys/council-of-realms/manifest.js';
import { councilOfRealmsServerModel } from '../src/domain/journeys/council-of-realms/signals.server.js';
import { stormboundPassageManifest } from '../src/domain/journeys/stormbound-passage/manifest.js';
import { stormboundPassageServerModel } from '../src/domain/journeys/stormbound-passage/signals.server.js';
import { journeyResultDescriptorSchema } from '../src/domain/results/contracts.js';
import { generateSignalJourneyReport } from '../src/domain/results/signal-report.js';
import { renderSignalJourneyReportPdf } from '../lib/signal-journey-pdf-renderer.js';

const cases = [
  {
    model: councilOfRealmsServerModel,
    manifest: councilOfRealmsManifest,
    required: [
      'leadership-pattern',
      'coordination',
      'influence',
      'disagreement',
    ],
  },
  {
    model: stormboundPassageServerModel,
    manifest: stormboundPassageManifest,
    required: [
      'pressure-pattern',
      'risk-orientation',
      'adaptability',
      'persistence',
      'emotional-regulation',
    ],
  },
] as const;

for (const item of cases) {
  void test(`${item.manifest.slug} produces bilingual evidence-based Journey reports`, () => {
    const answers = item.model.content.scenes.map((scene) => ({
      scene_id: scene.id,
      choice_id: scene.choices[0]!.id,
    }));
    const assessment = item.model.signalEngine.evaluate(answers, {
      resultId: `${item.manifest.slug}-result`,
    });
    for (const locale of ['en', 'es'] as const) {
      const report = generateSignalJourneyReport({
        assessment,
        manifest: item.manifest,
        locale,
        generatedAt: '2026-09-13T00:00:00.000Z',
      });
      assert.equal(report.templateVersion, 'questype-journey-signals.v1');
      assert.equal(report.locale, locale);
      assert.equal(report.decisionsAnalyzed, 18);
      assert.ok(
        report.dimensions.every((dimension) => dimension.status === 'measured'),
      );
      for (const id of item.required)
        assert.ok(report.sections.some((section) => section.id === id));
      const publicCopy = JSON.stringify(report);
      assert.ok(!publicCopy.includes('choiceEvidence'));
      assert.ok(!publicCopy.includes('signedContribution'));
      assert.ok(!publicCopy.includes('scientifically proven'));
    }
  });
}

void test('insufficient Journey evidence stays unexplored and renders safely in PDF', async () => {
  const answers = stormboundPassageServerModel.content.scenes.map((scene) => ({
    scene_id: scene.id,
    choice_id: scene.choices[0]!.id,
  }));
  const assessment = structuredClone(
    stormboundPassageServerModel.signalEngine.evaluate(answers, {
      resultId: 'partial-result',
    }),
  );
  assessment.signals.risk_tolerance = {
    ...assessment.signals.risk_tolerance,
    value: null,
    band: 'insufficient',
    observations: 0,
    contributingObservations: 0,
    scenes: 0,
    contexts: 0,
    sceneIds: [],
    contextIds: [],
    opportunityCoverage: 0,
    directionalConsistency: 0,
  };
  const report = generateSignalJourneyReport({
    assessment,
    manifest: stormboundPassageManifest,
    locale: 'es',
    generatedAt: '2026-09-13T00:00:00.000Z',
  });
  const risk = report.dimensions.find(
    (dimension) => dimension.id === 'risk_tolerance',
  )!;
  assert.equal(risk.status, 'unexplored');
  assert.equal(risk.evidenceBand, 'insufficient');
  assert.ok(JSON.stringify(report).includes('suficiente evidencia'));

  const [bodyFont, headingFont] = await Promise.all([
    readFile('public/fonts/body.woff'),
    readFile('public/fonts/heading.woff'),
  ]);
  const bytes = await renderSignalJourneyReportPdf(report, {
    bodyFont,
    headingFont,
  });
  assert.equal(Buffer.from(bytes).subarray(0, 4).toString('ascii'), '%PDF');
  assert.ok(bytes.length > 15_000);
});

void test('the Journey result descriptor distinguishes legacy archetype and signal reports', () => {
  assert.equal(
    journeyResultDescriptorSchema.parse({
      kind: 'archetype_v1',
      journeyId: 'journey_unwritten_road',
      resultId: 'legacy-result',
      contractVersion: '1.0',
    }).kind,
    'archetype_v1',
  );
  assert.equal(
    journeyResultDescriptorSchema.parse({
      kind: 'signals_v1',
      journeyId: 'journey_council_realms',
      resultId: 'signal-result',
      contractVersion: '1.0',
      signalModelId: 'council_realms_signals_0_1',
    }).kind,
    'signals_v1',
  );
});
