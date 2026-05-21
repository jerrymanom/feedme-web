import { useQuery } from '@apollo/client/react'
import { RECIPES_AVAILABLE } from './graphql/queries'


export default function App() {
  const { data, loading, error } = useQuery(RECIPES_AVAILABLE)

  if (loading) return <p>Cargando...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <main style={{ padding: 24 }}>
      <h1>🍽 FeedMe</h1>

      {['desayuno', 'comida', 'cena'].map((time) => (
        <section key={time}>
          <h2>{time}</h2>
          <ul>
            {data[time].map((r) => (
              <li key={r.id}>{r.name}</li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}