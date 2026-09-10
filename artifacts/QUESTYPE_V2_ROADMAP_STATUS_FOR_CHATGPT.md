# Questype V2 — contexto y estado del roadmap

## Propósito de este documento

Este archivo resume el producto, las decisiones aprobadas y el estado técnico real de Questype al finalizar la Etapa 2. Puede adjuntarse a una conversación nueva de ChatGPT para debatir contenido, producto, psicología, UX, precios o próximos Journeys sin perder el contexto del proyecto.

Las funciones descritas como futuras todavía no deben tratarse como implementadas.

## Qué es Questype

Questype es una experiencia narrativa interactiva de autoconocimiento. El usuario recorre una historia fantástica lineal y responde qué haría o pensaría en distintos momentos. Las elecciones no crean side quests ni cambian el orden de las escenas; producen evidencia psicológica mientras todos los usuarios conservan el mismo hilo narrativo y el mismo inventario visual controlado.

El resultado actual presenta:

- un arquetipo dominante;
- un arquetipo secundario;
- la constelación completa de doce arquetipos;
- motivaciones, estilo de decisión y patrón de sombra;
- interpretación personalizada en inglés o español;
- PDF personal bilingüe;
- tarjeta y enlace público de sharing con campos limitados.

La experiencia es de reflexión personal y entretenimiento. No entrega diagnósticos psicológicos ni médicos.

## Estado del MVP público

The Unwritten Road está publicado en `questype.com` como MVP V1. Incluye 15 momentos, doce arquetipos, elección de representación visual hombre/mujer, música de Journey con control MUTE/UNMUTE, resultado, PDF y sharing.

La rama pública es `main`. La V2 no fue publicada.

## Principios aprobados para V2

1. Mantener The Unwritten Road y sus resultados históricos sin cambios.
2. Incorporar varios Journeys sobre un reproductor y un registro compartidos.
3. Mantener historias lineales. Las decisiones miden patrones, pero no multiplican escenas ni imágenes.
4. Separar contenido público de pesos y scoring privados del servidor.
5. Construir doce señales psicológicas comparables entre Journeys.
6. Crear un perfil acumulativo auditable con snapshots inmutables.
7. Permitir completar el Journey gratuito sin cuenta.
8. Ofrecer cuenta opcional con magic link para conservar y acumular resultados.
9. Usar compras unitarias y entitlements para Journeys premium.
10. Mantener toda la experiencia, resultados, PDFs y sharing en inglés y español.
11. No hornear texto real en ninguna imagen. La UI localizable se compone con HTML/CSS o durante la exportación.
12. Permitir símbolos ficticios y geometría no lingüística en las imágenes.

## Roadmap y estado

### Fase 0 — Auditoría y arquitectura

**Estado: completada y aprobada.**

Se documentaron:

- comportamiento congelado del MVP;
- auditoría de rutas, D1, scoring, PDF, sharing, imágenes y tests;
- mapeo de dimensiones actuales contra doce señales V2;
- arquitectura multi-Journey;
- migraciones aditivas;
- modelo del perfil acumulativo;
- autenticación, productos, precios y entitlements;
- inventario y biblia visual.

### Etapa 1 — Blindaje de V1

**Estado: completada en local.**

Se crearon 14 fixtures dorados:

- un recorrido para cada uno de los doce arquetipos dominantes;
- un empate primario triple;
- un caso con evidencia de sombra limitada.

Los fixtures congelan ranking, porcentajes, perfil estructurado, interpretación, PDF y sharing EN/ES. El hash de contenido V1 es:

`116ab299e56b8ff5ac00d123794521bf320852c4efaaf3814db2955429a9601e`

### Etapa 2 — Registro multi-Journey

**Estado: completada en local.**

Se implementó:

