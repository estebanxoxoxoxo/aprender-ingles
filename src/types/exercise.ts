/** Un ejercicio, tal como se guarda en Firestore. */
export interface Exercise {
  /**
   * Palabra que practica el ejercicio: 'an', 'the', 'myself', 'in front of'...
   * Es una de las palabras del `words` del config del grupo o subtipo.
   */
  word: string
  /**
   * Número del ejercicio dentro de los ejercicios de esa `word` (1, 2, 3...).
   * Ordena los ejercicios de una misma palabra; no es la posición en el listado.
   */
  exerciseNumber: number
  /** La oración, con `[x]` marcando el lugar donde va el input. */
  sentence: string
  /** La respuesta correcta. Array sólo si la oración tiene más de un `[x]`. */
  answer: string | string[]
  /**
   * La pista en español: la palabra exacta que hay que poner, no la explicación.
   * Se usa como placeholder del input.
   */
  hint: string | string[]
}

/**
 * Un ejercicio ya cargado en la app: el ejercicio más el id del documento de
 * Firestore del que salió, que se usa como key de React.
 */
export interface LoadedExercise extends Exercise {
  id: string
}
