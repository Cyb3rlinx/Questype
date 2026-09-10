# Plan de migraciones D1 — Questype V2

## Alcance

Este es un diseño de migración. No crea ni ejecuta archivos SQL en local o producción. Los nombres finales se congelarán al comenzar la implementación.

## Reglas operativas

1. Hacer backup/export verificable antes de cada migración remota.
2. Probar cada paso contra una copia local poblada con fixtures V1.
3. Aplicar solo cambios aditivos en la primera salida V2.
4. No recalcular resultados V1 ni reemplazar su JSON.
5. Publicar código compatible con esquema viejo/nuevo antes de exigir columnas nuevas.
6. Separar migración de estructura, backfill y activación de funciones.
7. Cada backfill es idempotente y produce conteos antes/después.
8. Una migración destructiva futura exige una release independiente y período de observación.

## 0001 — Catálogo de Journeys

### Tablas nuevas

`journeys`

- `id TEXT PRIMARY KEY`
- `slug TEXT NOT NULL UNIQUE`
- `status TEXT NOT NULL`
- `access_tier TEXT NOT NULL`
- `created_at INTEGER NOT NULL`
- `retired_at INTEGER NULL`

`journey_versions`

- `id TEXT PRIMARY KEY`
- `journey_id TEXT NOT NULL REFERENCES journeys(id)`
- `version TEXT NOT NULL`
- `content_hash TEXT NOT NULL`
- `scoring_version TEXT NOT NULL`
- `snapshot TEXT NOT NULL`
- `published_at INTEGER NULL`
- `created_at INTEGER NOT NULL`
- `UNIQUE(journey_id, version)`
- `UNIQUE(journey_id, content_hash)`

### Cambios aditivos

- Agregar `journey_id TEXT NULL` y `journey_version_id TEXT NULL` a `web_sessions`.
- Agregar `updated_at INTEGER NULL` a `web_sessions`.
- Índice por `journey_id, status, created_at`.

### Backfill

1. Insertar `journey_unwritten_road`.
2. Convertir cada `web_releases` existente en `journey_versions`, conservando snapshot y hash.
3. Asociar todas las sesiones V1 al Journey y release equivalentes.
4. Verificar: cero sesiones sin asociación y mismos conteos/resultados.

`web_releases` permanece durante toda V2 inicial como fuente legacy. El código de lectura acepta ambos modelos; la escritura nueva usa `journey_versions`.

## 0002 — Identidad y claim

### Tablas

Las tablas exactas de Better Auth se generan con la versión fijada y se revisan antes de incorporarlas. Se esperan al menos usuario, sesión, cuenta y verificación. No se ejecutan migraciones automáticas en startup de producción.

`anonymous_claims`

- `id TEXT PRIMARY KEY`
- `user_id TEXT NOT NULL`
- `owner_hash TEXT NOT NULL`
- `claimed_session_count INTEGER NOT NULL`
- `idempotency_key TEXT NOT NULL UNIQUE`
- `created_at INTEGER NOT NULL`

### Cambios

- Agregar `user_id TEXT NULL` a `web_sessions`.
- Índices por `user_id, journey_id, created_at` y `owner_hash, created_at`.
- Constraint lógico de aplicación: una sesión pertenece a `user_id` o a un owner anónimo; durante claim puede conservar ambos para auditoría, pero la autorización autenticada tiene precedencia.

### Rollback operativo

Desactivar login/claim mediante feature flag. Como `owner_hash` se conserva, las sesiones reclamadas siguen recuperables dentro de una ventana controlada. No borrar tablas.

## 0003 — Señales de Journey

### Tablas

`core_dimensions`

- `id TEXT PRIMARY KEY`
- `model_version TEXT NOT NULL`
- `label_key TEXT NOT NULL`
- `status TEXT NOT NULL`
- `created_at INTEGER NOT NULL`

`journey_dimension_models`

- `journey_version_id TEXT NOT NULL`
- `dimension_id TEXT NOT NULL`
- `relevance REAL NOT NULL`
- `target_scenes INTEGER NOT NULL`
- `baseline_mean REAL NOT NULL`
- `baseline_sd REAL NOT NULL`
- `mapping_version TEXT NULL`
- `PRIMARY KEY(journey_version_id, dimension_id)`

`result_construct_scores`

