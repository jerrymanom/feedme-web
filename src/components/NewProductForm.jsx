import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { CATEGORIES } from '../graphql/queries'
import { CREATE_PRODUCT } from '../graphql/mutations'
import { useToast } from './toast-context'

// Collapsed into a single button until needed, so the pantry list stays the focus.
export default function NewProductForm() {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState(null)
  const { data } = useQuery(CATEGORIES, { skip: !open })
  const [createProduct, { loading }] = useMutation(CREATE_PRODUCT, { refetchQueries: ['Pantry'] })

  async function handleSubmit(event) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const variables = {
      name: form.get('name'),
      categoryId: form.get('categoryId'),
      amount: Number(form.get('amount')) || 0,
    }
    setError(null)
    try {
      const { data: result } = await createProduct({ variables })
      const { product, errors } = result.createProduct
      if (!product) return setError(errors.join('. '))
      formElement.reset()
      setOpen(false)
      toast(`${product.name} ya está en tu despensa.`)
    } catch {
      setError('No se pudo conectar con el servidor. Intenta de nuevo.')
    }
  }

  if (!open) {
    return <button type="button" className="button button-quiet" onClick={() => setOpen(true)}>Agregar producto</button>
  }

  return (
    <form className="form panel" onSubmit={handleSubmit}>
      <label>
        Producto
        <input name="name" required autoComplete="off" placeholder="Ej. Yogur natural" />
      </label>
      <div className="form-row">
        <label>
          Categoría
          <select name="categoryId" required defaultValue="">
            <option value="" disabled>Elige una</option>
            {data?.categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label className="narrow">
          Cantidad
          <input name="amount" type="number" min="0" inputMode="numeric" defaultValue="1" />
        </label>
      </div>
      {error && <p className="notice notice-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button type="submit" className="button" disabled={loading}>Agregar</button>
        <button type="button" className="link-button link-plain" onClick={() => setOpen(false)}>Cancelar</button>
      </div>
    </form>
  )
}
