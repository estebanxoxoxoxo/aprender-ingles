import type { GroupConfig, Subtype } from '../../types/content'

// Adverbios: tiene subtipos, desde /base/adverbs se muestra la grilla de subtipos.
// key   -> sub-url y nombre de la colección en Firestore
// value -> texto del botón y de los títulos
// words -> listado de palabras del subtipo (para agregar o quitar libremente)
export const key = 'adverbs'
export const value = 'Adverbios'

export const subtypes: Subtype[] = [
  {
    key: 'manner-adverbs',
    value: 'Modo',
    words: [
      'well', 'badly', 'quickly', 'slowly', 'carefully', 'easily', 'happily',
      'sadly', 'quietly', 'loudly', 'clearly', 'correctly', 'incorrectly',
      'seriously', 'suddenly', 'finally', 'probably', 'simply', 'normally',
      'naturally', 'usually', 'especially', 'together', 'alone', 'hard', 'fast',
      'safely', 'perfectly', 'completely', 'directly', 'differently',
      'successfully', 'effectively', 'exactly',
    ],
  },
  {
    key: 'place-adverbs',
    value: 'Lugar',
    words: [
      'here', 'there', 'everywhere', 'somewhere', 'anywhere', 'nowhere',
      'inside', 'outside', 'upstairs', 'downstairs', 'abroad', 'nearby', 'away',
      'back', 'around', 'above', 'below', 'behind', 'ahead', 'forward',
      'backward', 'home', 'indoors', 'outdoors',
    ],
  },
  {
    key: 'time-adverbs',
    value: 'Tiempo',
    words: [
      'now', 'then', 'today', 'yesterday', 'tomorrow', 'tonight', 'soon',
      'later', 'early', 'late', 'already', 'still', 'yet', 'just', 'recently',
      'lately', 'immediately', 'finally', 'eventually', 'currently', 'nowadays',
      'before', 'after', 'afterwards', 'previously', 'originally', 'meanwhile',
      'suddenly', 'forever',
    ],
  },
  {
    key: 'frequency-adverbs',
    value: 'Frecuencia',
    words: [
      'always', 'usually', 'normally', 'generally', 'often', 'frequently',
      'sometimes', 'occasionally', 'rarely', 'seldom', 'hardly ever', 'never',
      'regularly', 'constantly', 'continually', 'repeatedly', 'daily', 'weekly',
      'monthly', 'yearly', 'once', 'twice', 'again',
    ],
  },
  {
    key: 'degree-adverbs',
    value: 'Grado',
    words: [
      'very', 'really', 'quite', 'pretty', 'rather', 'fairly', 'too', 'so',
      'enough', 'extremely', 'absolutely', 'completely', 'totally', 'almost',
      'nearly', 'hardly', 'barely', 'slightly', 'highly', 'deeply', 'fully',
      'entirely', 'particularly', 'especially', 'incredibly', 'seriously',
      'terribly', 'awfully',
    ],
  },
  {
    key: 'certainty-adverbs',
    value: 'Certeza',
    words: [
      'definitely', 'certainly', 'probably', 'surely', 'clearly', 'obviously',
      'maybe', 'perhaps', 'possibly', 'apparently', 'presumably', 'undoubtedly',
      'likely',
    ],
  },
  {
    key: 'focus-adverbs',
    value: 'Enfoque',
    words: [
      'only', 'just', 'even', 'also', 'mainly', 'mostly', 'especially',
      'particularly', 'simply', 'merely', 'exactly', 'specifically', 'largely',
    ],
  },
  {
    key: 'connective-adverbs',
    value: 'Conectores',
    words: [
      'also', 'furthermore', 'moreover', 'additionally', 'besides', 'likewise',
      'however', 'nevertheless', 'nonetheless', 'instead', 'otherwise',
      'alternatively', 'therefore', 'consequently', 'thus', 'accordingly',
      'hence', 'then', 'next', 'meanwhile', 'finally', 'subsequently',
      'eventually',
    ],
  },
  {
    key: 'interrogative-adverbs',
    value: 'Interrogativos',
    words: [
      'how', 'when', 'where', 'why', 'how much', 'how many', 'how often',
      'how long', 'how far', 'how old', 'how fast', 'how well', 'how soon',
      'how late', 'how early', 'how big', 'how high',
    ],
  },
  {
    key: 'relative-adverbs',
    value: 'Relativos',
    words: ['where', 'when', 'why'],
  },
  {
    key: 'negative-adverbs',
    value: 'Negación',
    words: [
      'never', 'hardly', 'barely', 'scarcely', 'rarely', 'seldom', 'nowhere',
      'neither', 'little',
    ],
  },
  {
    key: 'approximation-adverbs',
    value: 'Aproximación',
    words: [
      'about', 'approximately', 'around', 'roughly', 'nearly', 'almost',
      'virtually', 'practically', 'more or less',
    ],
  },
  {
    key: 'comparison-adverbs',
    value: 'Comparación',
    words: [
      'more', 'less', 'better', 'worse', 'equally', 'similarly', 'likewise',
      'comparatively', 'relatively',
    ],
  },
  {
    key: 'attitude-adverbs',
    value: 'Actitud',
    words: [
      'honestly', 'personally', 'seriously', 'frankly', 'fortunately',
      'unfortunately', 'luckily', 'surprisingly', 'obviously', 'clearly',
      'apparently', 'naturally', 'sadly', 'strangely',
    ],
  },
  {
    key: 'order-adverbs',
    value: 'Orden',
    words: [
      'first', 'firstly', 'second', 'secondly', 'next', 'then', 'afterwards',
      'later', 'finally', 'lastly', 'eventually', 'subsequently',
    ],
  },
  {
    key: 'direction-adverbs',
    value: 'Dirección',
    words: [
      'up', 'down', 'in', 'out', 'away', 'back', 'forward', 'backwards',
      'around', 'ahead', 'home', 'abroad', 'upwards', 'downwards',
    ],
  },
  {
    key: 'emphasis-adverbs',
    value: 'Énfasis',
    words: [
      'really', 'very', 'absolutely', 'definitely', 'certainly', 'completely',
      'totally', 'truly', 'indeed', 'especially', 'particularly', 'extremely',
      'incredibly', 'clearly', 'simply', 'literally',
    ],
  },
  {
    key: 'addition-adverbs',
    value: 'Añadir',
    words: [
      'also', 'too', 'as well', 'additionally', 'furthermore', 'moreover',
      'besides', 'equally', 'likewise', 'even',
    ],
  },
  {
    key: 'contrast-adverbs',
    value: 'Contraste',
    words: [
      'however', 'instead', 'nevertheless', 'nonetheless', 'otherwise',
      'alternatively', 'conversely', 'rather',
    ],
  },
  {
    key: 'result-adverbs',
    value: 'Resultado',
    words: ['therefore', 'consequently', 'thus', 'hence', 'accordingly'],
  },
]

const group: GroupConfig = { key, value, subtypes }

export default group
