import { gql } from '@apollo/client'

export const RECIPES_AVAILABLE = gql`
  query RecipesAvailable {
    desayuno: recipes(mealtime: "desayuno", availableOnly: true) {
      name
      available
      products{
        id
        name
        amount
        category {
            id
            name
            productsCount
        }
      }
    }
    comida: recipes(mealtime: "comida", availableOnly: true) {
      name
      available
      products{
        id
        name
        amount
        category {
            id
            name
            productsCount
        }
      }
    }
    cena: recipes(mealtime: "cena", availableOnly: true) {
      name
      available
      products{
        id
        name
        amount
        category {
            id
            name
            productsCount
        }
      }
    }
  }
`