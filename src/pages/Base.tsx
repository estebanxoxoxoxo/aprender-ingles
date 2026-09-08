import Page from '../components/Page'
import TileGrid from '../components/TileGrid'
import { groups } from '../content'

export default function Base() {
  return (
    <Page title="Base" backTo="/">
      <TileGrid items={groups} basePath="/base" />
    </Page>
  )
}
