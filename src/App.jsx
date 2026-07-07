import { useState, useRef, useEffect } from 'react'
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

function RecipeCard({ recipe }) {
  return (
    <article className="recipe-card">
      <h3 className="recipe-name">{recipe.name}</h3>
      {recipe.products?.length > 0 && (
        <ul className="product-list">
          {recipe.products.map((p) => (
            <li key={p.id} className="product-item">
              <span className="product-name">{p.name}</span>
              <span className="product-meta">
                {p.amount != null && <span className="product-amount">{p.amount}</span>}
                {p.category?.name && <span className="product-category">{p.category.name}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

function RecipesCarousel({ recipes, onShowAll }) {
  const trackRef = useRef(null)

  const scrollBy = (dir) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('.recipe-card')
    const gap = 16
    const step = card ? card.offsetWidth + gap : track.clientWidth
    track.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <div className="carousel">
      <div className="carousel-toolbar">
        <div className="carousel-controls">
          <button className="carousel-btn" onClick={() => scrollBy(-1)} aria-label="Anterior">‹</button>
          <button className="carousel-btn" onClick={() => scrollBy(1)} aria-label="Siguiente">›</button>
        </div>
        <button className="show-all-btn" onClick={onShowAll}>Ver todo</button>
      </div>
      <div className="carousel-track" ref={trackRef}>
        {recipes.map((r, i) => (
          <div className="carousel-item" key={`${r.name}-${i}`}>
            <RecipeCard recipe={r} />
          </div>
        ))}
      </div>
    </div>
  )
}

function RecipesModal({ recipes, label, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Todas las recetas de {label}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-grid">
            {recipes.map((r, i) => (
              <RecipeCard recipe={r} key={`${r.name}-${i}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const mealtime = getMealtime()
  const [showAll, setShowAll] = useState(false)
  const { data, loading, error } = useQuery(RECIPES_AVAILABLE, {
    skip: mealtime === null,
  })

  const meta = mealtime ? MEALTIME_META[mealtime] : null
  const recipes = data && mealtime ? data[mealtime] : []

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
                  {recipes.length === 0
                    ? 'Sin recetas disponibles'
                    : `${recipes.length} receta${recipes.length !== 1 ? 's' : ''} disponible${recipes.length !== 1 ? 's' : ''}`}
                </p>
                {recipes.length === 0 ? (
                  <div className="empty-recipes">
                    <p>No hay recetas disponibles ahora mismo.</p>
                  </div>
                ) : (
                  <RecipesCarousel recipes={recipes} onShowAll={() => setShowAll(true)} />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {showAll && (
        <RecipesModal recipes={recipes} label={meta.label} onClose={() => setShowAll(false)} />
      )}
    </div>
  )
}
