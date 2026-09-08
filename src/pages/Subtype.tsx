import { Navigate, useParams } from 'react-router-dom'
import Page from '../components/Page'
import ExerciseList from '../components/ExerciseList'
import { getGroup, getSubtype } from '../content'

export default function Subtype() {
  const { groupKey, subtypeKey } = useParams<'groupKey' | 'subtypeKey'>()
  const group = getGroup(groupKey)
  const subtype = getSubtype(groupKey, subtypeKey)

  if (!group) return <Navigate to="/base" replace />
  if (!subtype) return <Navigate to={`/base/${groupKey}`} replace />

  return (
    <Page title={subtype.value} subtitle={group.value} backTo={`/base/${group.key}`}>
      <ExerciseList collectionKey={subtype.key} />
    </Page>
  )
}
