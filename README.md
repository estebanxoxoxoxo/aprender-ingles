# Aprender inglés

App de ejercicios de inglés hecha con Vite + React + TypeScript + React Router + Firebase (Firestore).

## Correr el proyecto

```bash
npm install
npm run dev
```

`npm run typecheck` corre `tsc` solo; `npm run build` chequea tipos y después buildea.

Necesita un `.env` en la raíz con el formato de dotenv (`CLAVE=valor`, sin `:` ni comillas):

```
VITE_API_KEY=...
VITE_AUTH_DOMAIN=...
VITE_PROJECT_ID=...
VITE_STORAGE_BUCKET=...
VITE_MESSAGING_SENDER_ID=...
VITE_APP_ID=...
```

## Navegación

```
/                                       Base | Memoria
/memory                                 (todavía vacío)
/base                                   Pronombres | Adverbios | Preposiciones | Artículos | Question words
/base/articles                          unidades (la sección no tiene subtipos)
/base/articles/1                        ejercicios de la unidad 1
/base/prepositions                      subtipos
/base/prepositions/place-prepositions   unidades
/base/prepositions/place-prepositions/1 ejercicios de la unidad 1
```

## Unidades

Al entrar a un subtipo (o a una sección sin subtipos) se arman **5 unidades** en el
momento. Cada unidad son **3 pasadas sobre todas las palabras**: en cada pasada se
sortea uno de los ejercicios de cada palabra. Entonces una unidad tiene
`3 x cantidad de palabras` ejercicios, y el orden es pasada por pasada, siguiendo el
orden del config.

Cada palabra reparte de un mazo barajado, así que los `5 x 3 = 15` ejercicios que le
tocan salen todos distintos de los 20 que tiene generados. Si una palabra tiene menos
ejercicios que los necesarios, el mazo se recicla. El sorteo se rehace cada vez que se
entra a una unidad.

La lógica vive en `src/services/units.ts` (`buildUnits`, `UNIT_COUNT`,
`PASSES_PER_UNIT`), separada de la lectura de Firestore.

## Tipos

Viven en `src/types/`:

- `exercise.ts`: el tipo `Exercise` (lo que se guarda en Firestore) y `LoadedExercise`
  (el ejercicio más el id del documento).
- `content.ts`: `Option`, `Subtype` y `GroupConfig`, los tipos de los configs de `src/content`.

## Contenido configurable

Cada grupo tiene su carpeta con un `config.ts` en `src/content/`:

```
src/content/base/config.ts            -> los 5 grupos de Base
src/content/pronouns/config.ts
src/content/adverbs/config.ts
src/content/prepositions/config.ts
src/content/articles/config.ts
src/content/questionWords/config.ts
```

Los configs exportan un array de objetos `{ key, value, words }`:

- `key`: la sub-url a la que navega **y** el nombre de la colección en Firestore.
- `value`: el texto que se muestra en el botón y en los títulos.
- `words`: el listado de palabras del grupo/subtipo, para agregar o quitar.

Un grupo con `subtypes: []` (artículos, question words) entra directo al listado de
ejercicios. Para agregar un grupo nuevo: crear su carpeta con `config.ts`, sumarlo a
`src/content/index.ts` y a `src/content/base/config.ts`.

## Ejercicios en Firestore

Todos los ejercicios viven en una sola colección `exercises`, con **un documento por
palabra**:

```
exercises/prepositions__place-prepositions__at
{
  section: 'prepositions',
  subtype: 'place-prepositions',   // null en las secciones sin subtipos
  word: 'at',
  exercises: [ 20 x Exercise ],
  model: 'claude-sonnet-5',   // el que respondió de verdad, no el alias pedido
  generatedAt: '2026-09-08T...'
}
```

El id del documento es `seccion__subtipo__palabra`, con la palabra pasada a slug
(`in front of` -> `in-front-of`). El artículo cero (`-`) queda como `zero`.

La app filtra por `subtype` cuando hay subtipo y por `section` cuando no, así que
alcanza con un `where` y no hace falta índice compuesto.

Cada ejercicio tiene la forma del tipo `Exercise` (`src/types/exercise.ts`):

```json
{
  "word": "at",
  "exerciseNumber": 1,
  "sentence": "She usually arrives [x] the office before 9 a.m.",
  "answer": "at",
  "hint": "a"
}
```

- `word`: la palabra que se practica, una de las del `words` del config.
- `exerciseNumber`: qué número de ejercicio es dentro de los ejercicios de esa `word`.
- `[x]`: marca dónde va el input.
- `hint`: la palabra en español, se usa como placeholder del input.

Las reglas de Firestore tienen que permitir leer `exercises` (y escribir, mientras
corre el generador); si no, la pantalla muestra `Missing or insufficient permissions`.

## Generar ejercicios

`scripts/generate-exercises.ts` genera los ejercicios con Claude Code headless
(`claude -p`, usa la sesión del host) y los sube a Firestore.

```bash
# menú interactivo: elegís sección, subtipo y si escribe o no
npm run gen

# ver las secciones y subtipos disponibles
npm run gen:list

# directo por bandera (dry-run: genera, valida y muestra, sin tocar Firestore)
npm run gen -- --type articles

# una sola palabra, para probar
npm run gen -- --type prepositions --subtype place-prepositions --word at --count 4 --verbose

# escribir de verdad (pide confirmación; --yes la saltea)
npm run gen -- --type articles --write
```

El `.env` de la raíz se carga solo, no hace falta `--env-file`.

Itera las palabras de la sección: si no tiene subtipos usa el `words` del grupo, y si
tiene recorre los `words` de cada subtipo. Una llamada a Claude por palabra.

`--help` lista todas las opciones. Puntos importantes:

- **Sin `--write` no escribe nada**, ni siquiera lee la base.
- Con `--write` pide confirmación por consola salvo que pases `--yes`.
- Saltea las palabras que ya tienen documento; `--overwrite` las regenera.
- Escribe documento por documento, así que se puede cortar y retomar.
- Valida cada ejercicio antes de guardarlo: un solo `[x]`, `answer` igual a la palabra,
  `hint` no vacío y oraciones no repetidas. Lo que no pasa, se descarta y se reporta.

Escala y costo medidos: 545 palabras en total (~10.900 ejercicios), a ~US$0,09 por
llamada con `claude-sonnet-5`, o sea ~US$48 si se genera todo. Conviene ir sección por sección.
