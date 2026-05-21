import { useQuery } from '@apollo/client/react'
import { RECIPES_AVAILABLE } from './graphql/queries'
import './App.css'

function getMealtime() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'desayuno'
  if (hour >= 12 && hour < 18) return 'comida'
  if (hour >= 18) return 'cena'
  return null
}

const MEALTIME_META = {
  desayuno: { label: 'Desayuno', greeting: 'Buenos días', range: '5:00 AM – 12:00 PM', icon: '🌅' },
  comida:   { label: 'Comida',   greeting: 'Buenas tardes', range: '12:00 PM – 6:00 PM', icon: '☀️' },
  cena:     { label: 'Cena',     greeting: 'Buenas noches', range: '6:00 PM – 12:00 AM', icon: '🌙' },
}

function RecipesGrid({ recipes }) {
  if (recipes.length === 0) {
    return (
      <div className="empty-recipes">
        <p>No hay recetas disponibles ahora mismo.</p>
      </div>
    )
  }
  return (
    <div className="recipes-grid">
      {recipes.map((r) => (
        <div key={r.id} className="recipe-card">
          <span className="recipe-name">{r.name}</span>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const mealtime = getMealtime()
  const { data, loading, error } = useQuery(RECIPES_AVAILABLE, {
    skip: mealtime === null,
  })

  const meta = mealtime ? MEALTIME_META[mealtime] : null

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <span className="header-logo">🍽</span>
          <span className="header-name">FeedMe</span>
        </div>
        <nav className="header-nav">
          <a href="#" className="nav-link">Productos</a>
          <a href="#" className="nav-link">Categorías</a>
        </nav>
      </header>

      <main className="main">
        {mealtime === null ? (
          <div className="sleep-state">
            <span className="sleep-icon">🌙</span>
            <h2 className="sleep-title">Hora de descansar</h2>
            <p className="sleep-desc">No hay comidas entre las 12:00 AM y las 5:00 AM.<br />Vuelve más tarde para el desayuno.</p>
          </div>
        ) : (
          <>
            <div className="dashboard-header">
              <p className="greeting">{meta.greeting}</p>
              <h1 className="meal-title">
                <span className="meal-icon">{meta.icon}</span>
                {meta.label}
              </h1>
              <p className="meal-range">{meta.range}</p>
            </div>

            {loading && (
              <div className="loading-state">
                <div className="spinner" />
                <p>Cargando recetas...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <p>No se pudieron cargar las recetas. Verifica la conexión con el servidor.</p>
              </div>
            )}

            {data && (
              <div className="recipes-section">
                <p className="recipes-count">
                  {data[mealtime].length === 0
                    ? 'Sin recetas disponibles'
                    : `${data[mealtime].length} receta${data[mealtime].length !== 1 ? 's' : ''} disponible${data[mealtime].length !== 1 ? 's' : ''}`}
                </p>
                <RecipesGrid recipes={data[mealtime]} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
