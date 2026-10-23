import { useMutation, useQuery } from '@apollo/client/react'
import { PANTRY } from '../graphql/queries'
import { UPDATE_STOCK } from '../graphql/mutations'
import { useSession } from '../auth/context'
import { useToast } from '../components/toast-context'
import Stepper from '../components/Stepper'

function groupByCategory(products = []) {
  const groups = new Map()
  for (const product of products) {
    const name = product.category.name
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name).push(product)
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, 'es'))
}

export default function PantryScreen() {
  const { me } = useSession()
  const toast = useToast()
  const { data, loading, error } = useQuery(PANTRY)
  const [updateStock] = useMutation(UPDATE_STOCK, { refetchQueries: ['MealRecipes'] })

  async function changeAmount(product, amount) {
    try {
      const { data: result } = await updateStock({
        variables: { productId: product.id, amount },
        // The stepper moves at once; the server answer replaces this guess.
        optimisticResponse: {
          updateProductStock: {
            __typename: 'UpdateProductStockPayload',
            errors: [],
            product: { __typename: 'Product', id: product.id, amount },
          },
        },
      })
      const [problem] = result.updateProductStock.errors
      if (problem) toast(problem, 'error')
    } catch {
      toast('No se guardó el cambio. Revisa tu conexión.', 'error')
    }
  }

  const groups = groupByCategory(data?.products)

  return (
    <section className="screen">
      <header className="screen-header">
        <h1 className="headline">Despensa</h1>
        <p className="lede">Lo que hay en casa. Las recetas se calculan con estas cantidades.</p>
      </header>

      {loading && <p className="quiet">Cargando la despensa…</p>}
      {error && <p className="notice notice-error">No se pudo cargar la despensa. Revisa tu conexión.</p>}
      {data && groups.length === 0 && (
        <p className="quiet">Tu despensa está vacía. Escanea un ticket para llenarla.</p>
      )}

      {groups.map(([category, products]) => (
        <div key={category} className="shelf">
          <h2 className="section-title">{category}</h2>
          <ul className="stock-list">
            {products.map((product) => (
              <li key={product.id} className={product.amount === 0 ? 'stock-row empty' : 'stock-row'}>
                <span className="stock-name">{product.name}</span>
                <Stepper value={product.amount} label={product.name} disabled={!me}
                  onChange={(amount) => changeAmount(product, amount)} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
