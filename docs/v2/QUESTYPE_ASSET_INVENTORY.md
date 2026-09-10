# Inventario visual Questype — Fase 0

## Resumen

Inventario de `public/images` al 2026-09-10.

| Familia | Archivos | Peso aproximado | Uso |
|---|---:|---:|---|
| Escenas Journey I | 72 | 9,72 MB | 36 masters 1600×900 + 36 derivados 900×506 |
| Retratos de arquetipos | 24 | 5,11 MB | 12 arquetipos × presentación man/woman, aprox. 900×1600 |
| Marketing/general | 13 | 13,04 MB | Hero, estación, valle y beacon; incluye PNG de origen duplicados |
| **Total** | **109** | **27,87 MB** | — |

Los archivos son activos de runtime o fuentes que hoy viven dentro de `public`. La acción sugerida no se ejecuta en Fase 0.

## Estado de QA

- `keep`: funciona y respeta continuidad.
- `inspect-text`: conservar provisionalmente, pero revisar al 100% por formas parecidas a letras en mapas, cajas o arquitectura.
- `source-only`: mover fuera de `public` cuando se implemente el pipeline.
- `manifest`: incorporar a un manifiesto con dimensiones, foco, alt y procedencia.

Todo asset recibe además la regla global **sin lenguaje real ni pseudotexto con apariencia de palabras**.

## Marketing y fondos generales — 13 archivos

| Familia | Archivos | Acción | Observación |
|---|---|---|---|
| Hero del faro | `hero-lighthouse.webp`, `hero-lighthouse-sm.webp` | keep + manifest | Hero principal, 16:9, viajeros hacia el faro |
| Estación abandonada | `forest-waystation.webp`, `forest-waystation-sm.webp`, `forest-waystation.png` | WebP keep; PNG source-only | Revisar señalética/objetos |
| Beacon de la cresta | `ridge-beacon.webp`, `ridge-beacon-sm.webp`, `ridge-beacon.png` | WebP keep; PNG source-only | Buen espacio para texto HTML |
| Valle panorámico | `valley-wide.webp`, `valley-wide-sm.webp`, `valley-wide.png` | WebP keep; PNG source-only | Fallback del share público; el derivado pequeño no está referenciado allí |
| Valle de referencia | `valley-reference.webp`, `valley-reference.png` | WebP sin referencia activa; PNG source-only | Fuente histórica; decidir archivo o uso antes de V2 |

Los cuatro PNG de origen suman aproximadamente 11,3 MB. Deben conservarse como masters fuera del bundle público, no borrarse.

## Journey I — 72 archivos

Cada fila representa cuatro archivos: master y `-sm` para `man` y `woman`, salvo las cuatro variantes del momento 10 que se listan por separado. Todos los masters son 1600×900 y los derivados son 900×506.

| Momento UI | Familia de archivo | Escena | Estado/acción |
|---:|---|---|---|
| 1 | `{man,woman}-01{,-sm}.webp` | Carta, mapa y llamada | keep + manifest; inspeccionar mapa |
| 2 | `{man,woman}-02{,-sm}.webp` | Mercado y mercader | keep + manifest; inspeccionar puestos |
| 3 | `{man,woman}-03{,-sm}.webp` | Puente roto | keep + manifest |
| 4 | `{man,woman}-04{,-sm}.webp` | Torre durante la tormenta | inspect-text; marcas en paredes |
| 5 | `{man,woman}-05-mara{,-sm}.webp` | Mara junto al fuego | keep + manifest; inspeccionar mapas |
| 6 | `{man,woman}-05{,-sm}.webp` | Carreta en el barro | keep + manifest; nombre heredado con offset |
| 7 | `{man,woman}-06{,-sm}.webp` | Grifo bajo el refugio | keep + manifest |
| 8 | `{man,woman}-07{,-sm}.webp` | Costa bajo la luna | keep + manifest |
| 9 | `{man,woman}-08{,-sm}.webp` | Marea creciente | keep + manifest |
| — | `{man,woman}-09{,-sm}.webp` | Familia legacy sin referencia en el reproductor actual | revisar y mover fuera del runtime si no tiene uso documental |
| 10A | `{man,woman}-10-1{,-sm}.webp` | Daga | keep + manifest; confirmar lectura del objeto |
| 10B | `{man,woman}-10-2{,-sm}.webp` | Llave | keep + manifest; confirmar lectura del objeto |
| 10C | `{man,woman}-10-3{,-sm}.webp` | Frasco | keep + manifest; confirmar lectura del objeto |
| 10D | `{man,woman}-10-4{,-sm}.webp` | Capa | keep + manifest; confirmar lectura del objeto |
| 11 | reutiliza la variante 10 elegida | Guardián y acto de soltar | deuda visual: mismo asset con otro texto narrativo |
| 12 | `{man,woman}-11{,-sm}.webp` | Banquete de quienes llegaron | inspect-text; objetos/libros |
| 13 | `{man,woman}-12{,-sm}.webp` | Faro apagado y reparación | inspect-text; diagramas de fondo |
| 14 | `{man,woman}-13{,-sm}.webp` | Página para el próximo viajero | inspect-text crítico; cuaderno debe usar símbolos |
| 15 | `{man,woman}-14{,-sm}.webp` | Flautista y ceremonia | keep + manifest |

