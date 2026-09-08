import { useEffect, useState } from 'react'
import { fetchExercises } from '../services/exercises'
import type { LoadedExercise } from '../types/exercise'
import ExerciseItem, { isCorrect } from './ExerciseItem'

type Status = 'loading' | 'ready' | 'error'

/** Lo que escribió el usuario, por id de ejercicio y por hueco `[x]`. */
type Values = Record<string, string[]>

interface ExerciseListProps {
  /** Colección de Firestore de la que se leen los ejercicios. */
  collectionKey: string
}

export default function ExerciseList({ collectionKey }: ExerciseListProps) {
  const [exercises, setExercises] = useState<LoadedExercise[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const [values, setValues] = useState<Values>({})
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let active = true
    setStatus('loading')
    setValues({})
    setChecked(false)

    fetchExercises(collectionKey)
      .then((data) => {
        if (!active) return
        setExercises(data)
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (!active) return
        setError(err instanceof Error ? err.message : String(err))
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [collectionKey])

  function handleChange(exerciseId: string, blankIndex: number, value: string) {
    setValues((previous) => {
      const next = [...(previous[exerciseId] ?? [])]
      next[blankIndex] = value
      return { ...previous, [exerciseId]: next }
    })
  }

  if (status === 'loading') {
    return <p className="message">Cargando ejercicios…</p>
  }

  if (status === 'error') {
    return <p className="message message-error">No se pudieron cargar los ejercicios: {error}</p>
  }

  if (exercises.length === 0) {
    return (
      <p className="message">
        Todavía no hay ejercicios en la colección <code>{collectionKey}</code>.
      </p>
    )
  }

  const score = exercises.filter((exercise) => isCorrect(exercise, values[exercise.id] ?? [])).length

  return (
    <>
      <ol className="exercise-list">
        {exercises.map((exercise, index) => (
          <ExerciseItem
            key={exercise.id}
            number={index + 1}
            exercise={exercise}
            values={values[exercise.id] ?? []}
            checked={checked}
            onChange={(blankIndex, value) => handleChange(exercise.id, blankIndex, value)}
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
