import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { PANTRY, RECIPES } from '../graphql/queries'
import { CREATE_RECIPE } from '../graphql/mutations'
import { useSession } from '../auth/context'
import { useToast } from '../components/toast-context'
import { MEALTIMES } from '../lib/mealtime'
import { recipeIngredients } from '../lib/forms'

const EMPTY_ROW = { productId: '', quantity: 1 }

function RecipeForm({ onDone }) {
  const toast = useToast()
  const { data: pantry } = useQuery(PANTRY)
  const [createRecipe, { loading }] = useMutation(CREATE_RECIPE, { refetchQueries: ['Recipes', 'MealRecipes'] })
  const [rows, setRows] = useState([EMPTY_ROW])
  const [error, setError] = useState(null)
  const products = pantry?.products ?? []

  function updateRow(index, changes) {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...changes } : row)))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const mealtime = form.getAll('mealtime')
    const ingredients = recipeIngredients(rows)
    if (mealtime.length === 0) return setError('Elige al menos un tiempo de comida.')
    if (ingredients.length === 0) return setError('Agrega al menos un ingrediente.')
    setError(null)
    try {
      const { data } = await createRecipe({ variables: { name: form.get('name'), mealtime, ingredients } })
      const { recipe, errors } = data.createRecipe
      if (!recipe) return setError(errors.join('. '))
      toast(`Receta guardada: ${recipe.name}.`)
      onDone()
    } catch {
      setError('No se pudo conectar con el servidor. Intenta de nuevo.')
    }
  }

  if (pantry && products.length === 0) {
    return <p className="notice">Primero agrega productos a tu <a href="#/despensa">despensa</a>; las recetas se arman con ellos.</p>
  }

  return (
    <form className="form panel" onSubmit={handleSubmit}>
      <label>
        Nombre
        <input name="name" required autoComplete="off" placeholder="Ej. Chilaquiles" />
      </label>

      <fieldset className="choices">
        <legend>¿Para cuándo?</legend>
        {Object.values(MEALTIMES).map((meal) => (
          <label key={meal.key} className="choice">
            <input type="checkbox" name="mealtime" value={meal.key} />
            <span>{meal.label}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="ingredient-rows">
        <legend>Ingredientes</legend>
        {rows.map((row, index) => (
          <div key={index} className="ingredient-row">
            <select value={row.productId} aria-label={`Ingrediente ${index + 1}`}
              onChange={(event) => updateRow(index, { productId: event.target.value })}>
              <option value="">Elige un producto</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
            <input type="number" min="1" inputMode="numeric" value={row.quantity} aria-label="Cantidad"
              onChange={(event) => updateRow(index, { quantity: event.target.value })} />
            {rows.length > 1 && (
              <button type="button" className="icon-button" aria-label={`Quitar ingrediente ${index + 1}`}
                onClick={() => setRows((current) => current.filter((_, i) => i !== index))}>×</button>
            )}
          </div>
        ))}
        <button type="button" className="link-button link-plain"
          onClick={() => setRows((current) => [...current, EMPTY_ROW])}>Agregar otro ingrediente</button>
      </fieldset>

      {error && <p className="notice notice-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button type="submit" className="button" disabled={loading}>Guardar receta</button>
        <button type="button" className="link-button link-plain" onClick={onDone}>Cancelar</button>
      </div>
    </form>
  )
}

export default function RecipesScreen() {
  const { me } = useSession()
  const { data, loading, error } = useQuery(RECIPES)
  const [creating, setCreating] = useState(false)
  const recipes = data?.recipes ?? []

  return (
    <section className="screen">
      <a className="back" href="#/">Hoy</a>
      <header className="screen-header">
        <h1 className="headline">Recetas</h1>
        <p className="lede">Las que guardes aparecen en Hoy cuando tengas sus ingredientes.</p>
      </header>

      {me && !creating && (
        <button type="button" className="button button-wide" onClick={() => setCreating(true)}>Nueva receta</button>
      )}
      {creating && <RecipeForm onDone={() => setCreating(false)} />}

      {loading && <p className="quiet">Cargando recetas…</p>}
      {error && <p className="notice notice-error">No se pudieron cargar las recetas. Revisa tu conexión.</p>}
      {data && recipes.length === 0 && !creating && <p className="quiet">Aún no tienes recetas.</p>}

      <ul className="recipe-list">
        {recipes.map((recipe) => (
          <li key={recipe.id} className="recipe">
            <div className="recipe-body">
              <h3>{recipe.name}</h3>
              <p className="quiet">{recipe.mealtime.join(', ')}</p>
              <ul className="ingredients">
                {recipe.ingredients.map(({ product, quantity }) => (
                  <li key={product.id}>{quantity > 1 && <span className="qty">{quantity} ×</span>} {product.name}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
