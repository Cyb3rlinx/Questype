# Stage 3 — Persistencia de señales V2

## Estado

Implementado y validado de forma local en `codex/questype-v2`. Esta etapa no modifica el cálculo, el contrato ni el resultado visible de The Unwritten Road V1.

## Modelo persistido

- `journey_signal_models` conserva un snapshot inmutable del modelo psicológico y su hash por versión de Journey.
- `result_signal_assessments` relaciona un resultado con el modelo exacto que lo evaluó.
- `result_construct_scores` almacena las doce señales, su suficiencia de evidencia y métricas de cobertura.
- `result_construct_evidence` conserva la procedencia de cada observación: Journey, escena, elección, faceta, contexto, dirección y peso.

Los valores continuos se guardan como enteros en milésimas para evitar diferencias entre runtimes. Los IDs de evidencia se derivan de contenido estable y las escrituras son idempotentes.

## Compatibilidad y privacidad

- La migración `0002_signal_evidence.sql` solo agrega tablas e índices.
- Los resultados históricos V1 no se recalculan ni reciben evidencia retroactiva.
- La finalización actual sigue produciendo primero el perfil arquetípico V1 congelado.
- La API de resultados no expone mapas, pesos ni contribuciones. Solo agrega `signal_assessment_available`.
- El borrado del resultado elimina su evaluación, puntuaciones y evidencia mediante claves foráneas con cascada.

## Verificación

`npm run check:full` valida el hash V1 congelado, 67 pruebas de dominio, contenido, compilación, la migración sobre una base V1 poblada y 22 controles web. La prueba web confirma que un resultado nuevo persiste el análisis paralelo sin filtrar evidencia privada.

