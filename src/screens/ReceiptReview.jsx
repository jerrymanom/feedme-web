import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { PANTRY } from '../graphql/queries'
import { CONFIRM_PURCHASE } from '../graphql/mutations'
import { useToast } from '../components/toast-context'
import Stepper from '../components/Stepper'
import { formatCents } from '../lib/money'
import { formatIsoDate } from '../lib/dates'
import { navigate } from '../lib/router'

// The receipt as the AI read it, printed like the paper it came from. Each line
// can be pointed at a pantry product (or left out) before anything is restocked.
export default function ReceiptReview({ purchase }) {
  const toast = useToast()
  const pending = purchase.status === 'PENDING_REVIEW'
  const { data: pantry } = useQuery(PANTRY)
  const [confirmPurchase, { loading }] = useMutation(CONFIRM_PURCHASE, {
    refetchQueries: ['Purchases', 'Pantry', 'MealRecipes'],
    awaitRefetchQueries: true,
  })
  const [lines, setLines] = useState(() =>
    purchase.items.map((item) => ({ ...item, productId: item.product?.id ?? '' })),
  )
  const matched = lines.filter((line) => line.productId).length

  function updateLine(id, changes) {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...changes } : line)))
  }

  async function handleConfirm() {
    const items = lines.map((line) => ({ id: line.id, productId: line.productId || null, quantity: line.quantity }))
    try {
      const { data } = await confirmPurchase({ variables: { purchaseId: purchase.id, items } })
      const [problem] = data.confirmPurchase.errors
      if (problem) return toast(problem, 'error')
      toast(`Despensa actualizada con ${matched} ${matched === 1 ? 'artículo' : 'artículos'}.`)
      navigate('/despensa')
    } catch {
      toast('No se pudo confirmar. Revisa tu conexión e intenta de nuevo.', 'error')
    }
  }

  return (
    <section className="screen">
      <a className="back" href="#/tickets">Tickets</a>
      <h1 className="headline">{pending ? 'Revisa tu ticket' : 'Ticket'}</h1>
      {pending && <p className="lede">Elige a qué producto de tu despensa corresponde cada línea.</p>}

      <article className="receipt" aria-label="Ticket">
        <header className="receipt-head">
          <p className="receipt-store">{purchase.storeName ?? 'Tienda sin nombre'}</p>
          <p>{formatIsoDate(purchase.purchasedOn)}</p>
        </header>

        <ul className="receipt-lines">
          {lines.map((line) => (
            <li key={line.id} className="receipt-line">
              <div className="receipt-text">
                <span>{line.description}</span>
                <span>{formatCents(line.totalCents)}</span>
              </div>
              {pending ? (
                <div className="receipt-edit">
                  <select value={line.productId} aria-label={`Producto para ${line.description}`}
                    onChange={(event) => updateLine(line.id, { productId: event.target.value })}>
                    <option value="">No sumar a la despensa</option>
                    {pantry?.products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                  <Stepper value={line.quantity} min={1} label={line.description}
                    disabled={!line.productId} onChange={(quantity) => updateLine(line.id, { quantity })} />
                </div>
              ) : (
                line.product && <p className="receipt-note">+{line.quantity} {line.product.name}</p>
              )}
            </li>
          ))}
        </ul>

        <footer className="receipt-total">
          <span>Total</span>
          <span>{formatCents(purchase.totalCents)}</span>
        </footer>
      </article>

      {pending && (
        <button type="button" className="button button-wide" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Guardando…' : `Sumar ${matched} ${matched === 1 ? 'artículo' : 'artículos'} a la despensa`}
        </button>
      )}
    </section>
  )
}
