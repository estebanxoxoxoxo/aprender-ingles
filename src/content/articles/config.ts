import type { GroupConfig, Subtype } from '../../types/content'

// Artículos: no tiene subtipos, entra directo al listado de ejercicios.
// key -> sub-url y nombre de la colección en Firestore
export const key = 'articles'
export const value = 'Artículos'

// Sin subtipos: desde /base/articles se va directo a los ejercicios.
export const subtypes: Subtype[] = []

// '-' representa el artículo cero (ausencia de artículo).
export const words = ['a', 'an', 'the', 'some', '-']

const group: GroupConfig = { key, value, subtypes, words }

export default group
