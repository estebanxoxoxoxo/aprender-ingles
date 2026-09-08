import { Link } from 'react-router-dom'
import type { Option } from '../types/content'

interface TileGridProps {
  /** `key` es la sub-url a la que navega el botón, `value` el texto que muestra. */
  items: Option[]
  basePath: string
  size?: 'sm' | 'md' | 'lg'
}

export default function TileGrid({ items, basePath, size = 'md' }: TileGridProps) {
  return (
    <div className={`tile-grid tile-grid-${size}`}>
      {items.map((item) => (
        <Link key={item.key} className="tile" to={`${basePath}/${item.key}`}>
          {item.value}
        </Link>
      ))}
    </div>
  )
}
