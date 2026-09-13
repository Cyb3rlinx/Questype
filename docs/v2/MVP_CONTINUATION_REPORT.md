# Questype V2 — MVP Continuation Report

**Fecha:** 2026-09-13  
**Rama:** `codex/questype-v2`  
**Estado:** Gates 1–10 implementados y validados en local; pendiente únicamente el cierre administrativo del diff y commits de Gates 6–10  
**Producción:** publicación de landing autorizada el 13 de septiembre de 2026; Journeys draft aún bloqueados

## 1. Executive summary

La continuación local convirtió la base multi-Journey de Etapa 2 en un MVP técnico completo para evaluación narrativa acumulativa. El sistema ahora cuenta con doce señales operativas y auditables, persistencia paralela sin alterar V1, cuentas opcionales con claim seguro, snapshots acumulativos inmutables, perfil y PDF bilingües, catálogo multi-Journey, dos nuevos Journeys de 18 escenas en estado `draft` y contratos de resultados/PDF específicos por Journey.

The Unwritten Road continúa como el único Journey publicado y conserva exactamente su cálculo, ranking, porcentajes, contenido, resultado, sharing y PDF. Council of Realms y Stormbound Passage aparecen como “Próximamente / Coming soon”; sus rutas públicas están bloqueadas.

## 2. What was implemented

- Registro de 12 señales Questype, facetas, contextos y requisitos mínimos.
- Motor determinista de evidencia con procedencia por Journey, versión, escena, opción, señal, faceta, contexto, dirección, peso y tipo de observación.
- Normalización por oportunidades de cada Journey y agregación con una contribución normalizada por fuente.
- Mapeo conservador V1→V2 a nivel de decisión, ejecutado en paralelo al scoring arquetípico.
- Persistencia D1 aditiva para modelos, mediciones y evidencia.
- Autenticación opcional por magic link con proveedor abstracto, tokens hasheados, expiración, replay protection y sesiones seguras.
- Claim de resultados basado en la cookie de propiedad; el cliente no puede elegir IDs para reclamar.
- Perfil acumulativo con snapshots versionados, fingerprint y fuentes inmutables.
- UI y PDF acumulativo bilingües con dimensiones faltantes visibles como no exploradas.
- Home y catálogo con tarjetas compartidas derivadas del registro público.
- Council of Realms y Stormbound Passage: 18 escenas lineales, seis actos, 72 decisiones bilingües por Journey, metadata psicológica, mapas de señales server-only, hashes, storyboards, simulaciones y cobertura.
- Contrato `questype-journey-signals.v1` y renderer PDF para informes no arquetípicos.
- Separación del registro público y el registro servidor para impedir que narrativas y signal maps draft entren en el bundle cliente.

## 3. What remains intentionally deferred

- Precios definitivos, experimentos de precio y pricing público.
- Stripe, Checkout, webhooks y entitlements comerciales.
- Proveedor de correo de producción.
- Paywalls y activación pública de Journeys premium.
- Las 72 imágenes master finales y sus derivados.
- Publicación de Council of Realms o Stormbound Passage.
- Pulido editorial premium de sus PDFs y tarjetas sociales.
- Deploy, push o modificación de cualquier recurso de producción.

## 4. Psychological signal model

Las señales son `autonomy`, `structure`, `risk_tolerance`, `openness_to_uncertainty`, `knowledge_orientation`, `creation_orientation`, `empathy_cooperation`, `social_confidence`, `leadership_initiative`, `persistence`, `adaptability` y `emotional_regulation`.

Cada medición conserva procedencia y una banda descriptiva: `insufficient`, `emerging`, `moderate` o `strong`. El valor es `null` cuando falta evidencia; nunca se sustituye por 50 ni por neutralidad inferida. La profundidad acumulativa es Initial con un Journey, Emerging con dos, Established con tres y Extensive con cinco o más.

Los modelos draft utilizan oportunidades bipolares balanceadas y un máximo de dos señales por escena. Las simulaciones sirven para detectar explosiones, dominancia y valores inaccesibles; no prueban validez psicométrica.

## 5. V1 mapping summary

El mapeo parte de elecciones individuales de The Unwritten Road. No deriva señales del arquetipo final, no cambia efectos existentes y no rellena señales con correspondencias débiles. Las señales quedan almacenadas en tablas nuevas junto al resultado V1. El hash congelado sigue siendo:

`116ab299e56b8ff5ac00d123794521bf320852c4efaaf3814db2955429a9601e`

Los 14 fixtures dorados, incluidos los 12 arquetipos dominantes, permanecen idénticos.

