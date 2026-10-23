// "detergente roma" → "Detergente roma": receipt names arrive lowercase.
export function capitalize(text = '') {
  const trimmed = text.trim()
  return trimmed ? trimmed[0].toLocaleUpperCase('es-MX') + trimmed.slice(1) : ''
}

// Builds the createRecipe ingredients input, skipping empty rows and merging
// repeated products so the API never receives the same product twice.
export function recipeIngredients(rows) {
  const byProduct = new Map()
  for (const { productId, quantity } of rows) {
    if (!productId) continue
    byProduct.set(productId, (byProduct.get(productId) ?? 0) + Math.max(1, Number(quantity) || 1))
  }
  return [...byProduct].map(([productId, quantity]) => ({ productId, quantity }))
}

// Line items for confirmPurchase. A row set to "new" sends newProduct instead of productId.
export function confirmItems(lines) {
  return lines.map(({ id, productId, quantity, newName, newCategoryId }) =>
    productId === 'new'
      ? { id, quantity, newProduct: { name: newName.trim(), categoryId: newCategoryId } }
      : { id, quantity, productId: productId || null },
  )
}

export function readyToConfirm(lines) {
  return lines.every((line) => line.productId !== 'new' || (line.newName.trim() && line.newCategoryId))
}
