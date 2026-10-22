import { useRef, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { PURCHASES } from '../graphql/queries'
import { SCAN_RECEIPT } from '../graphql/mutations'
import { useSession } from '../auth/context'
import { useToast } from '../components/toast-context'
import { formatCents } from '../lib/money'
import { formatIsoDate, monthKey, monthLabel } from '../lib/dates'
import { fileToJpegBase64 } from '../lib/image'
import { navigate } from '../lib/router'
import ReceiptReview from './ReceiptReview'

function ScanButton() {
  const { me } = useSession()
  const toast = useToast()
  const input = useRef(null)
  const [scanReceipt, { loading }] = useMutation(SCAN_RECEIPT, { refetchQueries: ['Purchases'], awaitRefetchQueries: true })
  const [preparing, setPreparing] = useState(false)
  const busy = preparing || loading

  async function handleFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setPreparing(true)
    try {
      const { base64, mediaType } = await fileToJpegBase64(file)
      setPreparing(false)
      const { data } = await scanReceipt({ variables: { imageBase64: base64, mediaType } })
      const { purchase, errors } = data.scanReceipt
      if (purchase) navigate(`/tickets/${purchase.id}`)
      else toast(errors[0], 'error')
    } catch {
      toast('No se pudo leer la foto. Intenta con otra con buena luz.', 'error')
    } finally {
      setPreparing(false)
    }
  }

  if (!me) {
    return <a className="button button-wide" href="#/hogar">Crea tu cuenta para escanear tickets</a>
  }

  return (
    <>
      <input ref={input} type="file" accept="image/*" capture="environment" hidden onChange={handleFile} />
      <button type="button" className="button button-wide" onClick={() => input.current.click()} disabled={busy}>
        {busy ? 'Leyendo el ticket…' : 'Escanear ticket'}
      </button>
      <p className="hint">Toma la foto con el ticket completo y bien iluminado. Revisarás todo antes de sumarlo.</p>
    </>
  )
}

function PurchaseRow({ purchase }) {
  const pending = purchase.status === 'PENDING_REVIEW'
  return (
    <li>
      <a className="purchase-row" href={`#/tickets/${purchase.id}`}>
        <span className="purchase-store">{purchase.storeName ?? 'Tienda sin nombre'}</span>
        <span className="purchase-date">{formatIsoDate(purchase.purchasedOn)}</span>
        <span className="purchase-total">{formatCents(purchase.totalCents)}</span>
        {pending && <span className="badge">Por revisar</span>}
      </a>
    </li>
  )
}

export default function ReceiptsScreen({ purchaseId }) {
  const [today] = useState(() => new Date())
  const { data, loading, error } = useQuery(PURCHASES, { variables: { month: monthKey(today) } })
  const purchases = data?.purchases ?? []

  if (purchaseId) {
    const purchase = purchases.find((candidate) => candidate.id === purchaseId)
    if (purchase) return <ReceiptReview key={purchase.id} purchase={purchase} />
    if (!loading) return <p className="notice">No encontramos ese ticket. <a href="#/tickets">Ver tickets</a></p>
  }

  return (
    <section className="screen">
      <header className="screen-header">
        <p className="kicker">Gasto de {monthLabel(today)}</p>
        <p className="spend" aria-live="polite">{formatCents(data?.spending.totalCents)}</p>
        <p className="lede">
          {data?.spending.purchasesCount === 1 ? '1 compra confirmada' : `${data?.spending.purchasesCount ?? 0} compras confirmadas`}
        </p>
      </header>

      <ScanButton />

      {error && <p className="notice notice-error">No se pudieron cargar tus tickets. Revisa tu conexión.</p>}
      {data && purchases.length === 0 && <p className="quiet">Aún no hay tickets. El primero aparece aquí.</p>}
      {purchases.length > 0 && (
        <>
          <h2 className="section-title">Tickets</h2>
          <ul className="purchase-list">
            {purchases.map((purchase) => <PurchaseRow key={purchase.id} purchase={purchase} />)}
          </ul>
        </>
      )}
    </section>
  )
}
