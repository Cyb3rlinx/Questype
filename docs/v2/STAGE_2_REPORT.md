# Questype V2 — reporte de Etapa 2

**Estado:** completada en local

**Alcance:** registro multi-Journey, manifiesto visual, rutas compatibles y migración D1 `0001`

**Deploy:** ninguno

## Resultado

Questype dejó de depender de un Journey singleton en la capa web. The Unwritten Road ahora se resuelve mediante un registro con identidad estable, versión, acceso, locales, cantidad de escenas, actos, metadatos y assets. El modelo de scoring se carga únicamente desde un módulo de servidor y no forma parte del manifiesto público.

El contenido y los resultados V1 conservan el hash `116ab299e56b8ff5ac00d123794521bf320852c4efaaf3814db2955429a9601e`.

## Registro y contratos

Se agregaron cuatro límites explícitos:

1. `JourneyPublicManifest` contiene solamente identidad, metadatos localizados, estado, acceso y assets.
2. `JourneyServerModel` contiene el contenido puntuable, el motor, el hash y el release legacy.
3. `JourneyDefinition` une ambos mediante un loader dinámico de servidor.
4. `JourneyRegistry` resuelve por slug, ID estable o ID legacy y ofrece el catálogo público.

The Unwritten Road usa:

- ID estable: `journey_unwritten_road`;
- slug: `the-unwritten-road`;
- versión de Journey: `1.1`;
- versión de scoring: `1.1`;
- acceso: `free`;
- estado: `published`.

El contrato compartido acepta entre 3 y 48 escenas, hasta 24 actos, entre 2 y 6 opciones por escena e IDs estables que no dependen de la nomenclatura de V1. Las reglas especiales de 15 escenas, siete actos y nombres `scene_XX_choice_X` se conservan únicamente para validar el contenido legacy.

## Manifiesto visual

Las imágenes dejaron de resolverse mediante offsets y condiciones dentro del reproductor. Cada escena y representación declara:

- asset principal y derivado responsive;
- dimensiones reales;
- punto focal;
- texto alternativo EN/ES;
- procedencia;
- afirmación obligatoria `containsReadableLanguage: false`;
- estado de QA;
- variantes por elección y continuidad declarada entre escenas.

La elección de objeto de la escena 10 se conserva visualmente en la escena 11 mediante `inheritsChoiceFrom`, sin crear ramas narrativas.

El manifiesto de V1 registra una excepción visual legacy aprobada en Fase 0. Algunos assets quedan en `pending` o `repair` por posible pseudotexto; cualquier Journey nuevo en estado `published` queda bloqueado si uno de sus assets no está en `approved`.

## Rutas

Rutas canónicas nuevas:

- `/journeys`
- `/journey/[slug]/start`
- `/journey/[slug]/play`
- `/journey/[slug]/processing`

Compatibilidad:

- `/start` redirige a `/journey/the-unwritten-road/start` y conserva `?new=1`;
- `/journey` redirige a `/journey/the-unwritten-road/play`;
- `/processing` redirige a `/journey/the-unwritten-road/processing`;
- `/result/[id]` y `/share/[id]` permanecen estables.

El reproductor obtiene título, actos, cantidad de escenas, progreso e imágenes desde la sesión registrada. El audio reconoce la ruta canónica `/play`.

## Persistencia D1

La migración `drizzle/0001_multi_journey.sql` agrega:

- `journeys`;
- `journey_versions`;
- `web_sessions.journey_id`;
- `web_sessions.journey_version_id`;
- `web_sessions.updated_at`;
- índice por Journey, estado y fecha.

El backfill convierte cada `web_release` en una versión, asocia todas las sesiones existentes a The Unwritten Road y preserva respuestas, resultados y shares. El esquema Drizzle incluye el snapshot `0001_snapshot.json` para que las migraciones futuras partan de esta estructura.

La aplicación soporta temporalmente tanto el esquema V1 como el migrado. Esto permite aplicar primero la migración aditiva y desplegar el código después, sin romper el Journey activo.

## Validación

| Control                            | Resultado                                             |
| ---------------------------------- | ----------------------------------------------------- |
| Pruebas automatizadas              | 62/62                                                 |
| Fixtures dorados V1                | 14/14                                                 |
| Arquetipos V1 cubiertos            | 12/12                                                 |
| Journey genérico de prueba         | 18 escenas aceptadas                                  |
| Manifiesto sin score maps públicos | aprobado                                              |
| Assets Journey I                   | 15/15 por representación resueltos                    |
| Variantes de escena 10             | 4/4 por representación                                |
| D1 con datos V1 antes de migrar    | aprobado                                              |
| Sesiones asociadas por backfill    | 100 %                                                 |
| Resultados y shares históricos     | preservados                                           |
| `PRAGMA foreign_key_check`         | 0 errores                                             |
| Web smoke                          | 21/21; catálogo, Journey, PDF y sharing aprobados     |
| Build de producción                | aprobado                                              |
| Contenido V1                       | hash sin cambios                                      |

## Archivos principales

- `src/domain/journeys/contracts.ts`
- `src/domain/journeys/registry.ts`
- `src/domain/journeys/the-unwritten-road/manifest.ts`
- `src/domain/journeys/the-unwritten-road/scoring.server.ts`
- `drizzle/0001_multi_journey.sql`
- `drizzle/meta/0001_snapshot.json`
- `scripts/verify-v2-d1.mjs`
- `tests/journey-registry.test.ts`

## Lo que no se implementó

- No se añadieron señales V2 al contenido.
- No se recalcularon perfiles ni resultados V1.
- No se crearon cuentas, magic links, compras ni entitlements.
- No se escribieron todavía Council of Realms o Stormbound Passage.
- No se generaron imágenes nuevas.
- No se modificó D1 remota ni se hizo deploy.

## Próximo gate

La Etapa 3 puede comenzar con el motor de las doce señales, sus facetas y contextos. Debe registrar evidencia paralela sin cambiar el resultado arquetípico V1, persistirla localmente y producir un reporte de cobertura y calibración. Las señales no se muestran al usuario hasta aprobar ese reporte.
