import { Navigate, useParams } from 'react-router-dom'
import Page from '../components/Page'
import TileGrid from '../components/TileGrid'
import ExerciseList from '../components/ExerciseList'
import { getGroup } from '../content'

export default function Group() {
  const { groupKey } = useParams<'groupKey'>()
  const group = getGroup(groupKey)

  if (!group) return <Navigate to="/base" replace />

  // Sin subtipos (artículos, question words) se entra directo al listado de ejercicios.
  if (group.subtypes.length === 0) {
    return (
      <Page title={group.value} backTo="/base">
        <ExerciseList collectionKey={group.key} />
      </Page>
    )
  }

  return (
    <Page title={group.value} backTo="/base">
      <TileGrid items={group.subtypes} basePath={`/base/${group.key}`} size="sm" />
    </Page>
  )
}
