# Questype V2 — contexto y estado actual para ChatGPT

**Fecha de corte:** 13 de septiembre de 2026  
**Rama local:** `codex/questype-v2`  
**Producción:** se autorizó publicar la nueva landing multi-Journey, Hero, Footer y key art del catálogo; Council y Stormbound siguen bloqueados como `draft`  
**Objetivo de este archivo:** continuar conversaciones de producto, narrativa, psicología y diseño con el estado técnico real de Questype V2.

## 1. Qué es Questype

Questype es una plataforma de autoconocimiento narrativo. Cada Journey introduce al usuario en una historia fantástica lineal y observa patrones mediante decisiones con beneficios y costos plausibles. Las elecciones producen evidencia estructurada, pero no abren historias paralelas ni alteran el orden de las escenas.

La visión de V2 es:

```text
Elegir un Journey
  → vivir una historia fantástica
  → tomar decisiones significativas
  → recibir un resultado propio de ese Journey
  → sumar evidencia al Questype Profile
  → completar otros Journeys
  → construir un perfil más amplio y contextual
```

Questype está diseñado para reflexión y desarrollo personal. No es una herramienta clínica, no diagnostica y todavía no reclama validación psicométrica.

## 2. Reglas de producto aprobadas

1. Las historias mantienen un único hilo y un orden fijo.
2. Las decisiones analizan estrategias, pensamientos y conductas sin crear side quests.
3. Cada opción debe ofrecer una ventaja y un costo defendibles; no debe existir una respuesta evidentemente “correcta”.
4. The Unwritten Road conserva su scoring, resultados, PDF, sharing y compatibilidad histórica.
5. Los mapas de señales, pesos y reglas de scoring viven únicamente en el servidor.
6. La ausencia de evidencia se muestra como “no explorada” o “insuficiente”; nunca se inventa un 50% neutral.
7. Las imágenes nuevas no pueden contener texto real en inglés o español, ni pseudotexto que parezca una oración. Pueden usar símbolos ficticios y geometría no lingüística.
8. Todo contenido visible debe estar localizado profesionalmente en inglés y español.
9. Las cuentas son opcionales después del primer Journey gratuito.
10. Los Journeys nuevos permanecen en borrador hasta aprobar contenido, scoring, imágenes y QA.

## 3. Estado del roadmap

### Fase 0 — Auditoría y arquitectura

**Completada y aprobada.** Se congeló el MVP, se auditaron rutas, D1, scoring, PDF, sharing, imágenes y pruebas, y se diseñaron la arquitectura multi-Journey, las migraciones, el perfil acumulativo y la dirección de autenticación/comercio.

### Etapa 1 — Blindaje de V1

**Completada en local.** Existen 14 fixtures dorados: doce recorridos con cada arquetipo dominante, un empate triple y un caso con sombra limitada.

Hash congelado de The Unwritten Road:

`116ab299e56b8ff5ac00d123794521bf320852c4efaaf3814db2955429a9601e`

### Etapa 2 — Base multi-Journey

**Completada en local.** Incluye registro compartido, manifiestos públicos, modelos server-only, rutas canónicas, reproductor genérico, catálogo, compatibilidad V1 y migración D1 inicial.

### Etapa 3 — Motor psicológico

**Completada en local.** Las doce señales tienen definiciones operativas, facetas, contextos, requisitos mínimos, evidencia auditable y bandas descriptivas. El mapeo V1→V2 ocurre a nivel de decisiones y en paralelo al resultado arquetípico original.

### Etapa 4 — Cuentas opcionales y claim

**Completada en local.** Se implementó magic link con proveedor abstracto, tokens hasheados y de un solo uso, sesiones seguras y claim basado en la cookie de propiedad. No hay proveedor de correo habilitado en producción.

### Etapa 5 — Questype Profile acumulativo

**Completada en local.** Los resultados de Journeys distintos se normalizan y crean snapshots inmutables, versionados y reproducibles. La interfaz y el PDF son bilingües y conservan dimensiones no medidas como ausentes.

### Etapa 6 — Landing y catálogo

**Completada y autorizada para producción.** Home y `/journeys` usan las mismas tarjetas, explican qué analiza cada historia e incluyen un flujo “How Questype Works” de cuatro pasos. La grilla fue revisada en escritorio, tablet y móvil. Hero y Footer incorporan video progresivo con fallback estático y respeto por movimiento/datos reducidos. “My profile” permanece oculto de la navegación pública.

### Etapa 7 — Council of Realms

**Borrador técnico completo.** Tiene 18 escenas, seis actos, 72 opciones bilingües, hilo lineal, metadata psicológica, signal map privado, storyboard y reporte de cobertura. Sigue marcado `draft` y no tiene ruta pública.

### Etapa 8 — Stormbound Passage

