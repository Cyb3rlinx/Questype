# Questype V2 — especificación de señales psicológicas

**Versión del registro:** 1.0  
**Alcance:** constructos narrativos no clínicos  
**Estado:** especificación implementada y cubierta por tests

## Límite de interpretación

Las señales de Questype describen patrones observados dentro de decisiones narrativas. No son diagnósticos, escalas psicométricas validadas, percentiles poblacionales ni mediciones de capacidad. Una señal solo aparece como medida cuando alcanza observaciones independientes mínimas. Una ausencia se presenta como `insufficient`, nunca como un valor medio inventado.

## Registro canónico

| ID                        | Nombre EN / ES                                        | Definición operativa                                                                          | Facetas candidatas                                                                                  | No significa                                             |
| ------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `autonomy`                | Autonomy / Autonomía                                  | Mantener juicio propio y actuar desde razones asumidas internamente.                          | juicio independiente, resistencia a presión, acción autodirigida, responsabilidad sobre la elección | aislamiento, terquedad, rechazo de colaboración          |
| `structure`               | Structure / Estructura                                | Organizar información, secuenciar acciones, definir roles y reducir desorden evitable.        | planificación, priorización, procedimiento, organización, preparación                               | inflexibilidad, perfeccionismo, control                  |
| `risk_tolerance`          | Risk Orientation / Orientación al riesgo              | Aceptar exposición e incertidumbre cuando un beneficio percibido justifica el posible costo.  | tolerancia a consecuencias, riesgo calculado, compromiso bajo incertidumbre                         | coraje, impulsividad, imprudencia                        |
| `openness_to_uncertainty` | Openness to Uncertainty / Apertura a la incertidumbre | Seguir involucrado cuando caminos, explicaciones o resultados siguen incompletos.             | tolerancia a ambigüedad, exploración, respuestas incompletas, posibilidades múltiples               | gusto por el riesgo, creatividad, indecisión             |
| `knowledge_orientation`   | Knowledge Orientation / Orientación al conocimiento   | Buscar evidencia, contexto, comprensión o precisión antes o durante la acción.                | investigación, evidencia, causalidad, priorización de información, reflexión                        | inteligencia, educación, sobrepensamiento                |
| `creation_orientation`    | Creation Orientation / Orientación a la creación      | Generar, construir, rediseñar o transformar posibilidades en alternativas concretas.          | ideación, experimentación, improvisación constructiva, diseño, construcción                         | talento artístico, apertura general, búsqueda de novedad |
| `empathy_cooperation`     | Empathy & Cooperation / Empatía y cooperación         | Integrar perspectivas y consecuencias interpersonales y proteger el funcionamiento colectivo. | perspectiva, respuesta prosocial, acuerdo, consideración interpersonal, alianzas                    | pasividad, acuerdo constante, autosacrificio             |
| `social_confidence`       | Social Confidence / Seguridad social                  | Participar visiblemente, expresar una posición y tolerar exposición interpersonal.            | acercamiento, expresión asertiva, tolerancia al desacuerdo, visibilidad, persuasión                 | extraversión, popularidad, dominio                       |
| `leadership_initiative`   | Leadership Initiative / Iniciativa de liderazgo       | Asumir responsabilidad por coordinación o dirección cuando el grupo necesita acción.          | responsabilidad, coordinación, decisión, delegación, movilización                                   | autoritarismo, dominio, seguridad social por sí sola     |
| `persistence`             | Persistence / Persistencia                            | Sostener esfuerzo significativo ante fricción, demora, cansancio o contratiempos.             | esfuerzo sostenido, tolerancia a frustración, compromiso, recuperación                              | rigidez, obsesión, incapacidad de detenerse              |
| `adaptability`            | Adaptability / Adaptabilidad                          | Actualizar estrategia cuando cambian de forma relevante la evidencia o las restricciones.     | revisión, flexibilidad, reasignación, aprendizaje, cambio contextual                                | indecisión, inconsistencia, falta de compromiso          |
| `emotional_regulation`    | Emotional Regulation / Regulación emocional           | Mantener decisiones funcionales mientras existen estrés, miedo, frustración o tensión.        | impulso, recuperación, tolerancia afectiva, conciencia, compostura                                  | supresión, frialdad, ausencia de miedo                   |

Las traducciones completas, criterios de inclusión/exclusión, facetas y contextos permitidos viven en `src/domain/signals/registry.ts` y forman parte de la suite automatizada.

## Taxonomía estable de contextos

`uncertainty`, `time_pressure`, `physical_risk`, `social_risk`, `resource_scarcity`, `group_coordination`, `interpersonal_conflict`, `moral_tradeoff`, `authority`, `negotiation`, `exploration`, `knowledge_gap`, `caregiving`, `loss`, `change`, `public_visibility`, `responsibility`, `creative_problem_solving`.

Los modelos no pueden inventar contextos libres. Agregar uno requiere modificar el registro, justificarlo y versionar el modelo.

## Unidad de evidencia

Cada contribución privada contiene:

```ts
{
  (journeyId,
    journeyVersion,
    scoringVersion,
    modelId,
    sceneId,
    choiceId,
    signal,
    facet,
    context,
    direction,
    weight,
    signedContribution,
    observationType);
}
```

El navegador recibe historia y opciones, pero nunca `choiceEvidence`, pesos, direcciones ni fingerprints internos.

## Reglas de observación

1. Una escena es una oportunidad para una señal solo si sus opciones producen valores distintos para esa señal.
2. Una contribución debe usar una faceta registrada y un contexto permitido para la señal.
3. Los pesos aceptados están entre `0.1` y `1`; la dirección es `-1` o `1`.
4. Una opción puede aportar a varias señales cuando el comportamiento lo justifica, con un máximo técnico de cinco contribuciones.
5. El engine también registra oportunidades donde la opción elegida aporta cero. Eso representa no haber expresado esa estrategia dentro de ese dilema, no una carencia personal global.
6. Una medición necesita al menos dos oportunidades, dos escenas, un contexto y dos elecciones con contribución efectiva.
7. El modelo de cada Journey se carga solo en servidor.

## Bandas de evidencia

- `insufficient`: no satisface mínimos; el valor público es `null`.
- `emerging`: existe una primera pauta con cobertura limitada.
- `moderate`: varias observaciones y contextos permiten describir una tendencia con cautela.
- `strong`: cobertura amplia dentro de los Journeys disponibles y dirección suficientemente clara.

La banda considera observaciones, contribuciones efectivas, escenas, contextos, Journeys, cobertura y consistencia direccional. Describe profundidad de evidencia, no exactitud estadística.

## Lenguaje público

Permitido:

- “Tus elecciones sugieren…”
- “Este patrón apareció con más frecuencia cuando…”
- “Esta dimensión todavía no fue explorada lo suficiente.”

No permitido:

- “Tu personalidad verdadera es…”
- “93 % exacto”
- “Científicamente probado”
- lenguaje diagnóstico o clínico.
