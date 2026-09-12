# Perfil acumulativo de Questype

## Propósito

El perfil acumulativo reúne evidencia de distintos Journeys sin sustituir sus resultados individuales. No combina porcentajes arquetípicos, no produce diagnósticos y no completa dimensiones que todavía no fueron observadas con suficiencia.

```text
Resultado de Journey
  → evaluación normalizada de señales
  → snapshot inmutable
  → perfil acumulativo visible
```

## Selección de fuentes

- Una cuenta puede conservar muchos resultados y todos aparecen en su línea de tiempo.
- El snapshot usa el resultado evaluado más reciente de cada Journey.
- Repetir una misma historia reemplaza esa fuente en el snapshot siguiente; no multiplica el peso de un contexto ya cubierto.
- Cada Journey aporta como máximo una contribución normalizada por señal. La cantidad de escenas no le da más peso automático.
- Un resultado sin evaluación V2 puede permanecer en la línea de tiempo, pero no inventa señales.

## Contenido del perfil

La vista MVP incluye:

- nombre visible opcional;
- Journeys representados;
- decisiones analizadas;
- profundidad `initial`, `emerging`, `established` o `extensive`;
- doce dimensiones con estado medido o todavía no explorado;
- bandas descriptivas de evidencia;
- contextos observados;
- línea de tiempo con acceso al resultado específico.

La dirección de una señal se comunica como patrón frecuente, estrategia de contrapeso o sensibilidad al contexto. La interfaz no la presenta como porcentaje de personalidad ni como comparación poblacional.

## Snapshots inmutables

`profile_snapshots` conserva la versión del contrato, versión de agregación, conteos, profundidad, JSON reproducible, cobertura, fingerprint y fecha. `profile_snapshot_sources` guarda por fuente:

- resultado;
- Journey;
- versión del Journey;
- versión de scoring;
- modelo de señales;
- fecha del resultado.

El fingerprint incluye usuario, versión de perfil y fingerprint del agregado. Pedir el mismo perfil vuelve a usar el snapshot existente. Una fuente nueva o una repetición de Journey crea una secuencia nueva; los snapshots anteriores no se modifican.

## PDF

`questype-profile.v1` es un contrato separado del PDF de The Unwritten Road. Incluye panorama, Journeys, dimensiones con evidencia, patrones observados, contextos, resultado arquetípico como sección independiente, áreas por explorar, reflexión, método y alcance. Las secciones de liderazgo o presión aparecen solo si hay datos utilizables.

El render usa fuentes locales y no envía datos personales a servicios externos. La estética final permanece pendiente, pero el contrato, la localización EN/ES y el manejo de datos faltantes son funcionales.

## Límites actuales

- `Initial` corresponde a un Journey distinto; `Emerging`, a dos; `Established`, a tres; `Extensive` queda reservado para cinco o más contextos de Journey.
- Las bandas describen amplitud y coherencia de evidencia interna. No representan exactitud estadística.
- El modelo no es una escala clínica validada ni una implementación de Big Five.
- Los dos Journeys nuevos seguirán en estado draft hasta completar imágenes y QA, por lo que el perfil real local parte con la cobertura conservadora de The Unwritten Road.
