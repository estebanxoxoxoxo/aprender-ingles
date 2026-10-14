import { collection, getDocs, query, where } from 'firebase/firestore'
import type { DocumentData, QueryConstraint } from 'firebase/firestore'
import { db } from '../firebase'
import type { LoadedExercise, WordExercises } from '../types/exercise'

// Todos los ejercicios viven en una sola colección `exercises`, con un documento
// por palabra. Cada documento tiene `section`, `subtype` (null si la sección no
// tiene subtipos), `word` y un array `exercises` con los ejercicios de esa palabra.
export const EXERCISES_COLLECTION = 'exercises'

const UNIT_FIELDS = ['exercises', 'units', 'items'] as const
const SENTENCE_FIELDS = ['sentence', 'text', 'phrase'] as const
const NUMBER_FIELDS = ['exerciseNumber', 'order', 'number'] as const

function firstField(data: DocumentData, fields: readonly string[]): string {
  for (const field of fields) {
    const value = data[field]
    if (typeof value === 'string' && value.length > 0) return value
  }
  return ''
}

function firstNumber(data: DocumentData, fields: readonly string[], fallback: number): number {
  for (const field of fields) {
    if (data[field] == null) continue
    const value = Number(data[field])
    if (Number.isFinite(value)) return value
  }
  return fallback
}

/**
 * @param fallbackNumber Número a usar si el ejercicio no lo trae.
 * @param fallbackWord Palabra del documento, para los ejercicios que no la repiten.
 */
function normalize(
  raw: DocumentData,
  id: string,
  fallbackNumber: number,
  fallbackWord: string,
): LoadedExercise {
  return {
    id,
    word: typeof raw.word === 'string' ? raw.word : fallbackWord,
    exerciseNumber: firstNumber(raw, NUMBER_FIELDS, fallbackNumber),
    sentence: firstField(raw, SENTENCE_FIELDS),
    answer: raw.answer ?? '',
    hint: raw.hint ?? '',
  }
}

export interface ExercisesQuery {
  /** Key de la sección: `articles`, `prepositions`... */
  section: string
  /** Key del subtipo: `place-prepositions`... Null en las secciones sin subtipos. */
  subtype?: string | null
}

/**
 * Trae los ejercicios de una sección o de un subtipo, agrupados por palabra.
 * Una lectura por palabra; con eso alcanza para armar las 5 unidades en memoria.
 */
export async function fetchWordExercises({
  section,
  subtype,
}: ExercisesQuery): Promise<WordExercises[]> {
  const constraint: QueryConstraint = subtype
    ? where('subtype', '==', subtype)
    : where('section', '==', section)
  const snapshot = await getDocs(query(collection(db, EXERCISES_COLLECTION), constraint))
  const words: WordExercises[] = []

  snapshot.forEach((document) => {
    const data = document.data()
    const word = typeof data.word === 'string' ? data.word : ''
    const unitField = UNIT_FIELDS.find((field) => Array.isArray(data[field]))
    const exercises: LoadedExercise[] = []

    if (unitField) {
      const raw = data[unitField] as DocumentData[]
      raw.forEach((exercise, index) => {
        exercises.push(normalize(exercise, `${document.id}-${index}`, index + 1, word))
      })
    } else {
      exercises.push(normalize(data, document.id, 1, word))
    }

    const valid = exercises.filter((exercise) => exercise.sentence)
    if (valid.length > 0) words.push({ word, exercises: valid })
  })

  return words
}