**Borrador técnico completo.** Tiene 18 escenas, seis actos, 72 opciones bilingües, signal map privado, storyboard y reporte de cobertura. Diferencia riesgo de impulso, persistencia de rigidez, adaptación de indecisión y regulación de supresión. Sigue marcado `draft` y no tiene ruta pública.

### Etapa 9 — Resultados y exportaciones

**Arquitectura MVP completada en local.** Existen contratos distintos para el resultado arquetípico V1 y los resultados basados en señales. También hay renderer PDF para Journeys de señales y PDF acumulativo. El acabado visual premium queda pendiente.

### Etapa 10 — Regresión técnica

**Completada en local.** Pasan tipos, pruebas, validación de contenido, migraciones D1 locales, smoke web y build de producción local. No hubo deploy.

## 4. Las doce señales Questype

| Señal interna | Etiqueta pública | Qué observa |
| --- | --- | --- |
| `autonomy` | Autonomía | Juicio propio y acción elegida sin confundirlo con aislamiento o terquedad. |
| `structure` | Estructura | Planificación, prioridades y orden sin asumir rigidez o control. |
| `risk_tolerance` | Orientación al riesgo | Aceptación calculada de exposición o pérdida sin equipararla con impulso. |
| `openness_to_uncertainty` | Apertura a la incertidumbre | Capacidad de permanecer involucrado ante ambigüedad e información incompleta. |
| `knowledge_orientation` | Orientación al conocimiento | Búsqueda de contexto, evidencia, causas y precisión. |
| `creation_orientation` | Orientación a la creación | Generación, construcción y transformación de alternativas. |
| `empathy_cooperation` | Empatía y cooperación | Perspectiva interpersonal y cuidado del funcionamiento colectivo. |
| `social_confidence` | Seguridad social | Participación visible, expresión y tolerancia a la exposición interpersonal. |
| `leadership_initiative` | Iniciativa de liderazgo | Asunción de responsabilidad para coordinar o movilizar. |
| `persistence` | Persistencia | Continuidad del esfuerzo con capacidad de recuperarse de obstáculos. |
| `adaptability` | Adaptabilidad | Cambio de estrategia cuando cambian la evidencia o las restricciones. |
| `emotional_regulation` | Regulación emocional | Decisión funcional bajo estrés sin confundir regulación con frialdad o supresión. |

Cada aporte registra Journey, versión, escena, opción, señal, faceta, contexto, dirección, peso y tipo de observación. Las bandas públicas son `insufficient`, `emerging`, `moderate` y `strong`; describen profundidad de evidencia, no exactitud científica.

## 5. Normalización y perfil acumulativo

Questype no suma pesos crudos entre Journeys ni promedia porcentajes arquetípicos. Cada Journey se interpreta según las oportunidades que diseñó para cada señal y aporta una fuente normalizada al perfil.

Para evitar que repetir el mismo Journey multiplique artificialmente su peso, el perfil toma el resultado más reciente de cada Journey distinto. Una combinación nueva crea un snapshot nuevo con fuentes, versiones de Journey y scoring, versión de agregación, cobertura por señal, profundidad, fingerprint reproducible y fecha de creación.

Profundidad pública:

- **Initial / Inicial:** un Journey;
- **Emerging / Emergente:** dos Journeys;
- **Established / Establecido:** tres Journeys;
- **Extensive / Extenso:** cinco o más Journeys futuros.

## 6. Journeys

### The Unwritten Road — Archetypes & Identity

- Estado: publicado en V1 y registrado como único Journey público.
- Extensión: 15 momentos.
- Resultado: arquetipo dominante, secundario, constelación de doce arquetipos, interpretación, PDF y sharing.
- V2: agrega evidencia conservadora en paralelo sin cambiar el resultado legacy.

### Council of Realms — Leadership & Collaboration

- Estado: borrador privado.
- Extensión: 18 escenas en seis actos.
- Premisa: un consejo debe atravesar un día de sequía, alianzas frágiles, recursos escasos, autoridad incompleta, desacuerdo público y responsabilidad compartida.
- Cobertura central: liderazgo, seguridad social, empatía/cooperación, estructura y autonomía.
- Riesgo y creación permanecen sin explorar.

### Stormbound Passage — Decision-Making Under Pressure

- Estado: borrador privado.
- Extensión: 18 escenas en seis actos.
- Premisa: una misma expedición atraviesa un temporal progresivo con instrumentos dañados, rutas inciertas, fatiga, recursos limitados y desacuerdos.
- Cobertura central: riesgo, adaptabilidad, persistencia y regulación emocional.
- Creación permanece sin explorar.

Ambos borradores usan key art aprobado y neutral al idioma en el catálogo. Sus escenas continúan con placeholders internos; no se generaron ni aprobaron las 72 imágenes finales.

## 7. Cuentas y privacidad

El flujo local implementado es:

```text
Usuario anónimo
  → completa The Unwritten Road
  → recibe su resultado
  → opcionalmente solicita un magic link
  → inicia sesión
  → reclama el resultado que su cookie demuestra que le pertenece
  → futuros Journeys se agregan al mismo perfil
```

