# Questype V2 — auditoría previa a la continuación del MVP

**Rama:** `codex/questype-v2`  
**Baseline:** `7ab3fb7`  
**Fecha:** 2026-09-11  
**Estado:** gate de auditoría completado; ningún cambio de producción

## Resultado ejecutivo

El repositorio coincide con el reporte de Etapa 2. The Unwritten Road funciona mediante el registro multi-Journey, conserva sus rutas históricas, persiste en D1 y produce el mismo resultado, PDF y share que V1. La siguiente ampliación puede ser aditiva si el motor de señales se mantiene paralelo al scoring arquetípico y si las nuevas identidades, evidencias y snapshots se agregan mediante tablas nuevas.

La continuación no requiere modificar el contenido ni el algoritmo V1. Sí requiere separar el contrato narrativo común del resultado arquetípico legacy antes de que Council of Realms y Stormbound Passage puedan convertirse en Journeys de señales.

## Baseline comprobado

`npm run check:full` fue ejecutado antes de cambiar código:

| Control | Resultado |
| --- | --- |
| TypeScript | aprobado |
| Pruebas automatizadas | 62/62 |
| Fixtures dorados V1 | 14/14 |
| Hash de contenido V1 | `116ab299e56b8ff5ac00d123794521bf320852c4efaaf3814db2955429a9601e` |
| Validación del contenido | 15 escenas, 60 decisiones, sin errores ni advertencias |
| Migración D1 V1→Etapa 2 | aprobada, cero errores de claves foráneas |
| Web smoke | 21/21 |
| PDF y sharing V1 | aprobados dentro del flujo web |

## Inventario de la implementación actual

### Journey y contenido

- `src/domain/journeys/contracts.ts`: manifiesto público, assets y loader privado.
- `src/domain/journeys/registry.ts`: resolución por slug, ID estable e ID legacy.
- `src/domain/journeys/the-unwritten-road/manifest.ts`: identidad, localización y manifiesto visual.
- `src/domain/journeys/the-unwritten-road/scoring.server.ts`: contenido, hash y motor V1 cargados en servidor.
- `src/domain/content/journey-v1.ts`: historia y pesos arquetípicos congelados.
- `src/domain/content/validate.ts`: validación general con protecciones especiales V1.

### Scoring y resultado

- `src/domain/scoring/engine.ts`: scores legacy, calibración por oportunidades y ranking.
- `src/domain/scoring/profile.ts`: perfil estructurado arquetípico.
- `src/ai/fallback.ts` y `src/ai/contracts.ts`: interpretación determinista y límites de lenguaje.
- `src/reports/data.ts` y `lib/pdf-renderer.ts`: contrato y render PDF V1.
- `src/sharing/contracts.ts`: proyección pública por lista permitida.

### Persistencia y API

- `db/schema.ts`: visitors, releases, journeys, versiones, sesiones, respuestas, resultados y shares.
- `drizzle/0000_tan_dreadnoughts.sql`: D1 V1.
- `drizzle/0001_multi_journey.sql`: registro multi-Journey y backfill.
- `src/application/web-service.ts`: ownership anónimo, sesión, respuesta, resultado y sharing.
- `app/api/**`: adaptadores HTTP del servicio.

### UI y localización

- `app/page.tsx`: landing V1.
- `app/journeys/page.tsx` y `components/journey/catalog.tsx`: catálogo inicial.
- `app/journey/[slug]/**`: rutas canónicas.
- `components/i18n-provider.tsx` y `src/i18n/**`: idioma EN/ES por cookie.
- `components/journey/result-view.tsx`: resultado, descarga y sharing.

### Assets

- El manifiesto declara dimensiones, punto focal, alt EN/ES, procedencia, QA y ausencia de lenguaje legible.
- The Unwritten Road conserva la excepción visual legacy documentada.
- No existen assets de producción para los Journeys II y III.

## Comportamiento congelado

1. Hash, choices y pesos de `journey-v1.ts`.
2. Ranking y porcentajes arquetípicos V1.
3. Interpretaciones, títulos de personaje y copy de resultados V1.
4. Contrato histórico de `web_results.profile_json` e `interpretation_json`.
5. PDF y shares ya creados.
6. Ownership anónimo basado en cookie `HttpOnly` y hash.
7. Rutas `/result/[id]` y `/share/[id]`.

## Extensiones seguras

