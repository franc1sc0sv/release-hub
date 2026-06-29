import { useCallback, useRef, useState } from 'react'
import { useApolloClient } from '@apollo/client/react'
import { GENERATE_SUMMARY } from '../graphql/releases.queries'

type SummaryState =
  | { status: 'idle' }
  | { status: 'streaming'; text: string }
  | { status: 'done'; text: string }
  | { status: 'error'; message: string }

interface UseGenerateSummaryResult {
  state: SummaryState
  generate: (releaseId: string, model: string, tone: string, featureIds?: string[]) => void
  cancel: () => void
  reset: () => void
}

export function useGenerateSummary(): UseGenerateSummaryResult {
  const client = useApolloClient()
  const [state, setState] = useState<SummaryState>({ status: 'idle' })
  const cancelRef = useRef<(() => void) | null>(null)

  const cancel = useCallback(() => {
    cancelRef.current?.()
    cancelRef.current = null
    setState((prev) =>
      prev.status === 'streaming' ? { status: 'done', text: prev.text } : prev,
    )
  }, [])

  const reset = useCallback(() => {
    cancelRef.current?.()
    cancelRef.current = null
    setState({ status: 'idle' })
  }, [])

  const generate = useCallback(
    (releaseId: string, model: string, tone: string, featureIds?: string[]) => {
      cancelRef.current?.()
      cancelRef.current = null
      setState({ status: 'streaming', text: '' })

      const observable = client.subscribe({
        query: GENERATE_SUMMARY,
        variables: { input: { releaseId, model, tone, featureIds } },
      })

      let accumulated = ''

      const subscription = observable.subscribe({
        next({ data }) {
          if (!data) return
          const { chunk, done } = data.generateSummary
          accumulated += chunk
          if (done) {
            setState({ status: 'done', text: accumulated })
            cancelRef.current = null
          } else {
            setState({ status: 'streaming', text: accumulated })
          }
        },
        error(err: unknown) {
          setState({
            status: 'error',
            message: err instanceof Error ? err.message : String(err),
          })
          cancelRef.current = null
        },
      })

      cancelRef.current = () => subscription.unsubscribe()
    },
    [client],
  )

  return { state, generate, cancel, reset }
}
