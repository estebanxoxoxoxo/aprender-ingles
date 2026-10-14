// Registro de los grupos de "Base".
// Cada grupo vive en su propia carpeta con su config.ts.
import type { GroupConfig, Subtype } from '../types/content.ts'
import { groups } from './base/config.ts'
import pronouns from './pronouns/config.ts'
import adverbs from './adverbs/config.ts'
import prepositions from './prepositions/config.ts'
import articles from './articles/config.ts'
import questionWords from './questionWords/config.ts'

const configs: GroupConfig[] = [pronouns, adverbs, prepositions, articles, questionWords]

const byKey = new Map(configs.map((config) => [config.key, config]))

export function getGroup(groupKey: string | undefined): GroupConfig | null {
  if (!groupKey) return null
  return byKey.get(groupKey) ?? null
}

export function getSubtype(
  groupKey: string | undefined,
  subtypeKey: string | undefined,
): Subtype | null {
  const group = getGroup(groupKey)
  if (!group || !subtypeKey) return null
  return group.subtypes.find((subtype) => subtype.key === subtypeKey) ?? null
}

export { groups }
