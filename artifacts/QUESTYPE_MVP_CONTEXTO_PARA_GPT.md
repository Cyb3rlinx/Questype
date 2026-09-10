# Questype — Documento de contexto del MVP para conversaciones con GPT

**Estado del documento:** descripción del producto actualmente implementado
**Fecha de referencia:** 10 de septiembre de 2026
**Producto:** Questype
**Experiencia disponible:** *El camino no escrito / The Unwritten Road*
**Sitio publicado:** [https://questype.com](https://questype.com)

## Cómo utilizar este documento

Este archivo está pensado para adjuntarse al comienzo de una conversación con GPT sobre la evolución de Questype. Describe qué es el producto, qué decisiones ya fueron tomadas, cómo funciona el MVP y qué áreas siguen abiertas para explorar.

Las funciones descritas como **actuales** ya forman parte del MVP. Las secciones tituladas **expansión posible** contienen oportunidades de producto y no deben interpretarse como funciones ya implementadas.

## Resumen del producto

Questype es una experiencia narrativa interactiva de reflexión personal. El usuario atraviesa una aventura fantástica lineal y toma decisiones frente a situaciones de incertidumbre, cooperación, peligro, vínculo, responsabilidad y transformación. Las elecciones no cambian el destino de la historia: revelan la forma en que la persona tiende a observar, decidir, proteger, crear, relacionarse y responder bajo presión.

Al terminar, el sistema entrega un perfil compuesto por doce arquetipos narrativos. Presenta un arquetipo principal, uno secundario y diez influencias menores, además de motivaciones, estilos de decisión, fortalezas, patrones para observar, forma de vincularse y caminos de crecimiento.

Questype utiliza la fantasía como lenguaje simbólico para crear empatía y reducir la sensación de estar completando un cuestionario tradicional. El tono busca sentirse personal, psicológicamente cuidadoso, fantástico y enriquecedor.

La experiencia está diseñada para la reflexión personal y el entretenimiento. No es un instrumento clínico, no diagnostica y no debe presentar sus resultados como una verdad fija sobre la identidad del usuario.

## Propuesta de valor

La mayoría de los tests exponen preguntas abstractas y ofrecen etiquetas breves al final. Questype convierte la evaluación en una historia vivida:

- El usuario responde mediante actos y pensamientos dentro de una aventura.
- Todas las opciones son defendibles y contienen beneficios y costos.
- No existen respuestas moralmente correctas o incorrectas.
- La historia conserva un único hilo para controlar la producción visual y narrativa.
- El resultado muestra una combinación de patrones, no una etiqueta aislada.
- La devolución utiliza lenguaje constructivo, contextual y no diagnóstico.
- El usuario puede conservar el resultado mediante un informe PDF y tarjetas sociales.

## Público y experiencia emocional buscada

Questype está orientado a personas interesadas en autoconocimiento, desarrollo personal, narrativa fantástica, psicología popular y experiencias digitales inmersivas.

La persona debería sentir:

1. **Curiosidad:** alguien dejó una carta y un mapa sin explicar quién, cómo o por qué.
2. **Elección:** cada momento le permite decidir desde su propia manera de enfrentar el mundo.
3. **Continuidad:** sus decisiones modifican la lectura psicológica, pero no rompen el relato.
4. **Reconocimiento:** el resultado debería sentirse específico, humano y coherente con el recorrido.
5. **Apertura:** la devolución propone reflexión y crecimiento sin encerrar a la persona en una identidad fija.

## Flujo actual del MVP

### 1. Landing page

La portada presenta a un grupo de viajeros que avanza hacia un faro. Resume la promesa de la experiencia, explica que existen quince momentos narrativos y doce arquetipos, e invita a comenzar.

La identidad visual combina fotografía fantástica cinematográfica, verdes profundos, tonos dorados y tipografía editorial. El faro representa dirección, significado y la búsqueda de algo que todavía no se comprende.

### 2. Inicio del viaje

Antes de comenzar, el usuario puede:

- Escribir un nombre opcional.
- Elegir si desea que su personaje sea representado como hombre o mujer.
- Leer el aviso de reflexión y entretenimiento.

El nombre es solamente información de presentación. La representación modifica pronombres e imágenes, pero ninguna de las dos variables participa en el cálculo psicológico.

### 3. Aventura interactiva

La historia tiene quince escenas organizadas en siete actos. Cada escena contiene:

- Una imagen de fondo.
- Título y narración en segunda persona.
- Cuatro decisiones posibles.
- Indicador de progreso.
- Posibilidad de pausar y continuar más tarde desde el mismo navegador.

Cada decisión queda guardada al ser aceptada. Las opciones no crean misiones secundarias ni líneas narrativas separadas. Después de cada elección, todos los usuarios avanzan a la misma escena siguiente. Esto permite contar una historia coherente y usar una cantidad controlada de imágenes.

La escena de los cuatro objetos posee cuatro imágenes posibles —daga, llave, poción y capa— porque el objeto elegido cambia el foco visual de ese momento. Después de la elección, todas las versiones regresan al mismo hilo narrativo.

### 4. Procesamiento y resultado

Después de las quince decisiones, el servidor calcula el perfil. El resultado incluye:

- Título de personaje.
- Imagen correspondiente al arquetipo principal y a la representación elegida.
- Arquetipo principal y secundario.
- Constelación con los doce porcentajes.
- “El hilo que te recorre”, con texto exclusivo para cada arquetipo principal.
- “Lo que aportas al camino”, con fortalezas propias de ese arquetipo.
- Motivaciones y brújula interior.
- Patrones de vínculo y crecimiento.
- Tendencias que pueden aparecer bajo presión, descritas de manera prudente.
- Informe personal descargable en PDF.
- Sistema de tarjetas y enlaces para compartir.

Los textos centrales de resultado son diferentes para cada uno de los doce arquetipos en español e inglés.

### 5. Informe y contenido compartible

El informe PDF está disponible en el idioma elegido y contiene portada y doce secciones:

1. Resultado principal.
2. Arquetipos dominantes.
3. Energía de sombra.
4. Forma de enfrentar desafíos.
5. Forma de tomar decisiones.
6. Motivaciones.
7. Forma de conectar con los demás.
8. Fortalezas naturales.
9. Patrones para observar.
10. Entorno ideal.
11. Camino de evolución.
12. Reflexión final.

Las tarjetas sociales pueden descargarse en formatos para Instagram 4:5, Historia 9:16, LinkedIn y X. El usuario puede elegir si desea incluir su nombre y si quiere mostrar uno o dos arquetipos. La tarjeta utiliza la imagen completa, presenta los porcentajes y la reflexión, y cierra con el título del personaje en la parte inferior.

Crear un enlace público es una acción explícita. Las respuestas originales, el análisis interno y los patrones privados bajo presión no se publican. Un enlace puede revocarse.

## Historia actual: El camino no escrito

### Premisa

El protagonista despierta con el recuerdo de una melodía. Frente a su puerta aparece una carta sin sello ni remitente. Dentro hay un fragmento de mapa cuyo destino es el Faro de la Vigilia. La tinta todavía está fresca y una campana comienza a sonar desde una antigua estación de viajeros abandonada.

El camino conduce a través de un mercado nocturno, un puente roto, una torre bajo la tormenta, encuentros con otros viajeros, una criatura mitológica, un campamento costero y una isla iluminada por la luna llena. En el faro espera el flautista enmascarado que entregó las cartas. Su frase final sugiere que esta no es la primera vez que el viajero llega hasta allí.

### Estructura de escenas

| Momento | Acto | Escena | Situación psicológica principal |
| ---: | --- | --- | --- |
| 1 | I — El llamado | **La tinta aún está fresca** | Primera respuesta ante una invitación incierta: actuar, investigar, escuchar o prepararse. |
| 2 | I — El llamado | **El mercader que reconoció la carta** | Elegir qué pregunta importa cuando solo se puede obtener una respuesta parcial. |
| 3 | II — El umbral | **El puente roto** | Afrontar un riesgo inevitable mediante valor, análisis, construcción o intuición. |
| 4 | II — El umbral | **La tormenta en la torre de vigilancia** | Decidir cómo habitar una espera tensa: ordenar, comprender, reparar o aliviar. |
| 5 | III — Aliados y desconocidos | **Una desconocida junto al fuego** | Compartir una noche con Mara mediante conocimiento, honestidad, creación o juego. |
| 6 | III — Aliados y desconocidos | **La carreta en el barro** | Resolver un bloqueo colectivo coordinando, actuando, experimentando o cuestionando supuestos. |
| 7 | IV — Las pruebas | **La criatura bajo el refugio** | Ayudar a un joven grifo sin convertir el cuidado en dominio. |
| 8 | IV — Las pruebas | **La costa bajo la luna** | Llegar frente al faro y prepararse para la marea desde el control, la exploración, el servicio o la unión. |
| 9 | IV — Las pruebas | **La marea creciente** | Ocupar un lugar útil durante una emergencia que no puede ser derrotada. |
| 10 | V — La tentación | **Los cuatro objetos** | Elegir una daga, una llave, una poción o una capa según lo que se cree necesitar. |
| 11 | V — La tentación | **El guardián del camino** | Entregar el objeto al fauno y revelar la manera personal de soltarlo. |
| 12 | VI — El faro | **El banquete de quienes llegaron** | Entrar en una comunidad de viajeros desde la igualdad, el descanso, la intimidad o el humor. |
| 13 | VI — El faro | **El faro apagado** | Contribuir a recuperar la luz mediante esfuerzo, invención, organización o transformación. |
| 14 | VII — El regreso | **Lo que dejas al próximo viajero** | Elegir qué conocimiento, mejora, vínculo o misterio se deja como legado. |
| 15 | VII — El regreso | **La melodía que te recordaba** | Encontrar al flautista enmascarado y elegir cómo recibir la melodía sin perder la propia conciencia. |

Algunas escenas reciben una ponderación especial como situaciones de presión. Esa condición forma parte del análisis privado y no aparece durante la aventura.

## Los doce arquetipos

| Arquetipo | Impulso central dentro de Questype |
| --- | --- |
| **Inocente** | Preservar la posibilidad de un buen comienzo y mantener disponible la esperanza. |
| **Explorador** | Encontrar posibilidades más allá de los límites conocidos y proteger el juicio independiente. |
| **Sabio** | Transformar la incertidumbre en una comprensión más precisa. |
| **Héroe** | Desarrollar capacidad y actuar al servicio de una tarea que vale la pena. |
| **Rebelde** | Cuestionar reglas que ocultan alternativas y abrir espacio para el cambio. |
| **Mago** | Conectar comprensión y acción para volver posible una transformación. |
| **Amante** | Dar atención y significado a los vínculos que merecen ser sostenidos. |
| **Creador** | Convertir una idea en una forma concreta mediante experimentación y oficio. |
| **Cuidador** | Sostener a las personas y las condiciones que permiten continuar. |
| **Bufón** | Liberar perspectivas rígidas mediante juego, presencia y una mirada inesperada. |
| **Gobernante** | Coordinar recursos y decisiones para alcanzar un resultado duradero. |
| **Compañero** | Hacer posible la participación y la pertenencia sin exigir un estatus excepcional. |

Los arquetipos son patrones narrativos. No representan diagnósticos, categorías clínicas ni una clasificación permanente de la personalidad.

## Modelo de análisis actual

### Señales evaluadas

Cada decisión aporta varias señales simultáneas. Ninguna respuesta equivale por sí sola a un arquetipo.

El modelo contempla:

- **12 arquetipos.**
- **6 motivaciones:** poder, libertad, conexión, creación, conocimiento y protección.
- **6 estilos de decisión:** impulsivo, estratégico, intuitivo, racional, protector y dominante.
- **6 ejes bajo presión:** control, evitación, autosacrificio, rebelión, obsesión y distanciamiento emocional.
- **Rasgos extensibles:** curiosidad, empatía, autonomía, persistencia, tolerancia al riesgo, confianza social y otros registros futuros.

Las señales de cada opción son números enteros pequeños y permanecen solamente en el servidor. El navegador recibe el texto público de las decisiones, nunca los pesos psicológicos.

### Cálculo y presentación

1. Se suman las señales de las quince elecciones.
2. Los arquetipos se calibran según cuántas oportunidades narrativas tuvo cada uno para aparecer.
3. Se ordenan de manera determinista y auditable.
4. La presentación enfatiza los dos patrones más fuertes:
   - Arquetipo principal: entre **45 % y 55 %**.
   - Arquetipo secundario: entre **22 % y 28 %**.
   - El porcentaje restante se distribuye entre las otras diez influencias.
5. Los doce porcentajes mostrados siempre suman exactamente 100 %.

Estos porcentajes expresan afinidad dentro del modelo narrativo de Questype. No son probabilidades, niveles de certeza ni comparaciones con la población.

El patrón bajo presión se calcula por separado. Requiere evidencia repetida y considera especialmente las escenas marcadas como presión. Si la evidencia es débil, el lenguaje del resultado debe indicarlo de forma tentativa.

### Reglas de integridad

- El nombre y la representación nunca modifican el resultado.
- No interviene el azar en el cálculo de producción.
- Las respuestas se validan contra una versión concreta de la historia.
- Una respuesta aceptada no puede reemplazarse silenciosamente.
- Un reintento crea una sesión nueva y conserva los resultados anteriores.
- La IA no elige ni recalcula arquetipos.

## Interpretación psicológica y uso de IA

El MVP utiliza interpretaciones deterministas y textos curados. No llama a un modelo de lenguaje en tiempo real para calcular o redactar cada resultado.

La arquitectura contempla una integración futura con IA bajo estas condiciones:

- La puntuación estructurada debe existir antes de llamar al modelo.
- La IA puede explicar el perfil, pero no cambiar rankings, porcentajes ni el arquetipo de sombra.
- La salida debe respetar un esquema cerrado y límites de longitud.
- No se acepta HTML generado por la IA.
- Deben rechazarse diagnósticos, afirmaciones absolutas y lenguaje clínico no sustentado.
- Si el proveedor falla, el resultado determinista debe seguir disponible.
- Los títulos del personaje deben provenir de candidatos previamente aprobados.

También existe una interfaz prevista para generar retratos personalizados en una fase futura. Actualmente se utilizan imágenes curadas para cada uno de los doce arquetipos, con versiones de hombre y mujer.

## Idiomas

La interfaz completa está disponible en español e inglés. La selección de idioma se mantiene durante todo el recorrido e incluye:

- Landing page.
- Inicio y recuperación de sesión.
- Quince escenas y sesenta decisiones.
- Procesamiento.
- Resultado completo.
- Nombres de arquetipos y títulos de personaje.
- Panel y textos para compartir.
- Informe PDF.
- Avisos de privacidad y reflexión.

Las traducciones conservan los mismos identificadores de elección. Cambiar de idioma no cambia ningún resultado.

## Privacidad y persistencia

El MVP no requiere una cuenta. Cada navegador recibe una identidad anónima mediante una cookie segura. Esa identidad permite recuperar el avance y volver a consultar los resultados en el mismo navegador.

Actualmente:

- Las sesiones, respuestas y resultados se almacenan en Cloudflare D1.
- El servidor verifica la propiedad antes de mostrar un resultado privado.
- Las mutaciones requieren solicitudes del mismo origen.
- Las respuestas JSON privadas no se almacenan en caché.
- El usuario puede eliminar los datos guardados en su navegador.
- Borrar la cookie elimina la posibilidad de recuperar la sesión; no existe recuperación por correo ni sincronización entre dispositivos.
- Los enlaces públicos contienen una proyección limitada y revocable, no el perfil privado completo.

## Arquitectura técnica actual

- **Frontend y servidor:** React 19, Vinext y TypeScript.
- **Componentes de interfaz:** Base UI y componentes locales.
- **Hosting:** Cloudflare Workers.
- **Base de datos activa:** Cloudflare D1.
- **Migraciones:** Drizzle.
- **PDF:** pdf-lib con fuentes locales.
- **Imágenes:** WebP responsivas; se sirven versiones más livianas en pantallas pequeñas.
- **Dominio:** [questype.com](https://questype.com).
- **Repositorio:** [github.com/Cyb3rlinx/Questype](https://github.com/Cyb3rlinx/Questype).

El sitio está adaptado para computadora, tablet y teléfono. El PDF se carga de manera diferida para no afectar el inicio de la experiencia. El proyecto mantiene pruebas automatizadas de puntuación, contenido, sesiones, privacidad, paridad entre representaciones y generación de resultados.

## Principios actuales que una expansión debería respetar

1. **Una historia puede contener decisiones sin multiplicar sus líneas narrativas.** Las elecciones cambian el análisis y las respuestas emocionales, no el orden principal de escenas.
2. **Toda opción debe ser psicológicamente defendible.** Cada estrategia necesita una ventaja, un límite y un contexto en el que tenga sentido.
3. **Las decisiones deben evaluar patrones indirectamente.** Evitar preguntas obvias como “¿te consideras valiente?” o respuestas que nombren el arquetipo que representan.
4. **La representación y el idioma no afectan la puntuación.** Solo modifican presentación, pronombres, textos e imágenes.
5. **El modelo psicológico debe permanecer separado de la narrativa pública.** Pesos, ejes y reglas de cálculo no deben exponerse durante el viaje.
6. **Las versiones publicadas son inmutables.** Cambiar escenas, opciones o pesos exige una nueva versión de contenido y una decisión explícita sobre la versión del scoring.
7. **La devolución debe conservar incertidumbre saludable.** Utilizar fórmulas como “tus elecciones sugieren” o “tu recorrido se alinea con”.
8. **Questype no debe presentarse como diagnóstico ni como ciencia validada si no existe evidencia correspondiente.**
9. **La privacidad debe ser opt-in para compartir.** Descargar una tarjeta no debe publicar un perfil.
10. **El resultado debe seguir funcionando si un proveedor de IA falla.** La lógica determinista es la fuente de verdad.

## Límites conocidos del MVP

- Solo existe una historia completa: *El camino no escrito*.
- No hay cuentas, perfiles permanentes ni sincronización entre dispositivos.
- No existe un CMS para crear o editar historias sin modificar código.
- No hay pagos, suscripciones ni niveles de acceso.
- No se generan textos o retratos individuales mediante IA en producción.
- Los resultados son narrativos y no cuentan con validación psicométrica poblacional.
- Falta realizar un estudio formal con usuarios para analizar comprensión, sesgos, deseabilidad social y consistencia temporal.
- No existe todavía un “perfil humano” que combine resultados de varias historias o marcos de análisis.

## Expansión posible para explorar con GPT

Las siguientes líneas son oportunidades abiertas, no decisiones cerradas:

### Nuevas historias

- Crear viajes con otros mundos, conflictos y tonos emocionales.
- Permitir que cada historia evalúe los mismos doce arquetipos desde situaciones diferentes.
- Diseñar historias especializadas en liderazgo, relaciones, creatividad, propósito, decisiones profesionales o respuesta al cambio.
- Mantener entre doce y veinte momentos por experiencia y una cantidad controlada de imágenes.
- Crear un formato editorial para escribir, revisar, versionar y publicar nuevas aventuras.

### Nuevas capas de análisis

- Ampliar motivaciones, valores, estilos de colaboración o patrones de liderazgo.
- Comparar consistencias y cambios entre varias historias sin convertirlos en contradicciones o fallas.
- Crear un perfil longitudinal que muestre cómo una persona responde en contextos diferentes.
- Incorporar preguntas de reflexión posteriores al resultado sin alterar retroactivamente el test original.
- Explorar instrumentos psicológicos reconocidos únicamente con revisión profesional, consentimiento, fuentes y lenguaje adecuado.

### Personalización

- Generar retratos o escenas de personaje a partir del resultado.
- Adaptar la profundidad del informe según el interés del usuario.
- Recomendar un segundo viaje que explore una dimensión menos visible.
- Permitir guardar reflexiones personales separadas de las respuestas del test.

### Producto y negocio

- Cuentas opcionales para conservar varias experiencias.
- Informes premium o recorridos temáticos.
- Licencias para coaches, equipos o comunidades, con límites éticos claros.
- Panel editorial y sistema de revisión antes de publicar historias.
- Métricas agregadas y anónimas para mejorar opciones confusas o excesivamente atractivas.

## Preguntas estratégicas todavía abiertas

1. ¿Questype será principalmente una experiencia de entretenimiento introspectivo, una herramienta de desarrollo personal o una plataforma de múltiples evaluaciones?
2. ¿Todos los viajes deberían medir los mismos doce arquetipos o cada viaje podría incorporar un modelo diferente?
3. ¿Cómo debería combinarse la información de varios viajes sin dar una falsa impresión de precisión científica?
4. ¿Qué parte del resultado será gratuita y qué valor adicional podría ofrecer una versión premium?
5. ¿Qué nivel de personalización mediante IA mejora la resonancia sin inventar conclusiones no respaldadas?
6. ¿Cómo se validarán nuevas historias antes de publicarlas?
7. ¿Se necesita colaboración formal con profesionales de psicología para la siguiente etapa y para qué componentes concretos?
8. ¿Qué información debería persistir en una futura cuenta y durante cuánto tiempo?
9. ¿Qué métricas demostrarían que una historia es comprensible, equilibrada, emocionalmente resonante y útil?
10. ¿Cómo puede crecer el universo de Questype sin perder la claridad y el carácter íntimo del primer viaje?

## Instrucción inicial sugerida para una nueva conversación con GPT

Puedes adjuntar este archivo y comenzar con el siguiente mensaje:

> Este documento describe el MVP actual de Questype. Trátalo como la fuente de verdad sobre lo que ya está implementado. Quiero explorar cómo expandir el producto con nuevos análisis e historias. Distingue siempre entre estado actual, supuestos y propuestas futuras. Conserva la separación entre cálculo determinista e interpretación, el hilo narrativo lineal, la privacidad por consentimiento y el lenguaje no diagnóstico. Antes de diseñar una solución, identifica qué problema de usuario resolvería, cómo se integraría con el MVP y qué riesgos narrativos, psicológicos, técnicos o comerciales introduciría.

## Nota final de alcance

Questype funciona hoy como un MVP completo de una experiencia narrativa arquetípica. Su siguiente etapa no requiere reemplazar la base construida: requiere decidir qué tipo de plataforma quiere convertirse, cómo validar nuevas formas de análisis y cómo preservar la intimidad de la experiencia mientras crece.
