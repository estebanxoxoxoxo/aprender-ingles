import type { Exercise } from '../types/exercise'

const BLANK = /\[x\]/gi

export function normalizeAnswer(value: string | undefined): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

export function answersFor(exercise: Exercise): string[] {
  return Array.isArray(exercise.answer) ? exercise.answer : [exercise.answer]
}

export function hintsFor(exercise: Exercise): string[] {
  return Array.isArray(exercise.hint) ? exercise.hint : [exercise.hint]
}

export function blankCount(exercise: Exercise): number {
  const matches = exercise.sentence.match(BLANK)
  return matches ? matches.length : 1
}

/** @param values Lo que escribió el usuario, un valor por `[x]`. */
export function isCorrect(exercise: Exercise, values: string[] = []): boolean {
  const answers = answersFor(exercise)
  return Array.from({ length: blankCount(exercise) }).every((_, index) => {
    const expected = answers[index] ?? answers[0]
    return normalizeAnswer(values[index]) === normalizeAnswer(expected)
  })
}

interface ExerciseItemProps {
  /** Posición del ejercicio en el listado que se muestra. */
  number: number
  exercise: Exercise
  values: string[]
  onChange: (blankIndex: number, value: string) => void
  checked: boolean
}

export default function ExerciseItem({
  number,
  exercise,
  values,
  onChange,
  checked,
}: ExerciseItemProps) {
  const parts = exercise.sentence.split(BLANK)
  const hints = hintsFor(exercise)
  const answers = answersFor(exercise)
  const correct = checked ? isCorrect(exercise, values) : null

  // Si la oración no trae [x], el input va al final.
  const segments = parts.length > 1 ? parts : [parts[0], '']

  const stateClass = correct === null ? '' : correct ? ' is-correct' : ' is-wrong'

  return (
    <li className={`exercise${stateClass}`}>
      <span className="exercise-number">{number}</span>
      <p className="exercise-sentence">
        {segments.map((segment, index) => (
          <span key={index}>
            <span>{segment}</span>
            {index < segments.length - 1 ? (
              <input
                className="blank"
                type="text"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
                placeholder={hints[index] ?? hints[0] ?? ''}
                value={values[index] ?? ''}
                onChange={(event) => onChange(index, event.target.value)}
              />
            ) : null}
          </span>
        ))}
      </p>
      {checked && correct === false ? (
        <p className="exercise-answer">{answers.filter(Boolean).join(' / ')}</p>
      ) : null}
    </li>
  )
}
