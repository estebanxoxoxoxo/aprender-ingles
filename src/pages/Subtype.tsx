import { Navigate, useParams } from 'react-router-dom'
import Page from '../components/Page'
import UnitsGrid from '../components/UnitsGrid'
import UnitExercises from '../components/UnitExercises'
import { getGroup, getSubtype } from '../content'
import { exercisesPerUnit } from '../services/units'

export default function Subtype() {
  const { groupKey, secondKey } = useParams<'groupKey' | 'secondKey'>()
  const group = getGroup(groupKey)

  if (!group) return <Navigate to="/base" replace />

  // Las secciones sin subtipos usan este mismo tramo de la url para la unidad.
  if (group.subtypes.length === 0) {
    return (
      <Page title={`Unidad ${secondKey}`} subtitle={group.value} backTo={`/base/${group.key}`}>
        <UnitExercises section={group.key} unitNumber={Number(secondKey)} />
      </Page>
    )
  }

  const subtype = getSubtype(groupKey, secondKey)
  if (!subtype) return <Navigate to={`/base/${group.key}`} replace />

  return (
    <Page
      title={subtype.value}
      subtitle={`${group.value} · ${exercisesPerUnit(subtype.words.length)} ejercicios por unidad`}
      backTo={`/base/${group.key}`}
    >
      <UnitsGrid basePath={`/base/${group.key}/${subtype.key}`} />
    </Page>
  )
}