- Añadir un catálogo de doce señales y un modelo de evidencia separado.
- Asociar un `JourneySignalModel` privado a cada versión.
- Calcular evidencia desde respuestas, nunca desde el resultado arquetípico.
- Guardar scores y evidencia en tablas nuevas enlazadas al resultado inmutable.
- Añadir usuarios, sesiones de autenticación y magic links sin reemplazar visitors.
- Reclamar resultados demostrando ownership anónimo en servidor.
- Crear snapshots acumulativos nuevos en vez de mutarlos.
- Añadir Journeys `draft` con assets internos pendientes y sin rutas públicas jugables.
- Generalizar reportes por tipo mientras el renderer V1 sigue disponible.

## Brechas y riesgos

### Contrato de contenido

`JourneyContent` exige doce arquetipos y al menos treinta dimensiones. Esto es correcto para V1 pero no debe obligar a los futuros Journeys de señales a fingir un modelo arquetípico. Se necesita un contrato narrativo compartido o una unión discriminada antes de integrar contenido draft.

### Resultado y PDF

El servicio genera siempre `StructuredProfile` y el PDF contiene copy fijo de quince momentos y doce arquetipos. Los reportes nuevos necesitan contratos discriminados y renderers propios. El código V1 debe permanecer como adapter legacy.

### Autenticación

No hay paquete ni tablas de autenticación. Una integración externa no debe convertirse en dependencia para completar el Journey gratuito. El proveedor de correo debe quedar abstraído y desactivado en producción mientras no existan secretos/configuración aprobados.

### Migración D1

Las columnas multi-Journey añadidas en Etapa 2 son anulables por restricciones de SQLite. La aplicación debe seguir validando asociaciones y todas las tablas nuevas deben tener claves e índices explícitos. La prueba de migración debe partir de una base V1 poblada.

### Evidencia V1

Los traits legacy ofrecen correspondencias parciales, pero no prueban por sí solos las doce señales. El mapeo debe realizarse por escena y choice, con pesos conservadores y huecos visibles. Social confidence, emotional regulation y adaptability tienen cobertura limitada en V1.

### Assets draft

El manifiesto exige un registro por escena y representación. Los Journeys draft pueden reutilizar un placeholder interno existente con QA `pending`; no pueden declararse `published` ni usar URLs inexistentes.

### QA de contenido

No existe todavía un validador de deseabilidad social, densidad de señales, balance direccional o cobertura por contexto. Debe añadirse junto con las simulaciones antes de aprobar los Journeys nuevos.

## Conflictos entre el prompt y el repositorio

1. El prompt menciona Better Auth, pero el repositorio no lo incluye y no existe una decisión técnica que obligue a incorporar una dependencia externa. Se usará una capa passwordless compatible con D1 y un proveedor de correo abstracto; su activación productiva queda aplazada.
2. El prompt pide arquitectura y funcionamiento de PDFs acumulativos, pero difiere el diseño visual final. Se implementará un renderer determinista funcional con el lenguaje y las fuentes locales existentes.
3. El prompt pide tres definiciones de Journey, pero prohíbe fingir assets aprobados. Council y Stormbound permanecerán `draft` y usarán placeholders internos declarados `pending`.
4. Las doce señales no son escalas psicométricas validadas. La UI usará bandas descriptivas y evidencia observada, sin porcentajes de exactitud ni percentiles poblacionales.

## Migraciones requeridas

La próxima migración aditiva debe cubrir:

- definiciones/versiones de modelos de señales;
- score resumido y evidencia por resultado;
- usuarios passwordless, sesiones y magic links de un solo uso;
- vínculo opcional `user_id` en sesiones/resultados mediante tabla de claims o columna nullable;
- snapshots acumulativos y sus fuentes.

No se eliminarán ni reescribirán filas V1.

## Cobertura de tests que falta

- contribución determinista y provenance de señales;
- normalización por oportunidades;
- missing data y bandas de evidencia;
- agregación de uno, dos y tres Journeys;
- fingerprint y snapshots inmutables;
- claim legítimo, ajeno, repetido y replay;
- localización y progresión de contenidos draft;
- estados y enlaces del catálogo;
- PDFs discriminados y missing data;
- cobertura, densidad y dirección de los dos storyboards.

## Decisión de implementación

La ruta menos destructiva es construir primero un módulo de señales completamente independiente, congelar su especificación y demostrar su comportamiento con simulaciones. Luego se conecta a V1 en paralelo, se migra D1 y se agrega identidad opcional. Solo después se integran perfiles, UX y Journeys draft.

Ningún gate de esta continuación autoriza push, deploy, D1 remota, Stripe, pricing definitivo o imágenes finales.
