import { Navigate, useParams } from 'react-router-dom'
import Page from '../components/Page'
import TileGrid from '../components/TileGrid'
import UnitsGrid from '../components/UnitsGrid'
import { getGroup } from '../content'
import { exercisesPerUnit } from '../services/units'

export default function Group() {
  const { groupKey } = useParams<'groupKey'>()
  const group = getGroup(groupKey)

  if (!group) return <Navigate to="/base" replace />

  // Sin subtipos (artículos, question words) se entra directo a las unidades.
  if (group.subtypes.length === 0) {
    return (
      <Page
        title={group.value}
        backTo="/base"
        subtitle={`${exercisesPerUnit(group.words?.length ?? 0)} ejercicios por unidad`}
      >
        <UnitsGrid basePath={`/base/${group.key}`} />
      </Page>
    )
  }

  return (
    <Page title={group.value} backTo="/base">
      <TileGrid items={group.subtypes} basePath={`/base/${group.key}`} size="sm" />
    </Page>
  )
}
