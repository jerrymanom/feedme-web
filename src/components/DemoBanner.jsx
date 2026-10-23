import { useSession } from '../auth/context'

// Visitors without an account browse a sample kitchen; this tells them so.
export default function DemoBanner() {
  const { me, loading } = useSession()
  if (loading || me) return null

  return (
    <aside className="demo-banner">
      <p>Estás viendo una cocina de ejemplo. Crea tu cuenta para llevar la tuya.</p>
      <a className="button button-small" href="#/hogar">Crear cuenta</a>
    </aside>
  )
}
