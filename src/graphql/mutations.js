import { gql } from '@apollo/client'

export const SIGN_UP = gql`
  mutation SignUp($email: String!, $password: String!) {
    signUp(input: { email: $email, password: $password }) {
      token
      errors
    }
  }
`

export const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(input: { email: $email, password: $password }) {
      token
      errors
    }
  }
`

export const JOIN_HOUSEHOLD = gql`
  mutation JoinHousehold($inviteCode: String!) {
    joinHousehold(input: { inviteCode: $inviteCode }) {
      errors
      household {
        id
        name
      }
    }
  }
`

export const UPDATE_STOCK = gql`
  mutation UpdateStock($productId: ID!, $amount: Int!) {
    updateProductStock(input: { productId: $productId, amount: $amount }) {
      errors
      product {
        id
        amount
      }
    }
  }
`

export const COOK_RECIPE = gql`
  mutation CookRecipe($recipeId: ID!) {
    cookRecipe(input: { recipeId: $recipeId }) {
      errors
      recipe {
        id
        name
      }
    }
  }
`

export const SCAN_RECEIPT = gql`
  mutation ScanReceipt($imageBase64: String!, $mediaType: String!) {
    scanReceipt(input: { imageBase64: $imageBase64, mediaType: $mediaType }) {
      errors
      purchase {
        id
      }
    }
  }
`

export const CONFIRM_PURCHASE = gql`
  mutation ConfirmPurchase($purchaseId: ID!, $items: [PurchaseItemInput!]) {
    confirmPurchase(input: { purchaseId: $purchaseId, items: $items }) {
      errors
      purchase {
        id
        status
      }
    }
  }
`

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($name: String!, $categoryId: ID!, $amount: Int) {
    createProduct(input: { name: $name, categoryId: $categoryId, amount: $amount }) {
      errors
      product {
        id
        name
      }
    }
  }
`

export const CREATE_RECIPE = gql`
  mutation CreateRecipe($name: String!, $mealtime: [String!]!, $ingredients: [IngredientInput!]!) {
    createRecipe(input: { name: $name, mealtime: $mealtime, ingredients: $ingredients }) {
      errors
      recipe {
        id
        name
      }
    }
  }
`

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($productId: ID!, $name: String, $categoryId: ID) {
    updateProduct(input: { productId: $productId, name: $name, categoryId: $categoryId }) {
      errors
      product {
        id
        name
        category {
          id
          name
        }
      }
    }
  }
`

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($productId: ID!) {
    deleteProduct(input: { productId: $productId }) {
      errors
      deletedProductId
    }
  }
`

export const UPDATE_RECIPE = gql`
  mutation UpdateRecipe($recipeId: ID!, $name: String!, $mealtime: [String!]!, $ingredients: [IngredientInput!]!) {
    updateRecipe(input: { recipeId: $recipeId, name: $name, mealtime: $mealtime, ingredients: $ingredients }) {
      errors
      recipe {
        id
        name
      }
    }
  }
`

export const DELETE_RECIPE = gql`
  mutation DeleteRecipe($recipeId: ID!) {
    deleteRecipe(input: { recipeId: $recipeId }) {
      errors
      deletedRecipeId
    }
  }
`
