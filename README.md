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
/                          Base | Memoria
/memory                    (todavía vacío)
/base                      Pronombres | Adverbios | Preposiciones | Artículos | Question words
/base/articles             listado de ejercicios (directo)
/base/question-words       listado de ejercicios (directo)
/base/pronouns             subtipos -> /base/pronouns/personal-pronouns -> ejercicios
/base/adverbs              subtipos -> /base/adverbs/manner-adverbs -> ejercicios
/base/prepositions         subtipos -> /base/prepositions/place-prepositions -> ejercicios
```

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

Los ejercicios se leen de la colección que lleva el `key` del grupo o subtipo
(`articles`, `question-words`, `personal-pronouns`, `manner-adverbs`, ...).

Se aceptan dos formas de guardar los datos (ver `src/services/exercises.ts`):

1. Cada documento de la colección es una unidad con un array de 20 ejercicios en el
   campo `units`, `exercises` o `items`.
2. Cada documento de la colección es un ejercicio suelto.

Cada ejercicio tiene la forma del tipo `Exercise` (`src/types/exercise.ts`):

```json
{
  "word": "an",
  "exerciseNumber": 1,
  "sentence": "I bought [x] apple this morning.",
  "answer": "an",
  "hint": "un/una"
}
```

- `word`: la palabra que se practica, una de las del `words` del config.
- `exerciseNumber`: qué número de ejercicio es dentro de los ejercicios de esa `word`.
- `[x]`: marca dónde va el input.
- `hint`: la palabra en español, se usa como placeholder del input.

Las reglas de Firestore tienen que permitir la lectura de esas colecciones; si no, la
pantalla muestra `Missing or insufficient permissions`.
