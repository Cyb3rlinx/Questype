# Modelo de perfil acumulativo Questype V2

## Propósito

El perfil acumulativo describe patrones observados a través de varios contextos narrativos. No diagnostica, no promete precisión clínica y no convierte una decisión aislada en una identidad fija.

El modelo separa tres capas:

1. **Evidencia de Journey:** respuestas y señales normalizadas para una release concreta.
2. **Agregación de perfil:** combinación versionada de señales comparables entre Journeys.
3. **Presentación:** lenguaje, gráficos, arquetipos y recomendaciones legibles para el usuario.

Esta separación permite corregir la presentación sin alterar evidencia histórica y actualizar el agregador mediante un snapshot nuevo, sin sobrescribir el anterior.

## Doce señales núcleo

| ID V2 | Etiqueta de trabajo EN / ES | Estado en V1 | Fuente V1 utilizable | Regla de migración |
|---|---|---|---|---|
| `curiosity_openness` | Curiosity & openness / Curiosidad y apertura | Directa | `curiosity` | Backfill permitido con versión de mapeo |
| `structure_planning` | Structure & planning / Estructura y planificación | Parcial | `strategic` | Usar con confianza reducida; medir directo en V2 |
| `empathy_cooperation` | Empathy & cooperation / Empatía y cooperación | Parcial compuesta | `empathy`, parte de `social_trust` | Mantener facetas separadas; no promediar a ciegas |
| `autonomy` | Autonomy / Autonomía | Directa | `autonomy` | Backfill permitido |
| `risk_orientation` | Risk orientation / Orientación al riesgo | Directa | `risk_tolerance` | Backfill permitido |
| `deliberation` | Deliberation / Deliberación | Parcial | `rational`, `analytical` | No invertir `impulsive`; medir directo |
| `intuitive_orientation` | Intuitive orientation / Orientación intuitiva | Directa | `intuitive` | Backfill permitido |
| `adaptability` | Adaptability / Adaptabilidad | Ausente | — | Nueva evidencia obligatoria |
| `persistence` | Persistence / Persistencia | Directa | `persistence` | Backfill permitido |
| `social_assertiveness` | Social confidence / Seguridad social | Parcial débil | parte de `dominant` | No equiparar dirección con confianza; medir directo |
| `leadership_agency` | Leadership initiative / Iniciativa de liderazgo | Parcial | `dominant`, algunas elecciones Hero/Ruler | No derivar desde arquetipo final; medir directo |
| `emotional_regulation` | Emotional regulation / Regulación emocional | Ausente | — | Nueva evidencia obligatoria bajo presión |

Los nombres son etiquetas de producto, pendientes de una revisión final en español neutro y de una revisión profesional de constructo. No deben presentarse como escalas validadas científicamente.

## Unidad de evidencia

Cada elección puede emitir cero o más contribuciones a señales V2. Una contribución contiene:

```ts
type SignalContribution = {
  dimensionId: CoreDimensionId;
  raw: number;              // peso firmado pequeño
  opportunity: number;      // oportunidad absoluta disponible
  context: ContextTag;      // p. ej. uncertainty, social, pressure
  facet?: string;           // p. ej. empathy o cooperation
};
```

Las ponderaciones siguen en servidor. El manifiesto público puede declarar qué dimensiones cubre un Journey, pero nunca los pesos de cada opción.

## Resultado de señal por Journey

Para cada dimensión medida, se persiste:

```ts
type JourneySignalScore = {
  dimensionId: CoreDimensionId;
  centeredScore: number;       // diferencia frente a la línea base del Journey
  normalizedScore: number;     // escala interna común, limitada
  displayScore: number;        // 0–100 para UI; no es percentil
  responseCount: number;
  independentSceneCount: number;
  observedOpportunity: number;
  targetOpportunity: number;
  coverage: number;            // 0–1
  contexts: Record<ContextTag, ContextEvidence>;
  confidenceBand: "insufficient" | "emerging" | "supported";
  scoringVersion: string;
  mappingVersion: string | null;
};
```

