import type { GroupConfig, Subtype } from '../../types/content'

// Question words: no tiene subtipos, entra directo al listado de ejercicios.
// key -> sub-url y nombre de la colección en Firestore
export const key = 'question-words'
export const value = 'Question words'

// Sin subtipos: desde /base/question-words se va directo a los ejercicios.
export const subtypes: Subtype[] = []

export const simple = [
  'what',
  'who',
  'whom',
  'whose',
  'which',
  'where',
  'when',
  'why',
  'how',
]

export const howPhrases = [
  'how much',
  'how many',
  'how often',
  'how long',
  'how far',
  'how old',
  'how tall',
  'how high',
  'how big',
  'how fast',
  'how soon',
  'how well',
  'how quickly',
  'how late',
]

export const whatPhrases = [
  'what time',
  'what day',
  'what date',
  'what kind of',
  'what type of',
  'what color',
  'what size',
  'what for',
]

export const words = [...simple, ...howPhrases, ...whatPhrases]

const group: GroupConfig = { key, value, subtypes }

export default group
