// Ingredients the kitchen does not have enough of, as "2 × Huevo".
export function missingIngredients(recipe) {
  return recipe.ingredients.filter((ingredient) => !ingredient.sufficient)
}

export function splitByAvailability(recipes = []) {
  const ready = recipes.filter((recipe) => recipe.available)
  const almost = recipes
    .filter((recipe) => !recipe.available)
    .sort((a, b) => missingIngredients(a).length - missingIngredients(b).length)
  return { ready, almost }
}
