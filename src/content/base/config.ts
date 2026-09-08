import type { Option } from '../../types/content'

// Grupos de la sección "Base".
// key   -> sub-url a la que se navega (y nombre de la colección en Firestore
//          cuando el grupo va directo al listado de ejercicios)
// value -> texto que se muestra en el botón y en los títulos
export const groups: Option[] = [
  { key: 'pronouns', value: 'Pronombres' },
  { key: 'adverbs', value: 'Adverbios' },
  { key: 'prepositions', value: 'Preposiciones' },
  { key: 'articles', value: 'Artículos' },
  { key: 'question-words', value: 'Question words' },
]

export default groups
