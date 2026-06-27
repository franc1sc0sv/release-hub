import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { ApolloLink } from '@apollo/client/link'
import { HttpLink } from '@apollo/client/link/http'

const httpLink = new HttpLink({ uri: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/graphql' })

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('accessToken')
  operation.setContext(({ headers = {} }: { headers: Record<string, string> }) => ({
    headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) },
  }))
  return forward(operation)
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})