- `JourneyRegistry` por slug, ID estable e ID legacy;
- `JourneyPublicManifest` para identidad, localización y assets;
- `JourneyServerModel` para contenido, motor, hash y release;
- carga dinámica del scoring únicamente en servidor;
- manifiesto visual de The Unwritten Road;
- assets responsive, focos, alt EN/ES, procedencia y QA;
- variantes declaradas para los cuatro objetos de la escena 10;
- continuidad declarada del objeto hacia la escena 11;
- reproductor genérico para cantidades variables de escenas y actos;
- contrato que admite el formato de 18 escenas planeado para nuevos Journeys;
- catálogo `/journeys`;
- rutas canónicas por slug;
- redirects desde las rutas V1;
- migración D1 `0001` y backfill local;
- compatibilidad temporal con esquema D1 viejo y nuevo.

La migración local preservó sesiones, respuestas, resultados y shares, y terminó con cero errores de claves foráneas. El scoring y los resultados V1 no cambiaron.

Última validación local de la etapa: 62 pruebas automatizadas aprobadas, 21 controles del flujo web aprobados, migración D1 V1→V2 aprobada y build de producción completado.

### Etapa 3 — Motor de señales

**Estado: siguiente etapa; no iniciada.**

Debe:

- registrar doce señales, facetas y contextos;
- mapear evidencia V1 solo cuando exista correspondencia aprobada;
- almacenar señales en paralelo al resultado arquetípico;
- calibrar mediante simulaciones deterministas;
- producir cobertura por Journey, escena y opción;
- mantener invisibles las señales hasta aprobar datos y lenguaje.

### Etapa 4 — Cuenta opcional y claim

**Estado: pendiente.**

Propuesta aprobada: Better Auth con magic link, D1 y proveedor de correo abstraído. El resultado anónimo se reclama mediante la cookie de propiedad actual, sin aceptar IDs enviados por el navegador como prueba.

### Etapa 5 — Perfil acumulativo

**Estado: diseño aprobado; implementación pendiente.**

El perfil se calcula desde evidencia normalizada por Journey. Cada snapshot registra versión, fuentes, cobertura y fingerprint. Los porcentajes de arquetipos no se promedian para construir este perfil.

Profundidad prevista:

- inicial: un Journey;
- emergente: dos Journeys;
- establecido: tres Journeys, alcance de V2;
- extenso: reservado para cinco Journeys futuros.

### Etapa 6 — Comercio en Test Mode

**Estado: pendiente.**

Hipótesis aprobada para pruebas:

- Journey premium individual: EUR 6,90;
- Questype V2 Complete: EUR 11,90.

El bundle V2 incluye Council of Realms, Stormbound Passage y el perfil/PDF acumulativo de esta edición. No promete automáticamente productos futuros. La URL de éxito nunca concede acceso; los entitlements se crean desde webhooks verificados e idempotentes.

### Etapa 7 — Journey II: Council of Realms

**Estado: pendiente.**

Journey de 18 escenas orientado a liderazgo, seguridad social, empatía/cooperación, estructura y autonomía. Requiere contenido, revisión psicológica, simulación, storyboard y 36 masters visuales neutrales al idioma.

### Etapa 8 — Journey III: Stormbound Passage

**Estado: pendiente.**

Journey de 18 escenas orientado a riesgo, adaptación y regulación bajo presión. Debe diferenciar valentía, tolerancia al riesgo, impulsividad y regulación emocional. También requiere 36 masters visuales neutrales al idioma.

### Etapa 9 — Perfil visual y exportaciones

**Estado: pendiente.**

Incluye constelación acumulativa generada por código, comparación contextual no clínica, PDF acumulativo EN/ES y tarjetas diferenciadas por Journey y perfil.

### Etapa 10 — Candidato de lanzamiento

**Estado: pendiente.**

Incluye accesibilidad, teclado, responsive, rendimiento, seguridad, privacidad, rate limits, ensayo de migración/rollback y revisión comercial. El deploy de V2 requiere una autorización explícita posterior.

## Las doce señales propuestas

El perfil V2 se diseña alrededor de doce señales independientes de los arquetipos:

1. autonomía;
2. estructura;
3. tolerancia al riesgo;
4. apertura a la incertidumbre;
5. orientación al conocimiento;
6. orientación a la creación;
7. empatía y cooperación;
8. seguridad social;
9. iniciativa de liderazgo;
10. persistencia;
11. adaptabilidad;
12. regulación emocional.

