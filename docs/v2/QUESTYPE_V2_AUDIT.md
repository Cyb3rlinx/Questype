# Auditoría técnica y de producto — Questype V2 Fase 0

## Dictamen

El MVP es una base adecuada para V2. El recorrido, la puntuación determinista, D1, el resultado bilingüe, el PDF y el sistema de compartir están implementados y probados. La limitación central es arquitectónica: el servicio, el esquema de IDs y varias rutas asumen un único Journey. V2 debe extraer ese supuesto antes de agregar contenido, cuentas o pagos.

No se encontraron motivos para reescribir el MVP. La estrategia recomendada es una migración aditiva con adaptadores de compatibilidad.

## Aplicación y rutas

### Hallazgos

- `src/application/web-service.ts` importa directamente `journeyV1`, su motor, hash y release. Es el principal punto de acoplamiento.
- `/start`, `/journey` y `/processing` representan un flujo único sin `journeySlug`.
- `/result/[id]` y `/share/[id]` ya usan identificadores opacos y pueden permanecer estables.
- El esquema y la validación restringen las escenas a 15 y los IDs a `scene_XX`/`choice_[a-d]`.
- La imagen alternativa del objeto elegido está resuelta con lógica especial del momento 10.
- El servicio solo busca sesiones de la release actual. Una release histórica válida puede quedar inaccesible al cambiar el contenido.

### Decisión

Introducir un registro de Journeys y resolver una release publicada al comenzar una sesión. El servicio recibirá el Journey resuelto como dependencia y dejará de importar el singleton. Los resultados conservarán la release exacta con la que fueron calculados.

## D1

### Estado actual

La base de producción es D1/SQLite con seis tablas: `web_visitors`, `web_releases`, `web_sessions`, `web_answers`, `web_results` y `web_shares`. El diseño PostgreSQL descrito en documentos antiguos no representa la implementación activa.

### Fortalezas

- Propiedad anónima separada del identificador público.
- Claves foráneas y borrado en cascada.
- Unicidad por escena y posición de respuesta.
- Resultado único por sesión y share único por resultado.
- Revisión optimista de sesión para evitar respuestas concurrentes contradictorias.

### Riesgos y brechas

- `web_sessions` no identifica el Journey de forma directa.
- `profile_json` reúne evidencia, presentación e interpretación; V2 necesita señales consultables y versionadas.
- No existen usuarios, reclamos de sesiones anónimas, productos, precios, compras ni derechos de acceso.
- No existe un snapshot acumulativo que enumere las sesiones fuente.
- El historial depende de que la release antigua permanezca disponible y resoluble.
- Los cambios DDL aún no tienen pruebas de upgrade/rollback sobre copias de datos V1.

### Decisión

Usar migraciones aditivas y `D1Database.batch()` para operaciones atómicas pequeñas, como reclamar sesiones o conceder derechos. Cloudflare documenta que un batch ejecuta secuencialmente y revierte toda la secuencia cuando falla una sentencia. No se diseñará alrededor de transacciones interactivas.

## Puntuación

### Estado actual

La puntuación real se ejecuta en servidor, compensa oportunidades del contenido y tiene desempate determinista. El reporte de balance confirma que los 12 arquetipos son alcanzables. La presentación final fuerza una lectura clara con un dominante y un secundario.

### Riesgos y brechas

- Las dimensiones internas actuales mezclan constructos psicológicos, motivaciones arquetípicas y sombras.
- `dominant/directive` no mide por sí solo confianza social ni liderazgo sano.
- `impulsive` no puede tratarse como inverso exacto de deliberación.
- Adaptabilidad y regulación emocional bajo presión no cuentan con señales atómicas directas.
- El porcentaje editorial podría confundirse con un dato de perfil si no se separa en el modelo.
- Falta un fixture dorado de resultados V1 que detecte cambios durante el refactor.

### Decisión

Mantener intacto el motor arquetípico V1 y agregar una salida paralela de señales normalizadas. Cada Journey V2 declara qué señales mide, con qué cobertura y en qué contexto. El perfil acumulativo combina estas señales, no los porcentajes visibles de arquetipo.

## PDF

### Estado actual

El PDF se genera en cliente con `pdf-lib`, fuentes locales e imagen de arquetipo. Los datos llegan desde una ruta privada. La muestra auditada tiene cinco páginas A4, buen contraste y ninguna superposición visible.

### Brechas

- La plantilla está orientada a un único resultado arquetípico.
- El capítulo 6 comienza en una página y continúa en la siguiente sin indicador de continuidad.
- Existe comprobación funcional en inglés, pero no regresión visual del PDF en español.
- No hay pruebas de nombres largos, caracteres no latinos, combinación de tres Journeys o tablas extensas.
- El archivo no está etiquetado para accesibilidad ni optimizado para descarga.

### Decisión

