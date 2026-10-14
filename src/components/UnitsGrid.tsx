import TileGrid from './TileGrid'
import { UNIT_COUNT } from '../services/units'
import type { Option } from '../types/content'

const units: Option[] = Array.from({ length: UNIT_COUNT }, (_, index) => ({
  key: String(index + 1),
  value: `Unidad ${index + 1}`,
}))

interface UnitsGridProps {
  /** A dónde apunta cada unidad: se le agrega /1, /2... */
  basePath: string
}

export default function UnitsGrid({ basePath }: UnitsGridProps) {
  return <TileGrid items={units} basePath={basePath} />
}
