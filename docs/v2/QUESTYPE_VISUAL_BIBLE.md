# Biblia visual Questype V2

## Identidad

Questype presenta una aventura introspectiva adulta. La fantasía sirve como espejo psicológico: paisajes amplios, materiales reales, luz con intención y personajes humanos. La imagen debe invitar a observar antes de elegir.

## Lenguaje visual

- **Estilo:** fotografía fantástica cinematográfica, realismo elevado, textura orgánica y detalle controlado.
- **Escala:** figura humana pequeña o mediana frente a un entorno significativo.
- **Composición:** ruta legible, destino o tensión visual clara, espacio útil para UI responsive.
- **Paleta:** verde bosque profundo, piedra fría, marfil, cobre y oro de fuego; azules nocturnos para misterio y presión.
- **Luz:** amanecer/atardecer para elección y revelación; fuego para intimidad; luna y tormenta para incertidumbre.
- **Cámara:** 28–50 mm equivalente, profundidad atmosférica, perspectiva natural; evitar deformación extrema.
- **Personajes:** adultos creíbles, vestuario de viaje funcional, emociones contenidas, diversidad sin caricatura.
- **Magia:** sugerida mediante luz, geometría, clima y símbolos; evitar efectos saturados de videojuego.

## Continuidad

Cada Journey tendrá una ficha de continuidad con:

- protagonista masculino y femenino, rostro, cabello, vestuario y equipo;
- aliados recurrentes;
- destino arquitectónico;
- clima y cronología de luz;
- objetos persistentes;
- símbolos propios;
- paleta y lente por acto.

Un asset nuevo se aprueba comparándolo con la ficha y con la escena anterior/siguiente.

## Regla de idioma en imágenes

**Ninguna imagen base puede contener texto legible en español, inglés ni otro idioma real.** Esto incluye títulos, carteles, libros abiertos, mapas rotulados, etiquetas, logos, marcas de agua, números y letras aisladas que parezcan señalética.

Se permiten:

- sigilos geométricos;
- constelaciones sin etiquetas;
- diagramas abstractos;
- patrones rúnicos ficticios sin sintaxis repetible;
- iconos de objetos, animales, rutas o elementos naturales.

Los símbolos no deben formar palabras ni imitar claramente un alfabeto existente. Todo texto de UI, tarjetas o PDF se compone después como HTML/CSS o capa vectorial localizable.

### Bloque obligatorio para prompts

> Imagen limpia, sin palabras, sin letras, sin números, sin tipografía, sin carteles legibles, sin logos y sin marcas de agua. Cualquier mapa, libro, bandera o inscripción usa solamente símbolos geométricos ficticios no lingüísticos y no forma frases.

### QA obligatorio

Inspeccionar al 100% de tamaño paredes, cajas, mapas, libros, armas, ropa, banderas y fondo arquitectónico. Si una forma se lee como lenguaje, el asset queda `repair` aunque el texto sea incoherente.

## Formatos

| Uso | Master | Derivado recomendado | Zona segura |
|---|---:|---:|---|
| Escena de Journey | 1920×1080 o superior, 16:9 | 960×540 WebP/AVIF | 12% lateral y 14% inferior para UI |
| Hero | 2400×1350, 16:9 | 1280×720 | sujeto fuera del bloque de texto |
| Retrato de resultado | 1200×2133, 9:16 | 675×1200 | rostro en tercio superior, manos/objeto visibles |
| Card de catálogo | 1600×1000, 8:5 | 800×500 | centro seguro 70% |
| Open Graph | composición desde asset neutro | 1200×627 | texto se agrega por código |
| Story social | composición desde asset neutro | 1080×1920 | márgenes 72 px y safe zones de plataforma |

Masters de creación viven fuera de `public`. Runtime recibe WebP/AVIF optimizados, con dimensiones y foco declarados.

## Responsive

- Escritorio: preservar escala y ruta del paisaje; panel de decisión no cubre el sujeto.
- Tablet: mover panel según el `focalPoint`; máximo 50% del ancho.
- Móvil: usar crop diseñado o `<picture>` específico. La tarjeta ocupa una franja inferior compacta y desplazable cuando sea necesario.
- No depender solo de `object-position: center`; cada asset declara foco.
- El texto mantiene contraste mediante gradiente de UI, no oscureciendo permanentemente la imagen.

## Accesibilidad

- `alt` bilingüe describe acción y entorno, no interpreta psicológicamente al usuario.
- Imágenes decorativas usan alt vacío.
- Contraste WCAG AA para overlays.
- Movimiento de partículas, parallax o zoom respeta `prefers-reduced-motion`.
- Nunca esconder información necesaria exclusivamente dentro de una imagen.

## Identidad por Journey

### I — The Unwritten Road

Exploración, curiosidad y llamado. Valles verdes, mercado de fuego, costa y faro. Ruta visible y atmósfera de descubrimiento.

### II — Council of Realms

Liderazgo y colaboración. Arquitectura cívica fantástica, salas circulares, puentes entre comunidades, mesas de negociación y símbolos de responsabilidad compartida. Paleta: piedra cálida, bronce, azul profundo y luz diurna. Evitar coronas obvias como atajo de “líder”.

### III — Stormbound Passage

Presión, riesgo y adaptación. Paso marítimo o montañoso bajo clima cambiante, refugios frágiles, decisiones logísticas y cooperación. Paleta: grafito, azul tormenta, espuma, cobre y destellos cálidos. Evitar combate; la tensión nace del entorno y del tiempo.

## Criterios de rechazo

- texto o pseudotexto con apariencia de idioma;
- estética infantil, caricatura o fantasía genérica brillante;
- poses heroicas estereotipadas sin relación con la escena;
- armas o combate como centro cuando la decisión es psicológica/social;
- manos o rostros visiblemente defectuosos;
- vestuario o personaje inconsistente;
- sujeto debajo de la UI en móvil;
- objeto narrativo ilegible;
- negros empastados o contraste que impida leer la interfaz;
- marca de agua, firma o logo del generador.