Separar `ReportData` de las plantillas. Mantener un informe por Journey y añadir una plantilla de perfil acumulativo. Crear fixtures visuales EN/ES y reglas explícitas de salto de página antes de agregar contenido.

## Sharing

### Estado actual

La proyección pública usa una allowlist estricta: idioma, título, uno o dos arquetipos, cita, imagen y nombre opcional. Las tarjetas se componen en cliente en cuatro formatos y el enlace se puede revocar.

### Brechas

- No hay regresión visual para los cuatro formatos, dos idiomas y nombres largos.
- Los metadatos sociales dependen de una proyección persistida que puede quedar desactualizada si cambia la presentación.
- V2 necesita distinguir compartir un Journey de compartir un perfil acumulativo.
- La privacidad del perfil combinado requiere un consentimiento independiente.

### Decisión

Conservar el patrón de proyección pública mínima y crear tipos separados: `journey_result_share` y `profile_snapshot_share`. Nunca exponer respuestas, señales crudas, compras, email ni IDs internos.

## Imágenes y rendimiento

- Hay 109 archivos públicos, aproximadamente 27,87 MB. La familia narrativa `man/woman-09` y `valley-reference` no tienen una referencia activa en el código auditado.
- La biblioteca incluye 36 escenas maestras más 36 derivados pequeños, 24 retratos y 13 imágenes generales/duplicadas.
- Cuatro PNG de origen duplican WebP y agregan alrededor de 11,3 MB al bundle público sin ser necesarios en runtime.
- Las escenas tienen continuidad visual sólida, pero algunos fondos contienen formas parecidas a letras generadas en paredes, cajas o mapas.
- La UI ya usa variantes pequeñas; falta un manifiesto formal con `aspectRatio`, `focalPoint`, `alt`, licencia, idioma visual y estado de QA.

La optimización física de archivos se hará en implementación. Fase 0 solo documenta qué conservar, reparar, reemplazar o retirar del bundle.

## Localización

La UI, historia, resultado y PDF tienen inglés y español. La fuente de contenido español está separada. Los assets rasterizados deben ser neutros al idioma. Para V2 queda prohibido hornear títulos, instrucciones, letras legibles, marcas o carteles en una imagen narrativa. Símbolos ficticios deben ser geométricos y no formar frases.

## Seguridad y privacidad

### Preservar

- Cookie `HttpOnly` de alta entropía y hash en base.
- Guardas de mismo origen y límite pequeño de body.
- Pesos de puntuación solo en servidor.
- Endpoints privados con ownership.
- Share explícito, mínimo y revocable.
- Límite diario de creación de sesiones.

### Agregar antes de vender

- CSRF/origin y rate limit específicos para auth, checkout, claim y webhook.
- Tokens de acceso de un solo uso, con hash, expiración breve y consumo atómico.
- Verificación de firma Stripe sobre el body crudo.
- Idempotencia por `stripe_event_id` y por grant.
- Política de retención y borrado para cuentas.
- Auditoría de reclamo anónimo y de cambios de entitlement.
- Encabezados CSP, HSTS, `frame-ancestors` y Permissions Policy revisados.
- Ningún evento analítico contiene respuestas, texto libre o señales individuales.

## Cobertura de pruebas

### Aprobado hoy

- 42 pruebas unitarias/de dominio, validación de contenido, tipos y build.
- 16 pruebas integrales de Worker/D1: sesión anónima, origen/cookie, ocultamiento de mapas, concurrencia, idempotencia, reanudación, cierre, porcentajes, ownership, PDF, share, revocación, retake y borrado.
- Simulación de 20.000 recorridos sin arquetipos inalcanzables.

### Faltante antes de V2 pública

1. Fixtures dorados de resultados V1 para congelar el motor.
2. Upgrade de una base V1 poblada hacia cada migración V2 y rollback operativo.
3. Varias releases activas e historial resoluble.
4. Claim anónimo → cuenta, incluyendo carrera y reintento.
5. Magic link expirado, reutilizado, rate limited y origen inválido.
6. Webhook válido, firma inválida, evento duplicado, evento fuera de orden y reembolso.
7. Entitlements individuales y bundle versionado.
8. Perfil acumulativo con cobertura parcial, señales ausentes y versiones distintas.
9. PDF visual EN/ES, texto largo y perfil multi-Journey.
10. Tarjetas visuales para cuatro formatos y dos idiomas.
11. Navegación por teclado, lector de pantalla, contraste y reducción de movimiento.
12. Capturas responsive y presupuestos de rendimiento para móvil, tablet y escritorio.

## Bloqueadores de implementación

No hay bloqueadores técnicos. Antes de implementar debe aprobarse:

- el modelo de 12 señales y sus etiquetas públicas;
- el alcance exacto del bundle comercial y su precio de prueba;
- Better Auth + magic link como opción de cuenta;
- la política de actualización de un perfil cuando cambia el algoritmo;
- la lista de assets V1 que se reparan por contener formas de texto.
