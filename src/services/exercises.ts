import { collection, getDocs } from 'firebase/firestore'
import type { DocumentData } from 'firebase/firestore'
import { db } from '../firebase'
import type { LoadedExercise } from '../types/exercise'

// Los ejercicios se leen de la colección que lleva el `key` del grupo o del
// subtipo (por ejemplo `articles`, `question-words`, `personal-pronouns`).
//
// Se aceptan dos formas de guardar los datos en Firestore:
//   1. Cada documento de la colección es una unidad con un array de ejercicios
//      en el campo `units`, `exercises` o `items` (20 ejercicios por unidad).
//   2. Cada documento de la colección es un ejercicio suelto.
const UNIT_FIELDS = ['units', 'exercises', 'items'] as const
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

/** @param fallbackNumber Número a usar si el ejercicio no lo trae. */
function normalize(raw: DocumentData, id: string, fallbackNumber: number): LoadedExercise {
  return {
    id,
    word: typeof raw.word === 'string' ? raw.word : '',
    exerciseNumber: firstNumber(raw, NUMBER_FIELDS, fallbackNumber),
    sentence: firstField(raw, SENTENCE_FIELDS),
    answer: raw.answer ?? '',
    hint: raw.hint ?? '',
  }
}

/** Devuelve los ejercicios de una colección, ya normalizados. */
export async function fetchExercises(collectionKey: string): Promise<LoadedExercise[]> {
  const snapshot = await getDocs(collection(db, collectionKey))
  const exercises: LoadedExercise[] = []

  snapshot.forEach((document) => {
    const data = document.data()
    const unitField = UNIT_FIELDS.find((field) => Array.isArray(data[field]))

    if (unitField) {
      const unit = data[unitField] as DocumentData[]
      unit.forEach((exercise, index) => {
        exercises.push(normalize(exercise, `${document.id}-${index}`, index + 1))
      })
      return
    }

    exercises.push(normalize(data, document.id, exercises.length + 1))
  })

  return exercises.filter((exercise) => exercise.sentence)
}
