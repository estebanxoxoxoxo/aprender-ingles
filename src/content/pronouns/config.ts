import type { GroupConfig, Subtype } from '../../types/content'

// Pronombres: tiene subtipos, desde /base/pronouns se muestra la grilla de subtipos.
// key   -> sub-url y nombre de la colección en Firestore
// value -> texto del botón y de los títulos
// words -> listado de palabras del subtipo (para agregar o quitar libremente)
export const key = 'pronouns'
export const value = 'Pronombres'

export const subtypes: Subtype[] = [
  {
    key: 'personal-pronouns',
    value: 'Personales',
    words: ['I', 'you', 'he', 'she', 'it', 'we', 'they'],
  },
  {
    key: 'object-pronouns',
    value: 'Objeto',
    words: ['me', 'you', 'him', 'her', 'it', 'us', 'them'],
  },
  {
    key: 'possessive-pronouns',
    value: 'Posesivos',
    words: ['mine', 'yours', 'his', 'hers', 'ours', 'theirs'],
  },
  {
    key: 'reflexive-pronouns',
    value: 'Reflexivos',
    words: [
      'myself',
      'yourself',
      'himself',
      'herself',
      'itself',
      'ourselves',
      'yourselves',
      'themselves',
    ],
  },
  {
    key: 'demonstrative-pronouns',
    value: 'Demostrativos',
    words: ['this', 'that', 'these', 'those'],
  },
  {
    key: 'interrogative-pronouns',
    value: 'Interrogativos',
    words: ['who', 'whom', 'whose', 'what', 'which'],
  },
  {
    key: 'relative-pronouns',
    value: 'Relativos',
    words: ['who', 'whom', 'whose', 'which', 'that'],
  },
  {
    key: 'indefinite-pronouns',
    value: 'Indefinidos',
    words: [
      'someone',
      'somebody',
      'something',
      'anyone',
      'anybody',
      'anything',
      'everyone',
      'everybody',
      'everything',
      'no one',
      'nobody',
      'nothing',
    ],
  },
  {
    key: 'reciprocal-pronouns',
    value: 'Recíprocos',
    words: ['each other', 'one another'],
  },
  {
    key: 'distributive-pronouns',
    value: 'Distributivos',
    words: ['each', 'either', 'neither'],
  },
  {
    key: 'emphatic-pronouns',
    value: 'Enfáticos',
    words: [
      'myself',
      'yourself',
      'himself',
      'herself',
      'itself',
      'ourselves',
      'yourselves',
      'themselves',
    ],
  },
  {
    key: 'dummy-pronouns',
    value: 'Sin referente',
    words: ['it', 'there'],
  },
]

const group: GroupConfig = { key, value, subtypes }

export default group
