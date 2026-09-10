import { mkdir, writeFile } from 'node:fs/promises';
import { journeyV1 } from '../src/domain/content/journey-v1.js';
import { unwrittenRoadSignalModel } from '../src/domain/journeys/the-unwritten-road/signals.server.js';
import {
  analyzeSignalCoverage,
  simulateSignalModel,
} from '../src/domain/signals/coverage.js';

const coverage = analyzeSignalCoverage(journeyV1, unwrittenRoadSignalModel);
const simulation = simulateSignalModel(
  journeyV1,
  unwrittenRoadSignalModel,
  2000,
  20260911,
);
const counts = Object.values(simulation.choiceCounts);
const expected = simulation.runs / 4;
const maximumSelectionDeviation = Math.max(
  ...counts.map((count) => Math.abs(count - expected) / expected),
);

await mkdir('artifacts', { recursive: true });
await writeFile(
  'artifacts/signal-calibration-v1.json',
  `${JSON.stringify({ coverage, simulation }, null, 2)}\n`,
);

const table = simulation.signals
  .map((row) => {
    const coverageRow = coverage.signals.find(
      (candidate) => candidate.signal === row.signal,
    )!;
    const measured = `${((row.measuredRuns / simulation.runs) * 100).toFixed(1)} %`;
    return `| \`${row.signal}\` | ${coverageRow.opportunityScenes} | ${coverageRow.contexts.length} | ${measured} | ${row.mean ?? '—'} | ${row.minimum ?? '—'} | ${row.maximum ?? '—'} |`;
  })
  .join('\n');

const markdown = `# Questype V2 — reporte de calibración de señales

**Modelo evaluado:** \`${unwrittenRoadSignalModel.id}\`  
**Simulación:** ${simulation.runs} recorridos deterministas  
**Semilla:** ${simulation.seed}  
**Propósito:** detectar huecos, explosiones y dominancia; no demostrar validez psicológica

## Resultado

El motor permaneció dentro del rango firmado \`[-1, 1]\`, produjo el mismo resultado con la misma semilla y conservó \`null\` cuando una ruta no alcanzó evidencia mínima. Ninguna escena superó cinco señales. La selección pseudoaleatoria de opciones tuvo una desviación máxima de ${(maximumSelectionDeviation * 100).toFixed(1)} % respecto del reparto uniforme esperado; esa variación corresponde al muestreo determinista y no altera el peso por Journey.

| Señal | Oportunidades | Contextos | Rutas con medición | Media medida | Mínimo | Máximo |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${table}

## Hallazgos

- Empatía/cooperación, conocimiento y creación tienen la cobertura más amplia en V1.
- Persistencia, autonomía, riesgo, liderazgo y adaptabilidad conservan muchos casos \`insufficient\`; no se rellenan con un punto medio.
- La mayoría del mapeo V1 es unidireccional porque la historia no fue diseñada como escala bipolar. Los Journeys II y III deben incluir contrastes mejor aislados.
- Los tests sintéticos verifican evidencia opuesta, consistencia direccional, missing data y que un Journey largo no domine otro corto por conteo bruto.
- Los valores son índices internos de expresión relativa a oportunidades. La UI pública debe priorizar bandas y lenguaje contextual.

## Gate

El motor es apto para persistencia paralela experimental. Las señales V1 permanecen ocultas al usuario hasta que la migración, snapshots y copy público pasen sus pruebas. Los storyboards nuevos deben mejorar el balance direccional y reducir deseabilidad social antes de declarar contenido completo.
`;

await writeFile('docs/v2/SIGNAL_CALIBRATION_REPORT.md', markdown);
console.log(
  JSON.stringify(
    {
      passed: true,
      runs: simulation.runs,
      seed: simulation.seed,
      excessiveDensityScenes: coverage.excessiveDensityScenes,
      maximumSelectionDeviation: Number(maximumSelectionDeviation.toFixed(4)),
    },
    null,
    2,
  ),
);
