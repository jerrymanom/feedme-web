const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

// Amounts travel as integer cents; only format at the edge.
export function formatCents(cents) {
  return pesos.format((cents ?? 0) / 100)
}