- `result_id TEXT NOT NULL REFERENCES web_results(id) ON DELETE CASCADE`
- `dimension_id TEXT NOT NULL`
- `centered_score REAL NOT NULL`
- `normalized_score REAL NOT NULL`
- `display_score INTEGER NOT NULL`
- `response_count INTEGER NOT NULL`
- `independent_scene_count INTEGER NOT NULL`
- `observed_opportunity REAL NOT NULL`
- `target_opportunity REAL NOT NULL`
- `coverage REAL NOT NULL`
- `confidence_band TEXT NOT NULL`
- `contexts_json TEXT NOT NULL`
- `scoring_version TEXT NOT NULL`
- `mapping_version TEXT NULL`
- `created_at INTEGER NOT NULL`
- `PRIMARY KEY(result_id, dimension_id)`

### Backfill V1

Solo se rellenan señales con correspondencia semántica aprobada. Cada fila lleva `mapping_version='v1-to-core-1'` y confianza reducida cuando la correspondencia es parcial. Adaptabilidad y regulación emocional quedan ausentes. No se fabrican valores neutros.

## 0004 — Perfil acumulativo

### Tablas

`profile_snapshots`

- `id TEXT PRIMARY KEY`
- `user_id TEXT NOT NULL`
- `profile_model_version TEXT NOT NULL`
- `locale TEXT NOT NULL`
- `depth TEXT NOT NULL`
- `signals_json TEXT NOT NULL`
- `interpretation_json TEXT NOT NULL`
- `source_fingerprint TEXT NOT NULL`
- `created_at INTEGER NOT NULL`
- `UNIQUE(user_id, profile_model_version, source_fingerprint)`

`profile_snapshot_results`

- `snapshot_id TEXT NOT NULL REFERENCES profile_snapshots(id) ON DELETE CASCADE`
- `result_id TEXT NOT NULL REFERENCES web_results(id)`
- `journey_version_id TEXT NOT NULL`
- `weight_json TEXT NOT NULL`
- `PRIMARY KEY(snapshot_id, result_id)`

Los snapshots son inmutables. “Actualizar” crea una fila nueva.

## 0005 — Comercio y entitlements

### Tablas

`products`

- código estable, tipo `journey|bundle`, estado y metadata no sensible.

`prices`

- producto, proveedor, `provider_price_id`, moneda, monto minor, entorno, fechas y estado.

`bundle_memberships`

- bundle, producto miembro, `bundle_version`, vigencia.

`stripe_customers`

- `user_id` único y `stripe_customer_id` único.

`stripe_events`

- `event_id TEXT PRIMARY KEY`, tipo, estado, intentos, timestamps y hash del payload; no guardar datos de tarjeta.

`purchases`

- usuario, producto, precio, checkout session, payment intent, monto/moneda, estado y timestamps.

`entitlements`

- usuario, producto, estado, vigencia y timestamps; unicidad lógica por usuario/producto.

`entitlement_grants`

- entitlement, fuente (`purchase|bundle|support|migration`), ID fuente y clave idempotente única.

### Semántica

- La URL de éxito no concede acceso.
- El webhook válido registra evento, compra y grants en un batch.
- Reprocesar un evento no duplica compras ni grants.
- El bundle concede sus miembros según la versión comprada.
- Los resultados existentes no se borran ante reembolso; el acceso a comenzar/repetir contenido sigue la política comercial aprobada.

## 0006 — Sharing de perfil y analytics mínimos

### Sharing

Agregar `share_type` y `profile_snapshot_id` mediante tabla nueva `public_shares_v2` para no romper `web_shares`. Su proyección se valida con un schema específico.

### Analytics

`product_events` opcional:

- evento, journey/version, locale, viewport class, timestamp, visitor/user hash rotado y metadata allowlisted.
- nunca respuestas, scores, nombre, email, texto narrativo libre o contenido de token.

## Orden de releases

1. Código dual-read y catálogo sin UI nueva.
2. Migración 0001 + backfill + verificación.
3. Registro genérico y rutas V1 compatibles.
4. Señales paralelas y comparación offline.
5. Identidad detrás de feature flag.
6. Claim detrás de feature flag y pruebas de concurrencia.
7. Perfil acumulativo privado.
8. Comercio en Stripe Test Mode.
9. Journeys premium como draft local.
10. Revisión completa antes de cualquier deploy.

## Verificación por migración

- Conteo y checksums lógicos de sesiones, respuestas, resultados y shares.
- Apertura de resultados y shares V1 creados antes de migrar.
- `foreign_key_check` sin errores.
- migración repetida sin duplicados.
- fallo intencional a mitad de batch sin escrituras parciales.
- downgrade de código: la release anterior puede leer lo necesario durante la ventana de rollback.