## 6. Accounts and claim implementation

El primer Journey no exige cuenta. El usuario puede solicitar un magic link después, iniciar sesión y reclamar únicamente resultados demostrados por su cookie anónima. Los tokens usan 32 bytes aleatorios; se almacena solo SHA-256, expiran a los 15 minutos y no pueden reutilizarse. La solicitud se limita por correo y ventana temporal.

La sesión autenticada usa cookie HttpOnly, SameSite Lax y Secure bajo HTTPS. El claim es idempotente, no reasigna resultados y no acepta un `resultId` como prueba. El borrado de cuenta elimina cuenta, claims, snapshots y sesiones autenticadas mediante relaciones con cascade. En producción, sin un proveedor de email configurado, el endpoint falla cerrado.

## 7. Accumulated profile implementation

El perfil elige el resultado más reciente de cada Journey distinto para evitar que repetir uno multiplique su influencia. Cada combinación nueva crea un snapshot inmutable con versión, fuentes, versiones de Journey/scoring, versión de agregación, cobertura y fingerprint. Leer el mismo estado devuelve el mismo snapshot.

La UI muestra panorama, señales medidas, ejes sin falsa precisión, áreas no exploradas y timeline. El PDF puede incluir secciones arquetípicas, de liderazgo o de presión solo cuando la fuente correspondiente existe.

## 8. Landing/Journey UX changes

El homepage explica cuatro pasos: entrar en una historia, tomar decisiones significativas, revelar patrones distintos y construir el perfil. Incluye el alcance no clínico y una sección “Choose a Journey / Elige un Journey”.

Las tarjetas usan una sola fuente de metadata pública, muestran área analizada, tags, escenas, duración y estado. Solo The Unwritten Road enlaza a inicio. El diseño usa tres columnas en escritorio amplio, dos en tablet y una en móvil.

QA de navegador local:

- escritorio de 920 px: grilla de dos columnas, jerarquía editorial y contenido accesible;
- móvil 390×844: una columna, ancho de documento igual al ancho cliente, cero overflow horizontal;
- EN/ES: títulos, descripciones, estados, tags y alt text cambian correctamente;
- enlaces a Journeys draft: cero.

## 9. Council of Realms status

Estado `draft`, versión `0.1`, 18 escenas, seis actos y 72 decisiones bilingües. La historia recorre un único día de consejo ante sequía, alianzas, recursos escasos, autoridad incompleta, desacuerdo público y responsabilidad. Todas las decisiones conservan el mismo orden narrativo.

Cobertura principal: liderazgo 5 escenas, seguridad social 5, empatía/cooperación 6, estructura 4 y autonomía 5. También aporta evidencia acotada de adaptabilidad, regulación emocional, persistencia, conocimiento y apertura a la incertidumbre. Riesgo y creación quedan sin medir dentro de este Journey.

## 10. Stormbound Passage status

Estado `draft`, versión `0.1`, 18 escenas, seis actos y 72 decisiones bilingües. La misma expedición atraviesa un temporal progresivo con instrumentos dañados, rutas inciertas, recursos limitados, fatiga y desacuerdos, sin combate ni bifurcaciones.

Cobertura principal: riesgo 5 escenas, adaptabilidad 4, persistencia 4 y regulación emocional 5. La construcción distingue riesgo calculado de impulso, persistencia de rigidez, adaptación de indecisión y regulación de supresión emocional. También mide estructura, apertura, empatía, liderazgo, autonomía, conocimiento y una oportunidad de seguridad social. Creación queda sin medir.

## 11. PDF/report status

- PDF arquetípico V1: sin cambios y probado.
- PDF acumulativo: implementado, bilingüe, fuentes locales y missing data probado.
- PDF específico por señales: contrato y renderer implementados; probado en español con evidencia insuficiente.
- Los reportes Council y Stormbound contienen secciones propias y no exponen respuestas, pesos, contribuciones firmadas ni identificadores de cuenta.

La composición editorial final de los PDFs draft queda diferida hasta que contenido e imágenes pasen revisión.

## 12. Database migrations

- `0001_multi_journey.sql`: registro, versiones y backfill multi-Journey.
- `0002_signal_evidence.sql`: modelos, mediciones, scores y evidencia trazable.
- `0003_optional_accounts.sql`: usuarios, magic links, sesiones y claims.
- `0004_accumulated_profiles.sql`: snapshots y fuentes.

No se necesitó otra migración para registrar contenido draft. Todas las migraciones se aplicaron y verificaron únicamente contra D1 local.

