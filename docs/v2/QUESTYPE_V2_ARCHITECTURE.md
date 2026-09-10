# Arquitectura propuesta — Questype V2

## Principios

- Mantener V1 operativa mediante compatibilidad explícita.
- Resolver Journey, release y motor en servidor.
- Separar contenido público de pesos privados.
- Guardar evidencia de señal como datos versionados.
- Tratar cuentas como opción para conservar y acumular resultados, no como barrera para el Journey gratuito.
- Conceder acceso por entitlements, nunca por parámetros del cliente.
- Generar PDFs y shares desde contratos estructurados y mínimos.

## Módulos

```text
app/
  journeys/
  journey/[slug]/start/
  journey/[slug]/play/
  journey/[slug]/processing/
  result/[id]/
  profile/
  api/auth/[...all]/
  api/checkout/
  api/stripe/webhook/

content/journeys/
  the-unwritten-road/
  council-of-realms/
  stormbound-passage/
    manifest.ts        # metadatos, textos, escenas, assets
    scoring.server.ts  # pesos privados y calibración
    translations/

src/domain/
  journeys/registry.ts
  scoring/archetype-engine.ts
  scoring/signal-engine.ts
  profiles/aggregator.ts
  profiles/snapshots.ts
  commerce/entitlements.ts

src/application/
  journey-service.ts
  profile-service.ts
  identity-service.ts
  commerce-service.ts

src/reports/
  journey-report/
  profile-report/
```

La ubicación definitiva puede adaptarse a Vinext, pero los límites de dependencia son obligatorios.

## Registro de Journeys

```ts
type JourneyDefinition = {
  id: string;
  slug: string;
  status: "draft" | "published" | "retired";
  access: "free" | "entitlement";
  currentVersion: string;
  focus: string[];
  locales: ("en" | "es")[];
  sceneCount: number;
  estimatedMinutes: number;
  assets: JourneyAssetManifest;
  loadPublicContent(): Promise<JourneyPublicContent>;
  loadServerScoring(): Promise<JourneyScoringModel>;
};
```

Comenzar una sesión fija `journey_id` y `journey_version_id`. Publicar una nueva versión no altera una sesión existente ni impide abrir un resultado histórico.

## Rutas y compatibilidad

| Ruta V2 | Comportamiento |
|---|---|
| `/journeys` | Catálogo y estado de acceso |
| `/journey/[slug]/start` | Introducción y configuración del Journey |
| `/journey/[slug]/play` | Reproductor lineal genérico |
| `/journey/[slug]/processing` | Cierre y cálculo |
| `/result/[id]` | Resultado privado de un Journey |
| `/profile` | Perfil acumulativo de la cuenta |
| `/profile/snapshot/[id]` | Snapshot privado o exportable |

Compatibilidad:

- `/start` → `/journey/the-unwritten-road/start`
- `/journey` → `/journey/the-unwritten-road/play`
- `/processing` → `/journey/the-unwritten-road/processing`
- `/result/[id]` y `/share/[id]` permanecen estables.

## Autenticación

### Decisión recomendada

Adoptar **Better Auth con magic link**, D1 nativo y cookie de sesión segura. Better Auth ofrece handler sobre `Request`/`Response`, plugin de magic link y soporte D1 de primera clase. El envío se abstrae detrás de `EmailProvider`; para producción se recomienda Cloudflare Email Service mediante binding `EMAIL`, sujeto a disponibilidad y plan de la cuenta.

Motivos:

- no obliga a crear contraseñas;
- encaja con la propiedad anónima actual;
- mantiene el runtime en Workers/D1;
- permite reemplazar el proveedor de email sin cambiar dominio ni tablas de producto.

Restricciones:

- fijar versión exacta de Better Auth y ejecutar su schema generado dentro de nuestras migraciones revisadas;
- no usar plugins que exijan transacciones interactivas de D1;
- abstraer el proveedor de correo para poder usar Postmark u otro si Email Service no está habilitado;
- limitar solicitudes por IP normalizada y hash de email;
- responder de forma uniforme exista o no la cuenta;
- token de un solo uso, hash en DB y TTL de 15 minutos;
- cookie `Secure`, `HttpOnly`, `SameSite=Lax`, rotada al autenticar.

### Claim de sesiones anónimas

Después de autenticar, el servidor recibe simultáneamente la sesión de cuenta y la cookie anónima vigente. En un batch atómico:

