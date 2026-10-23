import { useCallback, useMemo } from 'react'
import { useApolloClient, useQuery } from '@apollo/client/react'
import { SESSION } from '../graphql/queries'
import { setToken } from '../lib/session'
import { SessionContext } from './context'

// Who is using the app and which household they see. Without a session the API
// answers with the read-only demo household.
export default function SessionProvider({ children }) {
  const client = useApolloClient()
  const { data, loading } = useQuery(SESSION)

  const signIn = useCallback(async (token) => {
    setToken(token)
    await client.resetStore()
  }, [client])

  const signOut = useCallback(async () => {
    setToken(null)
    await client.resetStore()
  }, [client])

  const value = useMemo(() => ({
    me: data?.me ?? null,
    household: data?.household ?? null,
    loading,
    signIn,
    signOut,
  }), [data, loading, signIn, signOut])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
