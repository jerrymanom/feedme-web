import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { getToken } from '../lib/session'

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql'

// Reads the token on every request, so signing in or out takes effect immediately.
const authLink = new ApolloLink((operation, forward) => {
  const token = getToken()
  if (token) {
    operation.setContext(({ headers = {} }) => ({
      headers: { ...headers, authorization: `Bearer ${token}` },
    }))
  }
  return forward(operation)
})

export const client = new ApolloClient({
  link: ApolloLink.from([authLink, new HttpLink({ uri: GRAPHQL_URL })]),
  cache: new InMemoryCache(),
})
