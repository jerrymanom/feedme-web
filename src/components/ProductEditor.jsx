import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { CATEGORIES } from '../graphql/queries'
import { DELETE_PRODUCT, UPDATE_PRODUCT } from '../graphql/mutations'
import { useToast } from './toast-context'

// Inline editor under a pantry row. Deleting asks once more in place
// (no browser dialog) because it cannot be undone.
export default function ProductEditor({ product, onClose }) {
  const toast = useToast()
  const [error, setError] = useState(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const { data } = useQuery(CATEGORIES)
  const [updateProduct, updating] = useMutation(UPDATE_PRODUCT, { refetchQueries: ['Pantry'] })
  const [deleteProduct, deleting] = useMutation(DELETE_PRODUCT, { refetchQueries: ['Pantry', 'MealRecipes'] })

  async function handleSave(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError(null)
    try {
      const variables = { productId: product.id, name: form.get('name'), categoryId: form.get('categoryId') }
      const { data: result } = await updateProduct({ variables })
      const { product: saved, errors } = result.updateProduct
      if (!saved) return setError(errors.join('. '))
      toast(`${saved.name} guardado en ${saved.category.name}.`)
      onClose()
    } catch {
      setError('No se pudo conectar con el servidor. Intenta de nuevo.')
    }
  }

  async function handleDelete() {
    setError(null)
    try {
      const { data: result } = await deleteProduct({ variables: { productId: product.id } })
      const [problem] = result.deleteProduct.errors
      if (problem) return setError(problem)
      toast(`${product.name} se quitó de la despensa.`)
      onClose()
    } catch {
      setError('No se pudo conectar con el servidor. Intenta de nuevo.')
    }
  }

  return (
    <form className="form panel editor" onSubmit={handleSave}>
      <label>
        Nombre
        <input name="name" defaultValue={product.name} required autoComplete="off" />
      </label>
      <label>
        Categoría
        <select name="categoryId" defaultValue={product.category.id} required>
          {(data?.categories ?? [product.category]).map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </label>
      {error && <p className="notice notice-error" role="alert">{error}</p>}

      {confirmingDelete ? (
        <div className="danger-confirm">
          <p>¿Quitar {product.name} de la despensa? No se puede deshacer.</p>
          <div className="form-actions">
            <button type="button" className="button button-danger" onClick={handleDelete} disabled={deleting.loading}>
              Sí, quitar
            </button>
            <button type="button" className="link-button link-plain" onClick={() => setConfirmingDelete(false)}>
              No
            </button>
          </div>
        </div>
      ) : (
        <div className="form-actions">
          <button type="submit" className="button" disabled={updating.loading}>Guardar</button>
          <button type="button" className="link-button link-plain" onClick={onClose}>Cancelar</button>
          <button type="button" className="link-button push-right" onClick={() => setConfirmingDelete(true)}>
            Quitar producto
          </button>
        </div>
      )}
    </form>
  )
}