## 13. Test results

- Suite automatizada: **77/77**.
- Fixtures V1: **14/14**, con 12 arquetipos dominantes.
- Smoke web: aprobado, incluyendo rutas draft 404, auth, claim, perfil, PDFs, sharing, revocación y borrado.
- Council y Stormbound: 3.000 recorridos deterministas por modelo para reportes de calibración.
- IDs: 18 escenas y 72 opciones únicas por Journey.
- Densidad excesiva: cero escenas.
- Duplicados exactos de opciones localizadas: cero.
- Migración D1 poblada V1→V2: aprobada, cero errores de claves foráneas.

## 14. Build result

`npm run build` completó correctamente las cinco etapas de vinext. La inspección del bundle cliente confirmó que no contiene títulos narrativos draft ni IDs de signal models. Existe una advertencia de chunks mayores a 500 kB asociada principalmente a dependencias y exportación PDF; no bloquea este gate y debe tratarse en la fase de performance.

## 15. Known risks

- Los modelos establecen coherencia técnica y balance, pero requieren revisión profesional independiente antes de cualquier afirmación de validez.
- El patrón bipolar perfectamente balanceado de los Journeys draft es una base de calibración; una revisión psicológica debe confirmar que cada dirección representa realmente el constructo pretendido.
- Stormbound usa descripciones de beneficio/costo sistemáticas en el storyboard; requieren una pasada editorial para reducir regularidad antes de publicar.
- Los placeholders reutilizan arte existente y siguen marcados `pending`; no representan la futura dirección visual.
- Falta configurar el proveedor de email de producción.
- El repositorio tiene errores de lint heredados fuera del gate `check:full`; los archivos nuevos pasan typecheck y las pruebas funcionales.

## 16. Files/documents created

- `docs/v2/STAGE_3_PREIMPLEMENTATION_AUDIT.md`
- `docs/v2/PSYCHOLOGICAL_SIGNAL_SPEC.md`
- `docs/v2/SIGNAL_NORMALIZATION_SPEC.md`
- `docs/v2/SIGNAL_CALIBRATION_REPORT.md`
- `docs/v2/V1_TO_V2_SIGNAL_MAPPING.md`
- `docs/v2/ACCOUNT_AND_CLAIM_SECURITY.md`
- `docs/v2/ACCUMULATED_PROFILE_SPEC.md`
- `docs/v2/journeys/COUNCIL_OF_REALMS_PSYCHOLOGICAL_STORYBOARD.md`
- `docs/v2/journeys/STORMBOUND_PASSAGE_PSYCHOLOGICAL_STORYBOARD.md`
- `docs/v2/journeys/COUNCIL_SIGNAL_COVERAGE.md`
- `docs/v2/journeys/STORMBOUND_SIGNAL_COVERAGE.md`
- `docs/v2/QUESTYPE_V2_SIGNAL_COVERAGE.md`
- `artifacts/council-signal-coverage.json`
- `artifacts/stormbound-signal-coverage.json`

## 17. Local commit hashes

- `150fc13` — audit del baseline de continuación.
- `24a081e` — motor auditable de señales psicológicas.
- `b36f63b` — persistencia paralela de evidencia.
- `23f6063` — cuentas opcionales y claim seguro.
- `9a97483` — perfiles acumulativos inmutables.
- `609d17e` — UX multi-Journey, Journeys draft, reportes, Hero/Footer cinematográficos y key art aprobado del catálogo.

## 18. Recommended next gate

La siguiente revisión debe ser humana y separada en tres decisiones:

1. revisión psicológica/editorial de las 144 opciones, sus beneficios, costos y confusores;
2. aprobación narrativa de ambos storyboards antes de producir imágenes;
3. revisión visual local de home, catálogo, perfil y PDFs.

Solo después conviene abrir la producción de imágenes de escenas neutrales al idioma. El 13 de septiembre de 2026 se autorizó por separado publicar la nueva landing, el catálogo con los Journeys draft bloqueados, el Hero y el Footer; comercio, pricing, Stripe y la publicación de los Journeys draft continúan fuera de alcance.

## Confirmations

- El cierre técnico original se realizó sin push ni deploy; la publicación de la landing se autorizó después en una instrucción independiente.
- No cambios en D1 de producción.
- No implementación de Stripe.
- No pricing final.
- No imágenes finales de escenas; el key art de Council y Stormbound fue entregado y aprobado para las tarjetas del catálogo.
- V1 conserva hash, fixtures, resultados y compatibilidad.