1. verifica que las sesiones pertenecen al `owner_hash`;
2. agrega `user_id` solo a sesiones sin dueño autenticado;
3. registra el claim con un ID idempotente;
4. conserva el hash anterior para auditoría limitada;
5. rota la cookie anónima.

Nunca se acepta una lista de IDs enviada por el cliente como prueba de propiedad.

## Productos, bundle y precios

### Catálogo V2 recomendado

| Código | Incluye | Acceso |
|---|---|---|
| `journey_unwritten_road` | Journey I, resultado, PDF y share | Gratuito |
| `journey_council_realms` | Journey II y su informe | Compra individual |
| `journey_stormbound_passage` | Journey III y su informe | Compra individual |
| `bundle_questype_v2_complete` | Journey II + III + perfil acumulativo/PDF V2 | Compra bundle versionado |

“Complete” significa **contenido de la edición V2 descrita**, no acceso perpetuo a todo producto futuro. La landing y Checkout deben decirlo de forma explícita.

### Precio de prueba recomendado para aprobación

- Journey premium individual: **EUR 6,90**.
- Bundle Questype V2 Complete: **EUR 11,90**.

Esto evita la inconsistencia del borrador, donde dos Journeys de EUR 4,90–5,90 podían costar mucho menos que un bundle de EUR 19,90. Los importes son una hipótesis comercial para Stripe Test Mode, no un cambio de producción. Deben configurarse con Price IDs por entorno; el navegador solo envía un `productCode` permitido.

### Flujo de pago

1. Usuario autenticado elige un producto del catálogo servidor.
2. El servidor valida producto, precio activo, moneda y entitlement existente.
3. Crea una Checkout Session de pago único y redirige al Checkout alojado por Stripe.
4. La página de éxito muestra “confirmando” y consulta el servidor; no concede acceso.
5. El webhook verifica la firma con el body crudo y procesa `checkout.session.completed`.
6. Un batch idempotente registra el evento, la compra y los grants.
7. Reembolsos o disputas ajustan el estado según una política explícita, sin borrar resultados ya creados.

## Entitlements

El control de acceso consulta `entitlements`, no Stripe en cada request. Un grant contiene `source_type`, `source_id`, `product_id`, fechas y estado. El bundle crea grants para sus miembros actuales y registra la versión del bundle comprada.

## Perfil acumulativo

El Journey completado genera dos artefactos:

- `web_results`: resultado arquetípico inmutable para ese Journey;
- `result_construct_scores`: señales normalizadas y evidencia.

El agregador toma resultados elegibles de una cuenta y crea un snapshot inmutable. El PDF acumulativo consume el snapshot; nunca vuelve a ejecutar el motor en el cliente.

## Contenido y narrativa

- El reproductor acepta N escenas y opciones estables, sin regex ligados a 15 momentos.
- Las decisiones pueden cambiar microcopy de reflexión o el objeto visible, dentro de variantes declaradas.
- No crean escenas nuevas, side quests ni combinaciones explosivas de imágenes.
- Los ecos narrativos se limitan a referencias de texto estructuradas y no alteran el orden.

## Imágenes

Cada asset entra por un manifiesto:

```ts
type VisualAsset = {
  id: string;
  src: string;
  responsiveSrc?: string;
  width: number;
  height: number;
  focalPoint: { x: number; y: number };
  alt: { en: string; es: string };
  containsReadableLanguage: false;
  qaStatus: "pending" | "approved" | "repair" | "replace";
  provenance: string;
};
```

La regla `containsReadableLanguage: false` es una puerta de publicación. Un asset con texto real, marca, watermark o formas que parezcan una frase se repara o reemplaza. Las palabras de UI se superponen como HTML/CSS. Los PDFs y tarjetas componen texto localizable sobre assets neutros.

## Observabilidad

Registrar eventos técnicos y de embudo con IDs seudónimos, journey/release, locale y estado. Excluir respuestas, scores por persona, nombre, email y texto libre. Definir retención. Errores de webhook pueden incluir el ID Stripe, pero nunca el payload completo.

## Fuentes técnicas consultadas

- Better Auth: magic link, D1 y migraciones: <https://better-auth.com/docs/plugins/magic-link>, <https://better-auth.com/blog/1-5>, <https://better-auth.com/docs/concepts/database>
- Cloudflare Email Service: <https://developers.cloudflare.com/email-service/>
- D1 batch: <https://developers.cloudflare.com/d1/worker-api/d1-database/#batch>
- Stripe Checkout y firma de webhooks: <https://docs.stripe.com/payments/checkout/how-checkout-works>, <https://docs.stripe.com/webhooks/signature>
