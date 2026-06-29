import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { ApolloLink, split } from '@apollo/client/link'
import { HttpLink } from '@apollo/client/link/http'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'

const httpUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/graphql'
const wsUrl = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3001/graphql'

const httpLink = new HttpLink({ uri: httpUrl, credentials: 'include' })

const wsLink = new GraphQLWsLink(
  createClient({
    url: wsUrl,
    connectionParams: () => {
      const token = localStorage.getItem('accessToken')
      return token ? { authorization: `Bearer ${token}` } : {}
    },
  }),
)

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('accessToken')
  operation.setContext(({ headers = {} }: { headers: Record<string, string> }) => ({
    headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) },
  }))
  return forward(operation)
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  authLink.concat(httpLink),
)

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})
