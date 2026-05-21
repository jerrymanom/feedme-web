import { gql } from '@apollo/client'

export const RECIPES_AVAILABLE = gql`
  query RecipesAvailable {
    desayuno: recipes(mealtime: "desayuno", availableOnly: true) {
      id
      name
    }
    comida: recipes(mealtime: "comida", availableOnly: true) {
      id
      name
    }
    cena: recipes(mealtime: "cena", availableOnly: true) {
      id
      name
    }
  }
`