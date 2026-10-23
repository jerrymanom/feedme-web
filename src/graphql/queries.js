import { gql } from '@apollo/client'

export const SESSION = gql`
  query Session {
    me {
      id
      email
    }
    household {
      id
      name
      demo
      inviteCode
      members {
        id
        email
      }
    }
  }
`

export const MEAL_RECIPES = gql`
  query MealRecipes($mealtime: String!) {
    recipes(mealtime: $mealtime) {
      id
      name
      available
      ingredients {
        quantity
        sufficient
        product {
          id
          name
          amount
        }
      }
    }
  }
`

export const PANTRY = gql`
  query Pantry {
    products {
      id
      name
      amount
      enabled
      category {
        id
        name
      }
    }
  }
`

export const PURCHASES = gql`
  query Purchases($month: String!) {
    spending(month: $month) {
      totalCents
      purchasesCount
    }
    purchases {
      id
      storeName
      purchasedOn
      totalCents
      status
      items {
        id
        description
        quantity
        totalCents
        product {
          id
          name
        }
      }
    }
  }
`
