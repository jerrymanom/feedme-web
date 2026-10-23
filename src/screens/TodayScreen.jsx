import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { MEAL_RECIPES } from '../graphql/queries'
import { COOK_RECIPE } from '../graphql/mutations'
import { useSession } from '../auth/context'
import { useToast } from '../components/toast-context'
import { mealtimeFor } from '../lib/mealtime'
import { missingIngredients, splitByAvailability } from '../lib/recipes'
import { navigate } from '../lib/router'

function IngredientList({ ingredients }) {
  return (
    <ul className="ingredients">
      {ingredients.map(({ product, quantity, sufficient }) => (
        <li key={product.id} className={sufficient ? undefined : 'missing'}>
          {quantity > 1 && <span className="qty">{quantity} ×</span>} {product.name}
        </li>
      ))}
    </ul>
  )
}

function ReadyRecipe({ recipe, onCook, cooking }) {
  return (
    <li className="recipe">
      <div className="recipe-body">
        <h3>{recipe.name}</h3>
        <IngredientList ingredients={recipe.ingredients} />
      </div>
      <button type="button" className="button" onClick={() => onCook(recipe)} disabled={cooking}>
        {cooking ? 'Cocinando…' : 'Cocinar'}
      </button>
    </li>
  )
}

function AlmostRecipe({ recipe }) {
  const missing = missingIngredients(recipe).map((ingredient) => ingredient.product.name)
  return (
    <li className="recipe recipe-almost">
      <div className="recipe-body">
        <h3>{recipe.name}</h3>
        <p className="missing-line">Falta {missing.join(', ')}</p>
      </div>
    </li>
  )
}

export default function TodayScreen() {
  const [meal] = useState(() => mealtimeFor(new Date()))
  const { me } = useSession()
  const toast = useToast()
  const { data, loading, error } = useQuery(MEAL_RECIPES, { variables: { mealtime: meal.key } })
  const [cookRecipe, { loading: cooking }] = useMutation(COOK_RECIPE, {
    refetchQueries: ['MealRecipes', 'Pantry'],
  })
  const { ready, almost } = splitByAvailability(data?.recipes)

  async function handleCook(recipe) {
    if (!me) {
      toast('Inicia sesión para cocinar y descontar de tu despensa.', 'info')
      navigate('/hogar')
      return
    }
    try {
      const { data: result } = await cookRecipe({ variables: { recipeId: recipe.id } })
      const [problem] = result.cookRecipe.errors
      toast(problem ?? `Listo: ${recipe.name}. Ya se descontó de la despensa.`, problem ? 'error' : 'ok')
    } catch {
      toast('No se pudo conectar con el servidor. Intenta de nuevo.', 'error')
    }
  }

  return (
    <section className="screen">
      <header className="screen-header">
        <p className="kicker">{meal.greeting}</p>
        <h1 className="headline">¿Qué hay de {meal.label}?</h1>
      </header>

      <a className="text-link" href="#/recetas">Ver y crear recetas</a>

      {loading && <p className="quiet">Revisando la despensa…</p>}
      {error && <p className="notice notice-error">No se pudieron cargar las recetas. Revisa tu conexión.</p>}

      {data && (
        <>
          <h2 className="section-title">Puedes cocinar</h2>
          {ready.length === 0 ? (
            <p className="quiet">Con lo que hay no alcanza para ninguna receta de {meal.label}.</p>
          ) : (
            <ul className="recipe-list">
              {ready.map((recipe) => (
                <ReadyRecipe key={recipe.id} recipe={recipe} onCook={handleCook} cooking={cooking} />
              ))}
            </ul>
          )}

          {almost.length > 0 && (
            <>
              <h2 className="section-title">Te falta poco</h2>
              <ul className="recipe-list">
                {almost.map((recipe) => <AlmostRecipe key={recipe.id} recipe={recipe} />)}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  )
}
