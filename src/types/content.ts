// Tipos del contenido configurable que vive en src/content.

/**
 * Una opción del listado de botones.
 * `key` es la sub-url a la que navega y el nombre de la colección en Firestore;
 * `value` es el texto que se muestra en el botón y en los títulos.
 */
export interface Option {
  key: string
  value: string
}

/** Un subtipo dentro de un grupo: Personales, Modo, Lugar... */
export interface Subtype extends Option {
  /** Las palabras del subtipo, para agregar o quitar. */
  words: string[]
}

/** Un grupo de Base: Pronombres, Adverbios, Artículos... */
export interface GroupConfig extends Option {
  /** Vacío cuando el grupo entra directo al listado de ejercicios. */
  subtypes: Subtype[]
  /** Las palabras del grupo. Solo en los grupos sin subtipos; si no, viven en cada subtipo. */
  words?: string[]
}