Una señal no aparece como conclusión cuando `confidenceBand` es `insufficient`. Ausencia de evidencia se conserva como `null`; nunca se convierte en 50.

## Normalización

Cada Journey define, por dimensión, la media y dispersión esperadas bajo un modelo de respuesta uniforme y un rango robusto calculado por simulación.

1. Sumar contribuciones crudas.
2. Restar la media de oportunidad del Journey.
3. Dividir por su dispersión esperada, con un piso para evitar inestabilidad.
4. Limitar el valor interno a `[-3, 3]`.
5. Transformar solo para visualización: `display = round(50 + normalized * 15)`, limitado a `[5, 95]`.

El `displayScore` indica tendencia relativa dentro del instrumento, no comparación contra población real.

## Agregación entre Journeys

La puntuación acumulativa por dimensión usa evidencia normalizada, cobertura y relevancia declarada:

```text
weight(journey, dimension) =
  relevance × min(1, independentScenes / targetScenes) × qualityFactor

profileScore = sum(normalizedScore × weight) / sum(weight)
```

- `relevance` pertenece a la versión publicada del Journey.
- `qualityFactor` baja si el usuario omitió decisiones, completó una versión heredada con mapeo parcial o hay poca independencia entre escenas.
- Ningún Journey pesa más de 50% cuando existen tres o más fuentes válidas para una dimensión.
- Dos resultados del mismo Journey cuentan como intentos del mismo contexto. Por defecto se usa el más reciente; el usuario puede elegir comparar intentos, pero no inflar la profundidad.

## Consistencia y diferencias contextuales

No se penaliza que una persona actúe distinto por contexto. El snapshot muestra:

- **patrón consistente:** direcciones semejantes en al menos dos contextos;
- **dependiente del contexto:** diferencia material y repetida entre contextos;
- **evidencia en desarrollo:** una sola fuente o cobertura baja;
- **sin evidencia suficiente:** no se interpreta.

No se usa la palabra contradicción en la experiencia del usuario.

## Profundidad del perfil

La profundidad mide cantidad y cobertura de observaciones, no certeza psicológica.

| Nivel | Regla propuesta para V2 |
|---|---|
| Inicial | 1 Journey completo |
| En desarrollo | 2 Journeys distintos y al menos 6 señales con evidencia `supported` |
| Establecido | 3 Journeys distintos, al menos 9 señales `supported` y cobertura en incertidumbre, interacción social y presión |
| Extenso | Reservado para expansión: 5 Journeys distintos y al menos 10 señales `supported` en 4 contextos |

V2 puede alcanzar **Establecido** al completar los tres Journeys previstos. **Extenso** comunica una etapa futura y no bloquea funciones pagadas actuales.

## Snapshots inmutables

Cada cálculo crea un `profile_snapshot` con:

- `profile_model_version`;
- locale utilizado para la interpretación;
- sesiones y releases fuente;
- señales de cada Journey;
- ponderaciones y cobertura;
- señales agregadas;
- profundidad;
- interpretación estructurada;
- fecha de creación.

Un algoritmo nuevo crea otro snapshot. La UI puede ofrecer “actualizar mi lectura” y explicar qué fuentes usa. No se reescribe el snapshot que el usuario descargó o compartió.

## Arquetipos dentro del perfil

Los arquetipos siguen siendo el lenguaje narrativo principal de cada Journey. El perfil puede mostrar resonancias arquetípicas como una capa editorial derivada, pero:

- no suma porcentajes de varios Journeys;
- no fuerza un único arquetipo global;
- no confunde `45%` de una tarjeta con una señal de `45/100`;
- conserva el contexto que produjo cada lectura.

## Límites de afirmación

La UI y el PDF deben usar fórmulas como “tus decisiones sugieren”, “en este contexto” y “la evidencia disponible”. Deben evitar “eres”, “demuestra”, “diagnóstico”, “precisión” y cualquier comparación poblacional sin datos normativos reales.
