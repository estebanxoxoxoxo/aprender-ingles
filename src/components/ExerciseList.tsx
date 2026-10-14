import { useState } from 'react'
import type { LoadedExercise } from '../types/exercise'
import ExerciseItem, { isCorrect } from './ExerciseItem'

/** Lo que escribió el usuario, por posición en la lista y por hueco `[x]`. */
type Values = Record<number, string[]>

interface ExerciseListProps {
  exercises: LoadedExercise[]
}

export default function ExerciseList({ exercises }: ExerciseListProps) {
  const [values, setValues] = useState<Values>({})
  const [checked, setChecked] = useState(false)

  function handleChange(position: number, blankIndex: number, value: string) {
    setValues((previous) => {
      const next = [...(previous[position] ?? [])]
      next[blankIndex] = value
      return { ...previous, [position]: next }
    })
  }

  // La misma palabra aparece varias veces en una unidad, así que el estado va por
  // posición y no por id de ejercicio.
  const score = exercises.filter((exercise, position) =>
    isCorrect(exercise, values[position] ?? []),
  ).length

  return (
    <>
      <ol className="exercise-list">
        {exercises.map((exercise, position) => (
          <ExerciseItem
            key={`${exercise.id}-${position}`}
            number={position + 1}
            exercise={exercise}
            values={values[position] ?? []}
            checked={checked}
            onChange={(blankIndex, value) => handleChange(position, blankIndex, value)}
          />
        ))}
      </ol>

      <div className="actions">
        <button type="button" className="button" onClick={() => setChecked(true)}>
          Corregir
        </button>
        <button
          type="button"
          className="button button-ghost"
          onClick={() => {
            setValues({})
            setChecked(false)
          }}
        >
          Reiniciar
        </button>
        {checked ? (
          <span className="score">
            {score} / {exercises.length}
          </span>
        ) : null}
      </div>
    </>
  )
}
