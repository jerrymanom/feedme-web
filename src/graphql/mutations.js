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