### Nota de nomenclatura

La colección se numeró antes de agregar la escena de Mara. Por eso el momento 6 usa `-05`, los momentos 7–9 usan `-06` a `-08`, y los momentos 12–15 usan `-11` a `-14`. La familia `-09` no es referenciada por el reproductor. El reproductor conoce el resto del offset mediante código especial. V2 debe migrar la asociación a un manifiesto por `sceneId`, sin renombrar archivos en la misma release.

### Deuda del momento 11

El momento 11 reutiliza la imagen del objeto seleccionado. Conserva la continuidad y evita cuatro escenas extra, pero la imagen no representa de forma específica al guardián. V2 puede conservarla en compatibilidad; una futura reparación puede producir una única imagen neutral del guardián donde el objeto quede fuera de cuadro, manteniendo el hilo y sin multiplicar assets.

## Retratos de resultado — 24 archivos

Cada fila contiene `public/images/archetypes/[id]-man.webp` y `[id]-woman.webp`.

| ID | Archivos | Estado/acción |
|---|---|---|
| `caregiver` | `caregiver-man.webp`, `caregiver-woman.webp` | keep + manifest |
| `creator` | `creator-man.webp`, `creator-woman.webp` | keep + manifest |
| `everyman` | `everyman-man.webp`, `everyman-woman.webp` | keep + manifest |
| `explorer` | `explorer-man.webp`, `explorer-woman.webp` | keep + manifest |
| `hero` | `hero-man.webp`, `hero-woman.webp` | keep + manifest |
| `innocent` | `innocent-man.webp`, `innocent-woman.webp` | keep + manifest |
| `jester` | `jester-man.webp`, `jester-woman.webp` | keep + manifest |
| `lover` | `lover-man.webp`, `lover-woman.webp` | keep + manifest |
| `magician` | `magician-man.webp`, `magician-woman.webp` | keep + manifest |
| `outlaw` | `outlaw-man.webp`, `outlaw-woman.webp` | keep + manifest |
| `ruler` | `ruler-man.webp`, `ruler-woman.webp` | keep + manifest |
| `sage` | `sage-man.webp`, `sage-woman.webp` | keep + manifest |

Los retratos son visualmente distintivos y coherentes con la marca. Antes de reutilizarlos en una tarjeta o PDF nuevo deben inspeccionarse libros, banners, instrumentos y paredes según la regla sin texto.

## Assets que faltan para V2

No se generan en Fase 0. El plan de producción debe cubrir:

- Journey II: hero/card, 18 escenas por presentación visual, derivados responsive y resultado temático.
- Journey III: hero/card, 18 escenas por presentación visual, derivados responsive y resultado temático.
- Perfil: fondos neutros por contexto, constelación acumulativa generada por código y cover sin texto horneado.
- Catálogo: card por Journey con zona segura compartida.
- Estados vacíos/bloqueados/completos: preferir símbolos SVG/CSS del sistema antes que nuevas ilustraciones.

Con 18 escenas y dos presentaciones, cada Journey nuevo necesita 36 masters si no hay variantes. Las decisiones no deben aumentar ese total salvo una excepción explícita y acotada como el objeto de V1.

## Pipeline propuesto

1. Generar master sin texto con prompt y seed/referencia registrados.
2. Revisar continuidad y anatomía.
3. Inspeccionar lenguaje real/pseudotexto al 100%.
4. Registrar procedencia, licencia, modelo y fecha.
5. Definir foco y alt EN/ES.
6. Crear WebP/AVIF y tamaños responsive.
7. Medir peso y calidad visual.
8. Añadir al manifiesto; solo `approved` puede usarse en una release publicada.