Cada señal necesita evidencia, oportunidades de observación, contextos y una banda de confianza. Cuando un Journey no mide una señal, el perfil debe mostrarla como ausente; no se inventa un valor neutral.

## Arquitectura actual de V2

La rama local es `codex/questype-v2`.

Separación principal:

```text
JourneyRegistry
  -> JourneyPublicManifest
       identidad, localización, acceso, escenas y assets
  -> loadServerModel()
       contenido puntuable, motor, hash y release

web session
  -> journey_id
  -> journey_version_id
  -> estado y respuestas

result
  -> perfil arquetípico inmutable de ese Journey

futuro result_construct_scores
  -> evidencia normalizada de las doce señales

futuro profile_snapshot
  -> agregación inmutable de varios resultados
```

Rutas canónicas disponibles localmente:

```text
/journeys
/journey/the-unwritten-road/start
/journey/the-unwritten-road/play
/journey/the-unwritten-road/processing
/result/[id]
/share/[id]
```

Las rutas `/start`, `/journey` y `/processing` redirigen al Journey actual para conservar enlaces existentes.

## Persistencia actual

La migración V2 `0001` agrega:

```text
journeys
journey_versions
web_sessions.journey_id
web_sessions.journey_version_id
web_sessions.updated_at
```

Las tablas legacy se conservan. No se recalculan resultados y no se elimina información durante la migración.

## Productos planeados

| Código conceptual             | Producto                                       | Acceso                     |
| ----------------------------- | ---------------------------------------------- | -------------------------- |
| `journey_unwritten_road`      | The Unwritten Road                             | gratuito                   |
| `journey_council_realms`      | Council of Realms                              | compra individual o bundle |
| `journey_stormbound_passage`  | Stormbound Passage                             | compra individual o bundle |
| `bundle_questype_v2_complete` | Ambos Journeys premium y perfil acumulativo V2 | bundle                     |

## Reglas narrativas y visuales obligatorias

- Cada Journey mantiene un único orden de escenas.
- Las decisiones pueden cambiar reflexión, puntuación u objeto declarado, pero no crean side quests.
- Las imágenes no contienen palabras en inglés ni español.
- Tampoco deben contener pseudotexto que parezca una frase.
- Se permiten símbolos ficticios y diagramas no lingüísticos.
- Todo texto visible debe poder cambiar con el idioma de la página.
- Antes de generar imágenes se aprueban historia, mapa de señales y storyboard.
- Cada Journey nuevo de 18 escenas apunta a 36 masters: 18 por representación visual.
- Las decisiones no aumentan esa cantidad salvo una excepción explícita y acotada.

The Unwritten Road conserva una excepción visual legacy aprobada: algunas imágenes existentes todavía requieren inspección o reparación por pseudotexto. Esto no habilita la misma excepción para contenido nuevo.

## Validación disponible

El gate local `npm run check:full` comprueba:

- tipos;
- pruebas de dominio y contratos;
- los 14 resultados dorados de V1;
- hash de contenido;
- migraciones D1 locales;
- backfill sobre una base V1 poblada;
- preservación de resultados y shares históricos;
- claves foráneas;
- redirects y rutas nuevas;
- recorrido completo de 15 escenas;
- continuidad visual de la elección del objeto;
- PDF;
- sharing, ownership, revocación y eliminación.

## Qué puede debatirse ahora con ChatGPT

La siguiente conversación puede trabajar sobre:

- definición semántica y nombres públicos de las doce señales;
- criterios de evidencia y bandas de confianza;
- mapeo prudente de las elecciones V1 a señales V2;
- storyboard psicológico de Council of Realms;
- storyboard psicológico de Stormbound Passage;
- copy no clínico para perfil acumulativo;
- propuesta de valor y packaging;
- riesgos de deseabilidad social, opciones demasiado obvias o afirmaciones excesivas.

Debe distinguir siempre entre propuestas de diseño y funciones ya implementadas. No debe recomendar publicar V2 ni generar las 72 imágenes nuevas antes de aprobar señales, historias y storyboards.
