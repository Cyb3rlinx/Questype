# Questype V1 — línea base congelada

**Estado:** referencia funcional de producción
**Commit observado:** `e836b52e1120819612ff7a75fc09edba36c91ccf`
**Rama de auditoría:** `codex/questype-v2`
**Fecha:** 2026-09-10

Este documento fija el comportamiento que V2 debe preservar. No redefine el producto ni autoriza cambios de producción.

## Producto visible

- Marca bilingüe Questype, con selector español/inglés persistente.
- Journey gratuito **The Unwritten Road / El Camino No Escrito**.
- Selección inicial de presentación visual masculina o femenina.
- Historia lineal de 15 momentos. Cada decisión cambia el análisis, pero no abre ramas narrativas.
- Resultado con un arquetipo dominante y, cuando corresponde, uno secundario.
- Constelación de 12 arquetipos, lectura personalizada, sombra, motivaciones, aportes y siguientes pasos.
- Informe personal PDF en el idioma activo.
- Tarjetas descargables y enlace público revocable.
- Repetición del Journey y borrado local de los datos del visitante.

## Contrato narrativo

El Journey mantiene un único hilo: carta y mapa, estación abandonada, campana, mercado nocturno, encuentro con Mara, puente, caravana, costa, objetos, guardián, faro, flautista y despertar. Las respuestas registran cómo interpreta o enfrenta el usuario cada momento; el orden y las escenas siguientes son iguales para todos.

La única variación visual acotada ocurre alrededor del objeto elegido en el momento 10. Esa elección selecciona una de cuatro imágenes y puede persistir en el momento siguiente, pero no crea una misión lateral.

## Contrato de puntuación

- 12 arquetipos registrados.
- 36 ejes puntuables: 12 afinidades arquetípicas, 6 motivaciones, 6 estilos de decisión, 6 sombras y 6 rasgos.
- Pesos enteros pequeños almacenados exclusivamente en servidor.
- Calibración por oportunidad: compara el resultado con la línea base uniforme del contenido mediante puntuaciones estandarizadas.
- Orden determinista con precedencia canónica para empates.
- La sombra se calcula de forma separada y exige evidencia repetida.
- La evidencia interna conserva proporciones blandas; la UI presenta una distribución editorial de 100% con dominante entre 45–55%, secundario entre 22–28% y el residuo entre los otros diez.

La distribución editorial no es una medida clínica, probabilidad ni percentil. No debe entrar como dato base del perfil acumulativo V2.

## Contrato de datos y privacidad

- El visitante recibe un token aleatorio de alta entropía en una cookie `HttpOnly`; D1 conserva solo su hash SHA-256.
- Las respuestas, sesión, resultado y proyección pública viven en D1.
- Las respuestas y los pesos de puntuación no se exponen al cliente.
- Las respuestas API son privadas y `no-store`.
- Un visitante solo puede leer y modificar sus sesiones y resultados.
- Una proyección pública contiene una lista explícita de campos seguros, puede revocarse y no incluye respuestas crudas.
- No existen cuentas, pagos ni analytics de producto en V1.

## Contrato de rutas

| Ruta | Función actual |
|---|---|
| `/` | Landing y selector de idioma |
| `/start` | Onboarding y presentación visual |
| `/journey` | Reproducción del Journey lineal |
| `/processing` | Transición al resultado |
| `/result/[id]` | Resultado privado, PDF y compartir |
| `/share/[id]` | Resultado público limitado |
| `/privacy` | Política de privacidad |
| `/api/session` | Crear, recuperar y eliminar sesión |
| `/api/session/answer` | Guardar una respuesta con control de revisión |
| `/api/session/complete` | Completar y puntuar en servidor |
| `/api/results/[id]` | Obtener resultado privado |
| `/api/results/[id]/report` | Datos autorizados para PDF |
| `/api/results/[id]/share` | Crear, consultar o revocar una proyección pública |

## Contrato visual

- Escenas narrativas: 16:9, fotografía fantástica cinematográfica y realista.
- Retratos de arquetipo: formato vertical, versión masculina y femenina para cada uno de los 12 arquetipos.
- UI: verde profundo, marfil, oro cálido, tipografía editorial y superficies translúcidas.
- El texto bilingüe vive en HTML/CSS o en la capa de composición del PDF/tarjeta, no debe quedar horneado en las imágenes base.

## Línea base verificable

| Verificación | Resultado 2026-09-10 |
|---|---|
| `npm run check` | 42 pruebas, tipos, validación de contenido y build de dominio aprobados |
| `npm run test:web` | 16 comprobaciones integrales aprobadas |
| Hash de contenido | `116ab299e56b8ff5ac00d123794521bf320852c4efaaf3814db2955429a9601e` |
| Simulación de balance | 20.000 recorridos, 12 arquetipos alcanzables, 0 advertencias |
| PDF de referencia | 5 páginas A4, legible, sin recortes ni solapamientos visibles |

## Reglas de compatibilidad para V2

1. The Unwritten Road sigue siendo completo y gratuito.
2. Los resultados V1 ya creados no se recalculan silenciosamente.
3. Las URL antiguas reciben redirecciones compatibles hacia el Journey V1.
4. Los IDs de sesión, respuesta, resultado y share mantienen su semántica.
5. El idioma elegido gobierna UI, resultado, PDF y tarjeta compartida.
6. La historia sigue siendo lineal; las decisiones aportan evidencia psicológica sin multiplicar escenas.
7. La puntuación permanece en servidor.
8. La nueva capa de perfil guarda su propia versión y sus fuentes.
9. La migración es aditiva y reversible antes de retirar tablas o campos antiguos.
10. Ninguna imagen rasterizada nueva puede contener texto legible en español, inglés u otro idioma real.
