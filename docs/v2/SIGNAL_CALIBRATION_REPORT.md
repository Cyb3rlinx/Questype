# Questype V2 — reporte de calibración de señales

**Modelo evaluado:** `unwritten_road_signals_1_0`  
**Simulación:** 2000 recorridos deterministas  
**Semilla:** 20260911  
**Propósito:** detectar huecos, explosiones y dominancia; no demostrar validez psicológica

## Resultado

El motor permaneció dentro del rango firmado `[-1, 1]`, produjo el mismo resultado con la misma semilla y conservó `null` cuando una ruta no alcanzó evidencia mínima. Ninguna escena superó cinco señales. La selección pseudoaleatoria de opciones tuvo una desviación máxima de 10.8 % respecto del reparto uniforme esperado; esa variación corresponde al muestreo determinista y no altera el peso por Journey.

| Señal | Oportunidades | Contextos | Rutas con medición | Media medida | Mínimo | Máximo |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `autonomy` | 3 | 2 | 37.6 % | 0.7296 | 0.6316 | 1 |
| `structure` | 6 | 5 | 72.9 % | 0.4599 | 0.3176 | 1 |
| `risk_tolerance` | 3 | 2 | 23.5 % | 0.6749 | 0.5556 | 1 |
| `openness_to_uncertainty` | 5 | 3 | 77.4 % | 0.4299 | 0.0303 | 1 |
| `knowledge_orientation` | 8 | 4 | 76.6 % | 0.3575 | 0.2101 | 0.8655 |
| `creation_orientation` | 8 | 3 | 88.6 % | 0.4068 | 0.1593 | 0.9204 |
| `empathy_cooperation` | 11 | 4 | 98.6 % | 0.4196 | 0.1548 | 0.9702 |
| `social_confidence` | 5 | 3 | 76.8 % | 0.5319 | 0.3607 | 1 |
| `leadership_initiative` | 3 | 3 | 36.1 % | 0.7172 | 0.6327 | 1 |
| `persistence` | 2 | 3 | 24.2 % | 0.9616 | 0.9259 | 1 |
| `adaptability` | 3 | 3 | 38.6 % | 0.7082 | 0.5778 | 1 |
| `emotional_regulation` | 4 | 3 | 71.0 % | 0.6419 | 0.4561 | 1 |

## Hallazgos

- Empatía/cooperación, conocimiento y creación tienen la cobertura más amplia en V1.
- Persistencia, autonomía, riesgo, liderazgo y adaptabilidad conservan muchos casos `insufficient`; no se rellenan con un punto medio.
- La mayoría del mapeo V1 es unidireccional porque la historia no fue diseñada como escala bipolar. Los Journeys II y III deben incluir contrastes mejor aislados.
- Los tests sintéticos verifican evidencia opuesta, consistencia direccional, missing data y que un Journey largo no domine otro corto por conteo bruto.
- Los valores son índices internos de expresión relativa a oportunidades. La UI pública debe priorizar bandas y lenguaje contextual.

## Gate

El motor es apto para persistencia paralela experimental. Las señales V1 permanecen ocultas al usuario hasta que la migración, snapshots y copy público pasen sus pruebas. Los storyboards nuevos deben mejorar el balance direccional y reducir deseabilidad social antes de declarar contenido completo.
