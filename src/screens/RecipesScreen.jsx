import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { PANTRY, RECIPES } from '../graphql/queries'
import { CREATE_RECIPE, DELETE_RECIPE, UPDATE_RECIPE } from '../graphql/mutations'
import { useSession } from '../auth/context'
import { useToast } from '../components/toast-context'
import { MEALTIMES } from '../lib/mealtime'
import { recipeIngredients, rowsFromRecipe } from '../lib/forms'

const REFETCH = { refetchQueries: ['Recipes', 'MealRecipes'] }

// Creates a recipe, or edits one when `recipe` is given (same fields, prefilled).
function RecipeForm({ recipe, onDone }) {
  const toast = useToast()
  const editing = Boolean(recipe)
  const { data: pantry } = useQuery(PANTRY)
  const [createRecipe, created] = useMutation(CREATE_RECIPE, REFETCH)
  const [updateRecipe, updated] = useMutation(UPDATE_RECIPE, REFETCH)
  const [rows, setRows] = useState(() => rowsFromRecipe(recipe))
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
    const variables = { name: form.get('name'), mealtime, ingredients }
    try {
      const { data } = editing
        ? await updateRecipe({ variables: { ...variables, recipeId: recipe.id } })
        : await createRecipe({ variables })
      const { recipe: saved, errors } = editing ? data.updateRecipe : data.createRecipe
      if (!saved) return setError(errors.join('. '))
      toast(`Receta guardada: ${saved.name}.`)
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
        <input name="name" required autoComplete="off" placeholder="Ej. Chilaquiles" defaultValue={recipe?.name} />
      </label>

      <fieldset className="choices">
        <legend>¿Para cuándo?</legend>
        {Object.values(MEALTIMES).map((meal) => (
          <label key={meal.key} className="choice">
            <input type="checkbox" name="mealtime" value={meal.key}
              defaultChecked={recipe?.mealtime.includes(meal.key)} />
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
          onClick={() => setRows((current) => [...current, { productId: '', quantity: 1 }])}>
          Agregar otro ingrediente
        </button>
      </fieldset>

      {error && <p className="notice notice-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button type="submit" className="button" disabled={created.loading || updated.loading}>
          {editing ? 'Guardar cambios' : 'Guardar receta'}
        </button>
        <button type="button" className="link-button link-plain" onClick={onDone}>Cancelar</button>
      </div>
    </form>
  )
}

// Asks once more in place before deleting, since it cannot be undone.
function DeleteRecipe({ recipe, onDone }) {
  const toast = useToast()
  const [confirming, setConfirming] = useState(false)
  const [deleteRecipe, { loading }] = useMutation(DELETE_RECIPE, REFETCH)

  async function handleDelete() {
    try {
      const { data } = await deleteRecipe({ variables: { recipeId: recipe.id } })
      const [problem] = data.deleteRecipe.errors
      if (problem) return toast(problem, 'error')
      toast(`Receta eliminada: ${recipe.name}.`)
      onDone()
    } catch {
      toast('No se pudo conectar con el servidor. Intenta de nuevo.', 'error')
    }
  }

  if (!confirming) {
    return <button type="button" className="link-button" onClick={() => setConfirming(true)}>Eliminar receta</button>
  }

  return (
    <div className="danger-confirm">
      <p>¿Eliminar {recipe.name}? Tu despensa no cambia.</p>
      <div className="form-actions">
        <button type="button" className="button button-danger" onClick={handleDelete} disabled={loading}>Sí, eliminar</button>
        <button type="button" className="link-button link-plain" onClick={() => setConfirming(false)}>No</button>
      </div>
    </div>
  )
}

function RecipeItem({ recipe, canEdit, editing, onEdit, onClose }) {
  if (editing) {
    return (
      <li className="recipe-editing">
        <RecipeForm recipe={recipe} onDone={onClose} />
        <DeleteRecipe recipe={recipe} onDone={onClose} />
      </li>
    )
  }

  return (
    <li className="recipe">
      <div className="recipe-body">
        <h3>{recipe.name}</h3>
        <p className="quiet">{recipe.mealtime.join(', ')}</p>
        <ul className="ingredients">
          {recipe.ingredients.map(({ product, quantity }) => (
            <li key={product.id}>{quantity > 1 && <span className="qty">{quantity} ×</span>} {product.name}</li>
          ))}
        </ul>
      </div>
      {canEdit && <button type="button" className="button button-quiet button-small" onClick={onEdit}>Editar</button>}
    </li>
  )
}

export default function RecipesScreen() {
  const { me } = useSession()
  const { data, loading, error } = useQuery(RECIPES)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
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
          <RecipeItem key={recipe.id} recipe={recipe} canEdit={Boolean(me)} editing={editingId === recipe.id}
            onEdit={() => setEditingId(recipe.id)} onClose={() => setEditingId(null)} />
        ))}
      </ul>
    </section>
  )
}
