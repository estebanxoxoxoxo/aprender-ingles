import { useEffect, useState } from 'react'
import { fetchWordExercises } from '../services/exercises'
import { UNIT_COUNT, buildUnits } from '../services/units'
import type { Unit } from '../types/exercise'
import ExerciseList from './ExerciseList'

type Status = 'loading' | 'ready' | 'error'

interface UnitExercisesProps {
  /** Key de la sección: `articles`, `prepositions`... */
  section: string
  /** Key del subtipo, si la sección tiene. */
  subtype?: string | null
  /** Número de unidad, de 1 a UNIT_COUNT. */
  unitNumber: number
}

export default function UnitExercises({
  section,
  subtype = null,
  unitNumber,
}: UnitExercisesProps) {
  const [unit, setUnit] = useState<Unit | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setStatus('loading')

    fetchWordExercises({ section, subtype })
      .then((words) => {
        if (!active) return
        // Las unidades se sortean de nuevo cada vez que se entra.
        setUnit(buildUnits(words)[unitNumber - 1] ?? null)
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
  }, [section, subtype, unitNumber])

  if (unitNumber < 1 || unitNumber > UNIT_COUNT) {
    return <p className="message">La unidad {unitNumber} no existe.</p>
  }

  if (status === 'loading') {
    return <p className="message">Armando la unidad…</p>
  }

  if (status === 'error') {
    return <p className="message message-error">No se pudieron cargar los ejercicios: {error}</p>
  }

  if (!unit || unit.exercises.length === 0) {
    return (
      <p className="message">
        Todavía no hay ejercicios para <code>{subtype ?? section}</code>.
      </p>
    )
  }

  return <ExerciseList exercises={unit.exercises} />
}
