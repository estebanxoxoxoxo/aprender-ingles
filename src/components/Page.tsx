import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface PageProps {
  title: string
  /** A dónde vuelve la flecha; sin esto no se muestra. */
  backTo?: string
  subtitle?: string
  children: ReactNode
}

export default function Page({ title, backTo, subtitle, children }: PageProps) {
  return (
    <main className="page">
      <header className="page-header">
        {backTo ? (
          <Link className="back" to={backTo}>
            ← Volver
          </Link>
        ) : null}
        <h1>{title}</h1>
        {subtitle ? <p className="subtitle">{subtitle}</p> : null}
      </header>
      {children}
    </main>
  )
}
