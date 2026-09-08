import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main className="page home">
      <h1>Aprender inglés</h1>
      <div className="tile-grid tile-grid-lg">
        <Link className="tile" to="/base">
          Base
        </Link>
        <Link className="tile" to="/memory">
          Memoria
        </Link>
      </div>
    </main>
  )
}
