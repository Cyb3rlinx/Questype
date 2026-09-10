# Plan detallado de implementación Questype V2

## Condición de inicio

Este plan comienza solo después de aprobar `PHASE_0_REVIEW.md`. Todo trabajo se realiza primero en local, con D1 local, Stripe Test Mode y assets no publicados. Ningún paso implica deploy automático.

## Etapa 1 — Blindaje de V1

**Objetivo:** poder refactorizar sin cambiar el resultado actual.

- Crear fixtures dorados EN/ES con respuestas representativas, empates y sombras.
- Congelar hash, ranking, porcentajes e interpretación estructurada de V1.
- Incorporar `test:web` al gate local de release o crear un comando `check:full`.
- Añadir fixtures visuales para PDF y cuatro shares.
- Documentar redirects y cookies.

**Salida:** la suite detecta cualquier cambio accidental de V1.

## Etapa 2 — Registro multi-Journey

**Objetivo:** eliminar el singleton sin cambiar la experiencia del usuario.

- Implementar `JourneyRegistry` y contrato de definición.
- Separar manifiesto público de modelo de scoring servidor.
- Generalizar IDs, cantidad de escenas y variantes visuales.
- Convertir el mapeo de imágenes de V1 a manifiesto.
- Resolver Journey/release al crear sesión.
- Añadir nuevas rutas y redirects legacy.
- Ejecutar migración 0001 en D1 local poblada.

**Gate:** todos los fixtures V1 idénticos; resultados y shares históricos abren.

## Etapa 3 — Motor de señales

**Objetivo:** producir evidencia comparable sin alterar el resultado arquetípico.

- Registrar las 12 señales, facetas y contextos.
- Añadir contribuciones V2 al contenido V1 donde exista correspondencia aprobada.
- Calibrar por Journey mediante simulación determinista.
- Persistir `result_construct_scores` junto al resultado actual.
- Generar reporte de cobertura por señal/escena/opción.
- Comparar sensibilidad, extremos y señales ausentes.

**Gate:** el resultado arquetípico V1 no cambia; ninguna señal se publica aún.

## Etapa 4 — Cuenta opcional y claim

**Objetivo:** conservar resultados sin bloquear el acceso gratuito.

- Fijar Better Auth y generar su schema para revisión.
- Implementar magic link con proveedor de correo abstracto y simulación local.
- Diseñar emails EN/ES sin datos sensibles.
- Implementar claim atómico por cookie anónima.
- Añadir UI de cuenta después de completar y en header.
- Implementar exportación/borrado de cuenta y política de retención.

**Gate:** pruebas de expiración, replay, enumeración, CSRF, carrera de claim y revocación de sesión.

## Etapa 5 — Perfil acumulativo

**Objetivo:** mostrar un perfil auditable antes de crear su visual final.

- Implementar agregador puro desde fixtures JSON.
- Crear snapshots inmutables y fingerprint de fuentes.
- Mostrar primero una vista funcional sin ilustración nueva.
- Probar cobertura parcial, múltiples versiones y repetición de Journeys.
- Validar lenguaje EN/ES y límites de afirmación.
- Diseñar contrato del PDF acumulativo.

**Gate:** revisión de datos y copy. Recién entonces se diseñan gráficos e imágenes finales.

## Etapa 6 — Comercio en Test Mode

**Objetivo:** validar compra y acceso sin dinero real.

- Crear catálogo local con códigos estables.
- Configurar Price IDs exclusivamente de Stripe Test Mode.
- Crear Checkout Session desde allowlist servidor.
- Verificar webhook con body crudo.
- Persistir eventos idempotentes, compras y entitlements.
- Implementar éxito pendiente, confirmado y fallido.
- Probar duplicados, orden invertido, reembolso y bundle.

**Gate:** conciliación entre fixtures Stripe y D1; ninguna key live presente.

## Etapa 7 — Journey II: Council of Realms

**Objetivo:** medir liderazgo y colaboración con historia lineal.

- Escribir 18 escenas y cuatro decisiones por escena.
- Mapear liderazgo, seguridad social, empatía/cooperación, estructura y autonomía.
- Revisar cada opción para deseabilidad social y ambigüedad.
- Simular balance y cobertura.
- Crear storyboard antes de generar imágenes.
- Generar 36 masters neutrales al idioma y derivados.
- Construir resultado y PDF del Journey.

**Gate:** revisión narrativa, psicológica, visual, bilingüe y responsive.

## Etapa 8 — Journey III: Stormbound Passage

**Objetivo:** medir riesgo, adaptación y regulación bajo presión.

- Repetir el proceso de contenido con foco en presión ambiental y social.
- Evitar combate como atajo de tensión.
- Separar valentía, riesgo, impulsividad y regulación emocional.
- Generar y auditar 36 masters neutrales al idioma.

**Gate:** mismo estándar que Journey II y perfil acumulativo coherente con tres fuentes.

## Etapa 9 — Diseño visual del perfil y exportaciones

**Objetivo:** convertir el modelo aprobado en una experiencia editorial.

- Constelación acumulativa dibujada por código.
- Comparación contextual con lenguaje no clínico.
- PDF acumulativo EN/ES con paginación robusta.
- Tarjetas de Journey y perfil diferenciadas.
- Imágenes base sin texto; toda etiqueta se compone por código.

**Gate:** capturas y PDFs aprobados en móvil, tablet y escritorio.

## Etapa 10 — Preparación de lanzamiento

**Objetivo:** producir un candidato revisable, todavía sin publicar.

- Auditoría de accesibilidad y teclado.
- Lighthouse/Core Web Vitals con presupuestos acordados.
- Pruebas de seguridad, privacidad y rate limits.
- Ensayo de migraciones y rollback sobre copia de producción.
- Checklist de variables y secretos por entorno.
- Revisión de precios, copy comercial, términos y privacidad.
- Reporte de go/no-go.

El deploy requiere una autorización nueva y explícita después de revisar el candidato local.

## Dependencias y camino crítico

```text
Fixtures V1
  → Registro multi-Journey
    → Señales versionadas
      → Cuenta + claim
        → Perfil acumulativo funcional
          → Journeys II/III
            → Perfil visual/PDF
              → release candidate local

Cuenta + claim
  → Stripe Test Mode
    → entitlements
      → acceso a Journeys premium
```

La creación masiva de imágenes comienza después de aprobar storyboards y señales. Esto evita producir escenas que luego no sirven al instrumento.

## Estimación de alcance

| Bloque | Complejidad | Riesgo principal |
|---|---|---|
| Blindaje + multi-Journey | Media | romper compatibilidad histórica |
| Señales + perfil | Alta | confundir presentación con medición |
| Cuenta + claim | Media/alta | propiedad y replay de tokens |
| Stripe + entitlements | Media/alta | idempotencia y acceso prematuro |
| Dos Journeys completos | Alta | calidad de contenido y 72 masters |
| PDF/share/responsive | Media | combinaciones de idioma y formato |

La implementación debe aprobarse por gates, no como un cambio monolítico.

## Definición de terminado para V2 local

- V1 produce resultados idénticos a la línea base.
- Tres Journeys se descubren desde catálogo y se ejecutan en el reproductor común.
- Cuenta opcional reclama resultados anónimos de forma segura.
- Stripe Test Mode concede acceso idempotente.
- Perfil acumulativo muestra fuente, contexto, cobertura y versión.
- PDFs y shares funcionan en español e inglés.
- Todas las imágenes están aprobadas como neutrales al idioma.
- Suite funcional, migraciones, accesibilidad básica y responsive pasan.
- No hay secretos live, cambios remotos ni deploy.
