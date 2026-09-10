# Questype V2 — paquete para aprobación de Fase 0

## Resultado

Questype V2 es viable sobre el MVP actual. La recomendación es evolucionar el sistema existente, conservando The Unwritten Road y extrayendo primero las suposiciones de Journey único. La arquitectura propuesta soporta varios Journeys, cuentas opcionales, compras unitarias, bundle versionado y un perfil acumulativo auditable.

No se implementó ninguna función V2, no se ejecutó ninguna migración, no se configuró Stripe ni email y no se publicó nada.

## Documentos entregados

| Documento                                                                    | Para qué sirve                                                               |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`V1_BASELINE.md`](./V1_BASELINE.md)                                         | Comportamiento que V2 debe preservar                                         |
| [`QUESTYPE_V2_AUDIT.md`](./QUESTYPE_V2_AUDIT.md)                             | Auditoría de rutas, D1, scoring, PDF, sharing, imágenes, seguridad y pruebas |
| [`PROFILE_MODEL.md`](./PROFILE_MODEL.md)                                     | Doce señales, normalización, agregación, profundidad y snapshots             |
| [`QUESTYPE_V2_ARCHITECTURE.md`](./QUESTYPE_V2_ARCHITECTURE.md)               | Módulos, rutas, auth, productos, Stripe y entitlements                       |
| [`V2_MIGRATION_PLAN.md`](./V2_MIGRATION_PLAN.md)                             | Secuencia aditiva de migraciones y rollback                                  |
| [`QUESTYPE_ASSET_INVENTORY.md`](./QUESTYPE_ASSET_INVENTORY.md)               | Los 109 assets actuales, deuda y plan de producción                          |
| [`QUESTYPE_VISUAL_BIBLE.md`](./QUESTYPE_VISUAL_BIBLE.md)                     | Dirección visual y regla obligatoria sin texto en imágenes                   |
| [`QUESTYPE_V2_IMPLEMENTATION_PLAN.md`](./QUESTYPE_V2_IMPLEMENTATION_PLAN.md) | Etapas, dependencias y gates antes de un lanzamiento                         |

## Decisiones recomendadas

### 1. Estrategia técnica

**Aprobar:** migración aditiva, registro multi-Journey y compatibilidad de rutas. No reescribir la aplicación ni recalcular resultados V1.

### 2. Perfil

**Aprobar:** las 12 señales descritas en `PROFILE_MODEL.md`; cálculo desde evidencia normalizada por Journey; snapshots inmutables; porcentajes arquetípicos excluidos del agregador.

### 3. Autenticación

**Aprobar:** cuenta opcional mediante Better Auth + magic link + D1. Cloudflare Email Service será el proveedor preferido detrás de una interfaz reemplazable. El Journey gratuito seguirá disponible sin cuenta.

### 4. Productos

**Aprobar:**

- The Unwritten Road gratuito;
- Council of Realms individual;
- Stormbound Passage individual;
- Questype V2 Complete: los dos Journeys premium y perfil/PDF acumulativo de esta edición.

“Complete” no incluye automáticamente productos futuros.

### 5. Precio inicial para Test Mode

**Aprobar como hipótesis:** EUR 6,90 por Journey y EUR 11,90 por el bundle V2. Los importes pueden cambiar antes de producción sin tocar la lógica, porque se resuelven por Price IDs de entorno.

### 6. Imágenes

**Aprobar:** cero texto horneado en las imágenes. Se rechazan también formas que parezcan palabras o letras. Símbolos geométricos ficticios y no lingüísticos sí están permitidos. El texto visible se compone por código y cambia con el idioma.

### 7. Producción visual

**Aprobar:** primero contenido, mapa de señales y storyboard; después 36 masters por Journey nuevo. No generar variaciones por cada respuesta ni side quests.

## Puntos que requieren tu aprobación explícita

1. Etiquetas públicas de las 12 señales, especialmente “seguridad social” e “iniciativa de liderazgo”.
2. Better Auth + magic link como solución de cuenta.
3. Alcance del bundle V2 y precio de prueba EUR 11,90.
4. Política propuesta: ante reembolso se revoca el derecho a iniciar/repetir el Journey, pero no se borra el resultado ya obtenido.
5. Nivel de perfil “Extenso” reservado para cinco Journeys futuros; V2 llega hasta “Establecido”.
6. Reparar en una etapa posterior los assets V1 con pseudotexto visible, sin frenar el refactor técnico.

## Primera implementación después de aprobar

El primer bloque recomendado es **Blindaje de V1 + registro multi-Journey**. Es local, reversible y no crea todavía cuentas, cobros ni imágenes. La revisión incluirá:

- fixtures dorados antes/después;
- diff de rutas y contratos;
- D1 local migrada con datos V1;
- The Unwritten Road ejecutándose en el reproductor genérico;
- reporte que demuestre que scoring, PDF y shares no cambiaron.

## Estado de rama

- Rama: `codex/questype-v2`
- Base: producción observada en `e836b52e1120819612ff7a75fc09edba36c91ccf`
- Destino remoto: ninguno
- Deploy: ninguno
- `main`: sin modificar

## Seguimiento

La Fase 0 fue aprobada el 2026-09-10. La Etapa 1 quedó documentada en [`STAGE_1_REPORT.md`](./STAGE_1_REPORT.md) y la Etapa 2 en [`STAGE_2_REPORT.md`](./STAGE_2_REPORT.md).