El navegador no puede reclamar un resultado ajeno enviando su ID. Los tokens de acceso expiran, son de un solo uso y se almacenan hasheados. El borrado de cuenta elimina claims, snapshots y sesiones autenticadas. Sharing sigue siendo explícito y revocable, y no expone respuestas, pesos, notas privadas ni identificadores de cuenta.

## 8. Persistencia D1 local

Migraciones aditivas:

- `0001_multi_journey.sql`: registro y versiones de Journeys, más backfill.
- `0002_signal_evidence.sql`: modelos, mediciones, scores y evidencia.
- `0003_optional_accounts.sql`: usuarios, magic links, sesiones y claims.
- `0004_accumulated_profiles.sql`: snapshots acumulativos y fuentes.

No se borraron tablas V1 ni se recalcularon resultados históricos. Las migraciones siguen siendo aditivas y se verifican contra una copia local poblada antes de cualquier aplicación remota.

## 9. Resultados técnicos verificados

- Pruebas automatizadas: **77/77**.
- Fixtures dorados V1: **14/14**.
- Hash V1: intacto.
- Validación de contenido: aprobada.
- Migraciones y backfill sobre D1 local poblada: aprobados; cero errores de claves foráneas.
- Smoke web: aprobado para recorrido, auth, claim, perfil, PDF, sharing, revocación, borrado y bloqueo de rutas draft.
- Council y Stormbound: 3.000 recorridos deterministas por Journey.
- Cada borrador: 18 escenas, 72 opciones, paridad EN/ES, IDs únicos y cero duplicados exactos de opciones localizadas.
- Build vinext para Cloudflare Workers: aprobado en local.
- Bundle cliente: no contiene títulos narrativos draft ni mapas privados de señales.

## 10. Riesgos y límites reales

- El sistema tiene coherencia de ingeniería y balance de oportunidades, pero todavía requiere revisión profesional independiente antes de reclamar validez psicológica.
- Las 144 opciones nuevas necesitan revisión humana psicológica y editorial de beneficios, costos, deseabilidad social y confusores.
- Stormbound usa descripciones sistemáticas en su metadata; necesitan una pasada editorial para reducir patrones reconocibles.
- Las imágenes finales de escenas y el acabado visual premium de PDFs/resultados están pendientes; el key art del catálogo ya fue aprobado.
- El proveedor de correo de producción no está configurado.
- Existe una advertencia de bundle mayor a 500 kB para tratar en una futura fase de rendimiento.
- El repositorio conserva deuda de lint previa fuera del gate funcional aprobado.

## 11. Trabajo deliberadamente aplazado

- pricing definitivo;
- Stripe, Checkout y webhooks;
- productos y entitlements comerciales;
- paywalls;
- proveedor de email de producción;
- generación de las 72 imágenes finales;
- publicación de Council o Stormbound;
- publicación de Council o Stormbound como Journeys jugables.

## 12. Próximo gate recomendado

Antes de producir imágenes o publicar Journeys:

1. Revisar psicológicamente las 144 opciones y sus signal maps.
2. Revisar narrativamente los dos storyboards, continuidad, tono y repetición.
3. Ajustar lenguaje de beneficios, costos y patrones para que ninguna opción parezca moralmente superior.
4. Aprobar el storyboard visual de 36 escenas por dos representaciones.
5. Producir imágenes sin texto lingüístico y ejecutar QA visual.
6. Revisar resultados y PDFs con assets definitivos.
7. Tratar rendimiento, accesibilidad y deuda de lint relevante.
8. Recién después decidir pricing, Stripe, paywalls y lanzamiento.

## 13. Preguntas útiles para la próxima conversación

- ¿Las opciones de Council separan liderazgo de dominancia y cooperación de pasividad?
- ¿Stormbound distingue de forma consistente riesgo calculado de impulso?
- ¿Qué revisión profesional externa necesita el modelo antes de publicarse?
- ¿El tono psicológico es personal y enriquecedor sin sonar diagnóstico?
- ¿Qué símbolos, composición y paleta deben diferenciar cada Journey?
- ¿Cómo deberían verse los resultados Council, Stormbound y el perfil acumulativo?
- ¿Qué señales conviene cubrir en un cuarto Journey para cerrar vacíos, especialmente creación?
- ¿Qué gate exacto debe aprobarse antes de invertir en las 72 imágenes finales?

## 14. Documentos fuente dentro del repositorio

- `docs/v2/MVP_CONTINUATION_REPORT.md`
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

## 15. Confirmaciones de alcance

- No se hizo push.
- No se hizo deploy.
- No se modificó `main`.
- No se tocó D1 de producción.
- No se implementó Stripe.
- No se fijó pricing final.
- No se generaron imágenes finales de producción.
- The Unwritten Road conserva su hash, resultados y compatibilidad histórica.
