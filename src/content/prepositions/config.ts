import type { GroupConfig, Subtype } from '../../types/content'

// Preposiciones: tiene subtipos, desde /base/prepositions se muestra la grilla de subtipos.
// key   -> sub-url y nombre de la colección en Firestore
// value -> texto del botón y de los títulos
// words -> listado de palabras del subtipo (para agregar o quitar libremente)
export const key = 'prepositions'
export const value = 'Preposiciones'

export const subtypes: Subtype[] = [
  {
    key: 'place-prepositions',
    value: 'Lugar',
    words: [
      'at', 'in', 'on', 'under', 'below', 'above', 'over', 'beneath', 'beside',
      'next to', 'near', 'by', 'between', 'among', 'behind', 'in front of',
      'opposite', 'inside', 'outside', 'around', 'against', 'along',
    ],
  },
  {
    key: 'time-prepositions',
    value: 'Tiempo',
    words: [
      'at', 'on', 'in', 'before', 'after', 'during', 'for', 'since', 'until',
      'till', 'by', 'from', 'to',
    ],
  },
  {
    key: 'movement-prepositions',
    value: 'Movimiento',
    words: [
      'to', 'from', 'into', 'out of', 'onto', 'off', 'toward', 'towards',
      'through', 'across', 'along', 'past', 'around', 'up', 'down', 'over',
      'under',
    ],
  },
  {
    key: 'transport-prepositions',
    value: 'Transporte',
    words: ['by', 'on', 'in'],
  },
  {
    key: 'company-prepositions',
    value: 'Compañía',
    words: ['with', 'without', 'besides'],
  },
  {
    key: 'cause-prepositions',
    value: 'Causa',
    words: ['because of', 'due to', 'thanks to', 'from', 'through'],
  },
  {
    key: 'purpose-prepositions',
    value: 'Propósito',
    words: ['for', 'for the purpose of'],
  },
  {
    key: 'possession-prepositions',
    value: 'Posesión',
    words: ['of', 'with', 'without'],
  },
  {
    key: 'topic-prepositions',
    value: 'Tema',
    words: ['about', 'on', 'regarding', 'concerning', 'as for', 'as to'],
  },
  {
    key: 'opposition-prepositions',
    value: 'Oposición',
    words: ['against', 'versus', 'despite', 'in spite of'],
  },
  {
    key: 'exception-prepositions',
    value: 'Excepción',
    words: ['except', 'except for', 'apart from', 'besides'],
  },
  {
    key: 'comparison-prepositions',
    value: 'Comparación',
    words: ['like', 'unlike', 'as', 'than'],
  },
  {
    key: 'origin-prepositions',
    value: 'Origen',
    words: ['from', 'of', 'by'],
  },
  {
    key: 'agent-prepositions',
    value: 'Agente',
    words: ['by'],
  },
  {
    key: 'instrument-prepositions',
    value: 'Instrumento',
    words: ['with', 'by', 'via'],
  },
  {
    key: 'state-prepositions',
    value: 'Estado',
    words: ['in', 'under', 'at', 'on', 'without', 'with'],
  },
  {
    key: 'quantity-prepositions',
    value: 'Cantidad',
    words: ['by', 'per', 'at', 'of', 'for'],
  },
  {
    key: 'compound-prepositions',
    value: 'Compuestas',
    words: [
      'according to', 'because of', 'due to', 'instead of', 'in front of',
      'next to', 'out of', 'on top of', 'in addition to', 'in spite of',
      'apart from', 'close to', 'far from', 'away from', 'along with',
      'together with', 'thanks to', 'as well as', 'by means of',
      'in accordance with', 'with regard to', 'with respect to',
      'in relation to',
    ],
  },
]

const group: GroupConfig = { key, value, subtypes }

export default group
