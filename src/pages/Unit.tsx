import { Navigate, useParams } from 'react-router-dom'
import Page from '../components/Page'
import UnitExercises from '../components/UnitExercises'
import { getGroup, getSubtype } from '../content'

export default function Unit() {
  const { groupKey, subtypeKey, unitKey } = useParams<'groupKey' | 'subtypeKey' | 'unitKey'>()
  const group = getGroup(groupKey)
  const subtype = getSubtype(groupKey, subtypeKey)

  if (!group) return <Navigate to="/base" replace />
  if (!subtype) return <Navigate to={`/base/${groupKey}`} replace />

  return (
    <Page
      title={`Unidad ${unitKey}`}
      subtitle={`${group.value} · ${subtype.value}`}
      backTo={`/base/${group.key}/${subtype.key}`}
    >
      <UnitExercises section={group.key} subtype={subtype.key} unitNumber={Number(unitKey)} />
    </Page>
  )
}
