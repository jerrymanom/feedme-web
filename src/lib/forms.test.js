import { test } from 'node:test'
import assert from 'node:assert/strict'
import { capitalize, confirmItems, readyToConfirm, recipeIngredients, rowsFromRecipe } from './forms.js'

test('capitalizes names read from receipts', () => {
  assert.equal(capitalize('  detergente roma '), 'Detergente roma')
  assert.equal(capitalize(''), '')
})

test('merges repeated ingredients and drops empty rows', () => {
  const rows = [
    { productId: '1', quantity: 2 },
    { productId: '', quantity: 1 },
    { productId: '1', quantity: '1' },
    { productId: '2', quantity: 0 },
  ]
  assert.deepEqual(recipeIngredients(rows), [
    { productId: '1', quantity: 3 },
    { productId: '2', quantity: 1 },
  ])
})

test('sends newProduct for lines that create a product', () => {
  const lines = [
    { id: 'a', productId: '5', quantity: 2 },
    { id: 'b', productId: '', quantity: 1 },
    { id: 'c', productId: 'new', quantity: 1, newName: ' Detergente ', newCategoryId: '9' },
  ]
  assert.deepEqual(confirmItems(lines), [
    { id: 'a', quantity: 2, productId: '5' },
    { id: 'b', quantity: 1, productId: null },
    { id: 'c', quantity: 1, newProduct: { name: 'Detergente', categoryId: '9' } },
  ])
})

test('blocks confirming until new products have a name and category', () => {
  assert.equal(readyToConfirm([{ productId: 'new', newName: 'Pan', newCategoryId: '' }]), false)
  assert.equal(readyToConfirm([{ productId: 'new', newName: 'Pan', newCategoryId: '2' }, { productId: '' }]), true)
})

test('starts the recipe form from the saved ingredients', () => {
  const recipe = { ingredients: [{ quantity: 2, product: { id: '7', name: 'Leche' } }] }
  assert.deepEqual(rowsFromRecipe(recipe), [{ productId: '7', quantity: 2 }])
  assert.deepEqual(rowsFromRecipe(null), [{ productId: '', quantity: 1 }])
})
