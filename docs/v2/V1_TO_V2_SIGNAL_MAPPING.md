# Questype V2 — mapeo conservador de V1 a señales V2

**Modelo:** `unwritten_road_signals_1_0`  
**Fuente:** choices de The Unwritten Road 1.1  
**Estado:** evidencia paralela privada; no cambia el resultado V1

## Método

El mapeo fue revisado por choice. Utiliza la acción descrita, el dilema narrativo y sus dimensiones legacy como apoyo, pero nunca deriva señales desde el arquetipo final. Los pesos son conservadores (`0.45–0.85`). La ausencia de una contribución no se traduce automáticamente en la dirección opuesta.

The Unwritten Road no fue escrito para medir las doce señales. Este modelo recupera evidencia defendible sin reescribir la historia y deja huecos visibles cuando la opción elegida no aporta suficiente información.

## Cobertura

| Señal                       | Escenas con oportunidad | Facetas | Contextos | Lectura                                                     |
| --------------------------- | ----------------------: | ------: | --------: | ----------------------------------------------------------- |
| Autonomía                   |                       3 |       2 |         2 | limitada; principalmente ritual y cierre                    |
| Estructura                  |                       6 |       4 |         5 | útil en preparación, orden y coordinación                   |
| Orientación al riesgo       |                       3 |       3 |         2 | limitada; puente, marea y objeto                            |
| Apertura a la incertidumbre |                       5 |       3 |         3 | moderada, con una dirección negativa explícita en el cierre |
| Conocimiento                |                       8 |       4 |         4 | amplia, centrada en investigación y reflexión               |
| Creación                    |                       8 |       5 |         3 | amplia, centrada en soluciones y diseño                     |
| Empatía y cooperación       |                      11 |       3 |         4 | sobre representada respecto de otras señales                |
| Seguridad social            |                       5 |       3 |         3 | moderada; acercamiento, visibilidad y coordinación          |
| Iniciativa de liderazgo     |                       3 |       3 |         3 | limitada; coordinación y responsabilidad                    |
| Persistencia                |                       2 |       2 |         3 | débil; no debe generalizarse más allá de estos episodios    |
| Adaptabilidad               |                       3 |       3 |         3 | limitada; cambio de estrategia y reasignación               |
| Regulación emocional        |                       4 |       3 |         3 | limitada a escenas con presión o trance                     |

Ninguna escena contiene más de cinco señales. Esto evita explicar un mismo choice como evidencia universal.

## Escenas mapeadas

| Escena                        | Señales principales recuperadas                                  |
| ----------------------------- | ---------------------------------------------------------------- |
| 01 — La tinta aún está fresca | estructura, apertura a la incertidumbre                          |
| 02 — El mercader              | conocimiento, empatía/cooperación, apertura                      |
| 03 — El puente roto           | riesgo, estructura, creación, apertura                           |
| 04 — La torre en tormenta     | estructura, conocimiento, empatía, regulación                    |
| 05 — Mara junto al fuego      | conocimiento, creación, empatía, seguridad social                |
| 06 — La carreta               | estructura, creación, empatía, liderazgo, adaptabilidad          |
| 07 — La criatura              | conocimiento, creación, empatía, regulación                      |
| 08 — La costa                 | estructura, conocimiento, empatía, seguridad social              |
| 09 — La marea                 | riesgo, empatía, liderazgo, persistencia, regulación             |
| 10 — Los cuatro objetos       | autonomía, riesgo, apertura, creación, empatía                   |
| 11 — El guardián              | autonomía, conocimiento, empatía, seguridad social               |
| 12 — El banquete              | empatía, seguridad social                                        |
| 13 — El faro apagado          | estructura, creación, liderazgo, persistencia, adaptabilidad     |
| 14 — El legado                | conocimiento, creación, empatía, seguridad social, adaptabilidad |
| 15 — La melodía               | autonomía, apertura, conocimiento, creación, regulación          |

## Riesgos de sesgo

- Empatía/cooperación tiene más oportunidades que liderazgo, persistencia o riesgo.
- La historia premia narrativamente algunas acciones de ayuda; esto puede aumentar deseabilidad social.
- Varias señales V1 son unidireccionales: elegir otra estrategia produce cero evidencia, no evidencia negativa.
- Social trust legacy solo se usa como apoyo contextual; no se equipara automáticamente con seguridad social.
- Impulsividad legacy no se equipara con riesgo. Solo se mapea riesgo cuando la escena contiene exposición y costo reconocibles.
- Protección no se equipara con regulación emocional ni empatía sin evidencia en el texto del choice.

## Escenas/opciones no forzadas

No todas las opciones contribuyen a todas las señales presentes en una escena. El engine registra la oportunidad, pero exige dos contribuciones efectivas antes de mostrar un valor. En simulación, varias respuestas terminan con `insufficient` en autonomía, riesgo, liderazgo, persistencia o adaptabilidad. Ese resultado es correcto y debe conservarse.

## Compatibilidad

El modelo vive en `signals.server.ts`, separado de `journey-v1.ts`. Por lo tanto:

- no cambia el hash V1;
- no cambia ranking ni porcentajes;
- no llega al manifiesto público;
- puede versionarse o retirarse sin reescribir resultados arquetípicos históricos.
