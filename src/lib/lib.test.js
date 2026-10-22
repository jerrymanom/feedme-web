import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatCents } from './money.js'
import { monthKey, formatIsoDate } from './dates.js'
import { mealtimeFor } from './mealtime.js'
import { fitWithin } from './image.js'
import { splitByAvailability } from './recipes.js'

const at = (hour) => new Date(2026, 9, 22, hour)

test('formats cents as Mexican pesos', () => {
  assert.equal(formatCents(18740).replace(/\s/g, ' '), '$187.40')
  assert.equal(formatCents(null).replace(/\s/g, ' '), '$0.00')
})

test('builds the month key used by the spending query', () => {
  assert.equal(monthKey(new Date(2026, 0, 31)), '2026-01')
})

test('formats ISO calendar dates without shifting the day', () => {
  assert.equal(formatIsoDate('2026-10-01'), '1 de octubre')
  assert.equal(formatIsoDate(null), null)
})

test('picks the mealtime by hour and plans breakfast at night', () => {
  assert.equal(mealtimeFor(at(8)).key, 'desayuno')
  assert.equal(mealtimeFor(at(14)).key, 'comida')
  assert.equal(mealtimeFor(at(20)).key, 'cena')
  assert.deepEqual([mealtimeFor(at(2)).key, mealtimeFor(at(2)).tomorrow], ['desayuno', true])
})

test('shrinks large photos keeping the aspect ratio', () => {
  assert.deepEqual(fitWithin(3000, 4000), { width: 1200, height: 1600 })
  assert.deepEqual(fitWithin(800, 600), { width: 800, height: 600 })
})

test('orders almost-ready recipes by how little they miss', () => {
  const ingredient = (sufficient) => ({ sufficient })
  const recipes = [
    { name: 'A', available: false, ingredients: [ingredient(false), ingredient(false)] },
    { name: 'B', available: true, ingredients: [ingredient(true)] },
    { name: 'C', available: false, ingredients: [ingredient(false), ingredient(true)] },
  ]
  const { ready, almost } = splitByAvailability(recipes)
  assert.deepEqual(ready.map((r) => r.name), ['B'])
  assert.deepEqual(almost.map((r) => r.name), ['C', 'A'])
})
