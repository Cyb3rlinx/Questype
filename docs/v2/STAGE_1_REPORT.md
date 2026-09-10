# Questype V2 — reporte de Etapa 1

**Estado:** completada en local

**Alcance:** blindaje del comportamiento V1

**Deploy:** ninguno

## Qué se agregó

### Fixtures dorados

`tests/golden/v1-results.json` congela 14 recorridos completos:

- un camino testigo para cada uno de los 12 arquetipos dominantes;
- un empate primario entre tres arquetipos;
- un resultado con evidencia de sombra limitada.

Cada caso conserva las 15 elecciones y comprueba:

- dominante, secundario, terciario y empates;
- los 12 porcentajes visibles;
- sombra, evidencia y eje dominante;
- título de personaje y motivación dominante;
- hash canónico del perfil estructurado completo;
- hash canónico de interpretación, informe y share en inglés y español.

El hash canónico ordena recursivamente las claves antes de aplicar SHA-256. De esta manera, congela el significado serializado sin depender del orden accidental de propiedades.

### Generador revisable

`npm run fixtures:v1:update` regenera el archivo desde el contenido actual y los caminos testigo del reporte de balance. Este comando no debe ejecutarse para hacer pasar una regresión. Si un cambio intencional modifica V1, el diff del fixture requiere revisión explícita.

### Gate local completo

`npm run check:full` ejecuta en orden:

1. tipos, pruebas, contenido y build de dominio;
2. migraciones D1 locales;
3. servidor local temporal, cuando no existe uno;
4. recorrido web integral, PDF y sharing;
5. cierre del servidor creado por el propio gate.

Si ya existe un servidor en `TEST_APP_URL`, lo reutiliza y no intenta finalizar un proceso ajeno.

## Validación

| Control | Resultado |
|---|---|
| Pruebas totales | 57 aprobadas |
| Fixtures dorados | 14/14 aprobados |
| Arquetipos alcanzables cubiertos | 12/12 |
| Locales congelados | EN y ES |
| D1 local | Sin migraciones pendientes |
| Web smoke | 16/16 comprobaciones aprobadas |
| PDF | Generación aprobada; muestra de cinco páginas producida |
| Content hash | `116ab299e56b8ff5ac00d123794521bf320852c4efaaf3814db2955429a9601e` |

## Qué protege

La suite detectará que un refactor multi-Journey alteró scoring, ranking, presentación, sombra, títulos, copy bilingüe, datos de PDF o proyección pública. También conserva las pruebas existentes de privacidad, ownership, concurrencia, reanudación, borrado y revocación de shares.

## Límite consciente

Los hashes EN/ES congelan el contenido y contrato de PDF/share, mientras el web smoke verifica que el PDF se genera. La comparación píxel por píxel se reserva para el gate visual de las etapas de exportación porque el binario PDF incluye metadata no determinista y el Canvas depende del navegador y las fuentes renderizadas.

## Próximo gate

La Etapa 2 puede comenzar con el registro multi-Journey, manifiesto visual, rutas compatibles y migración D1 `0001`. Su condición de aceptación es que `npm run check:full` continúe aprobando estos mismos resultados V1.
