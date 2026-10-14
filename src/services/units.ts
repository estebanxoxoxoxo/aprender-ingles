import type { LoadedExercise, Unit, WordExercises } from '../types/exercise'

/** Cuántas unidades se arman cada vez que se entra a un subtipo. */
export const UNIT_COUNT = 5

/** Cuántas veces aparece cada palabra dentro de una unidad. */
export const PASSES_PER_UNIT = 3

/** Cuántos ejercicios tiene una unidad de un subtipo con esa cantidad de palabras. */
export function exercisesPerUnit(wordCount: number): number {
  return wordCount * PASSES_PER_UNIT
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[other]] = [copy[other], copy[index]]
  }
  return copy
}

/**
 * Arma las unidades sorteando ejercicios.
 *
 * Cada palabra baraja sus ejercicios una sola vez y después reparte de ese mazo,
 * así los `UNIT_COUNT * PASSES_PER_UNIT` que le tocan salen todos distintos
 * (con 20 ejercicios generados por palabra y 15 repartidos, entran justo).
 * Si una palabra tiene menos ejercicios que los que necesita, el mazo se recicla.
 *
 * Dentro de una unidad el orden es pasada por pasada: todas las palabras, y de
 * nuevo todas las palabras, hasta completar las pasadas.
 */
export function buildUnits(words: WordExercises[]): Unit[] {
  const decks = words.map((entry) => shuffle(entry.exercises))

  return Array.from({ length: UNIT_COUNT }, (_, unitIndex) => {
    const exercises: LoadedExercise[] = []

    for (let pass = 0; pass < PASSES_PER_UNIT; pass += 1) {
      decks.forEach((deck) => {
        if (deck.length === 0) return
        exercises.push(deck[(unitIndex * PASSES_PER_UNIT + pass) % deck.length])
      })
    }

    return { number: unitIndex + 1, exercises }
  })
}
