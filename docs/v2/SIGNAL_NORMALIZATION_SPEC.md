# Questype V2 — normalización y agregación de señales

**Versión:** 1.0  
**Propósito:** comparar evidencia entre Journeys con cantidades de oportunidades distintas

## Objetivos

1. Evitar que un Journey domine por contener más escenas sobre una señal.
2. Mantener la procedencia hasta Journey, versión, escena y choice.
3. Diferenciar ausencia de evidencia de una expresión intermedia observada.
4. Producir resultados deterministas y fingerprints reproducibles.
5. No mezclar porcentajes arquetípicos con el perfil acumulativo.

## Cálculo dentro de un Journey

Para una señal `s` y escena `j`, cada opción tiene un valor firmado:

```text
v(j, opción, s) = suma(dirección × peso)
```

La escena cuenta como oportunidad si al menos dos opciones tienen valores distintos. Su masa máxima es:

```text
m(j, s) = max(|v(j, opción, s)|)
```

Para un Journey completado:

```text
valor(s) = clamp(
  suma(v elegido por escena) / suma(m por escena),
  -1,
  1
)
```

Un cero calculado puede ser legítimo cuando existieron oportunidades suficientes y las decisiones se equilibraron o no expresaron esas estrategias. Cuando no se alcanzan los mínimos, el valor es `null`.

## Cobertura y consistencia

```text
cobertura = oportunidades respondidas / oportunidades del Journey

consistencia =
  |suma de contribuciones elegidas| /
  suma de |contribuciones elegidas|
```

La consistencia queda en `0` cuando no hubo contribuciones distintas de cero. No se interpreta como inestabilidad emocional; solo indica que no existe una dirección clara para esa señal.

## Banda de evidencia

Primero se aplican mínimos duros:

- dos observaciones;
- dos contribuciones efectivas;
- dos escenas;
- un contexto.

Después se calcula una fuerza descriptiva acotada:

```text
0.30 × min(observaciones / 6, 1)
+ 0.25 × min(escenas / 5, 1)
+ 0.15 × min(contextos / 3, 1)
+ 0.10 × min(Journeys / 3, 1)
+ 0.10 × consistencia
+ 0.10 × cobertura
```

Umbrales:

- `< 0.52`: emerging;
- `0.52–0.7799`: moderate;
- `≥ 0.78`: strong.

Estos umbrales son reglas de producto versionadas. No representan intervalos de confianza estadísticos.

## Agregación entre Journeys

Cada Journey aporta un valor ya normalizado dentro de su propio conjunto de oportunidades. Por ello, catorce observaciones en un Journey no pesan catorce veces más que tres observaciones en otro.

Peso por banda:

| Banda        | Peso máximo del Journey |
| ------------ | ----------------------: |
| insufficient |                       0 |
| emerging     |                    0.50 |
| moderate     |                    0.75 |
| strong       |                    1.00 |

El valor acumulado es el promedio ponderado de los valores normalizados por Journey. El conteo bruto se conserva para auditoría, pero no multiplica el peso de ese Journey.

## Profundidad global

- `initial`: un Journey completado;
- `emerging`: dos Journeys distintos;
- `established`: tres o cuatro;
- `extensive`: cinco o más, reservado para la expansión futura.

Profundidad describe amplitud contextual. No equivale a precisión ni validación científica.

## Fingerprint e inmutabilidad

Un `JourneySignalAssessment` incluye modelo, versiones, resultado fuente, resumen y evidencia; su fingerprint es SHA-256 sobre serialización canónica. El perfil acumulativo ordena los resultados fuente por ID y genera un fingerprint nuevo. Cambiar una fuente, versión o valor cambia el fingerprint.

Un nuevo Journey genera un snapshot nuevo. Los snapshots anteriores no se editan.

## Missing data

- Cero oportunidades: `insufficient`, `value: null`.
- Oportunidades sin suficientes contribuciones elegidas: `insufficient`, `value: null`.
- El perfil no muestra barras, porcentajes ni frases direccionales para valores `null`.
- La UX invita a explorar esa dimensión mediante otro Journey sin insinuar déficit.
